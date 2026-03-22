import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";
import crypto from "crypto";

/**
 * POST /api/agencies/codes/generate
 * ===================================
 * Agency self-service code generation.
 * Generates batch access codes for tour groups.
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = await payload.verifyToken({ collection: "users", token });
  if (!user || (user as any).role !== "agency_operator") {
    return NextResponse.json({ error: "Agency access required" }, { status: 403 });
  }

  const body = await req.json();
  const {
    count = 1,
    codeType = "tour_group",
    grantsAccess = "full",
    maxUses = 30,
    durationDays = 1,
    routeId,
    museumId,
    prefix = "TOUR",
  } = body;

  const agencyId = (user as any).agency;
  if (!agencyId) {
    return NextResponse.json({ error: "No agency linked to this account" }, { status: 400 });
  }

  // Check agency limits
  const agency = await payload.findByID({ collection: "agencies", id: agencyId });
  const tierLimits: Record<string, number> = {
    basic: 50,
    professional: 200,
    enterprise: 99999,
  };
  const monthlyLimit = tierLimits[(agency as any).tier] || 50;

  // Count codes generated this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const existingCodes = await payload.find({
    collection: "access-codes",
    where: {
      agency: { equals: agencyId },
      createdAt: { greater_than: monthStart.toISOString() },
    },
    limit: 0,
  });

  if (existingCodes.totalDocs + count > monthlyLimit) {
    return NextResponse.json(
      {
        error: "Monthly code limit reached",
        limit: monthlyLimit,
        used: existingCodes.totalDocs,
        remaining: monthlyLimit - existingCodes.totalDocs,
      },
      { status: 429 }
    );
  }

  // Generate codes
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90); // Codes valid for 90 days

  const generatedCodes: any[] = [];
  for (let i = 0; i < count; i++) {
    const code = `${prefix}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const created = await payload.create({
      collection: "access-codes",
      data: {
        code,
        codeType,
        agency: agencyId,
        grantsAccess,
        grantedRoute: routeId || undefined,
        grantedMuseum: museumId || undefined,
        maxUses,
        durationDays,
        expiresAt: expiresAt.toISOString(),
      },
    });

    generatedCodes.push({
      id: created.id,
      code: created.code,
      expiresAt: expiresAt.toISOString(),
      maxUses,
    });
  }

  // Update agency active codes count
  await payload.update({
    collection: "agencies",
    id: agencyId,
    data: {
      activeCodesCount: existingCodes.totalDocs + count,
    },
  });

  return NextResponse.json({
    generated: generatedCodes.length,
    codes: generatedCodes,
    remaining: monthlyLimit - existingCodes.totalDocs - count,
  });
}

/**
 * GET /api/agencies/analytics
 * =============================
 * Usage analytics for the agency dashboard.
 */
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = await payload.verifyToken({ collection: "users", token });
  if (!user || (user as any).role !== "agency_operator") {
    return NextResponse.json({ error: "Agency access required" }, { status: 403 });
  }

  const agencyId = (user as any).agency;

  // Get all codes for this agency
  const codes = await payload.find({
    collection: "access-codes",
    where: { agency: { equals: agencyId } },
    limit: 500,
  });

  // Calculate analytics
  const totalCodes = codes.docs.length;
  const totalRedemptions = codes.docs.reduce(
    (sum: number, c: any) => sum + (c.usedCount || 0), 0
  );
  const activeCodes = codes.docs.filter(
    (c: any) => !c.expiresAt || new Date(c.expiresAt) > new Date()
  ).length;

  // Revenue from agency payments
  const payments = await payload.find({
    collection: "payments",
    where: {
      agency: { equals: agencyId },
      status: { equals: "completed" },
    },
    limit: 0,
  });

  return NextResponse.json({
    totalCodes,
    activeCodes,
    totalRedemptions,
    totalPayments: payments.totalDocs,
    recentCodes: codes.docs.slice(0, 10).map((c: any) => ({
      code: c.code,
      type: c.codeType,
      used: c.usedCount,
      max: c.maxUses,
      expires: c.expiresAt,
    })),
  });
}
