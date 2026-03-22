import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * POST /api/access/redeem
 * ========================
 * Redeems an access code (tour group, single-use, promo, QR).
 * Called by the Lovable frontend's useContentAccess().redeemCode().
 *
 * Body: { code: string }
 * Returns: { success: boolean, access: {...}, error?: string }
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in first" },
      { status: 401 }
    );
  }

  const { user } = await payload.verifyToken({ collection: "users", token });
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Invalid session" },
      { status: 401 }
    );
  }

  const { code } = await req.json();
  if (!code?.trim()) {
    return NextResponse.json(
      { success: false, error: "Please enter a code" },
      { status: 400 }
    );
  }

  // Find the access code
  const codes = await payload.find({
    collection: "access-codes",
    where: { code: { equals: code.trim().toUpperCase() } },
    limit: 1,
  });

  if (codes.docs.length === 0) {
    return NextResponse.json(
      { success: false, error: "Invalid code. Please check and try again." },
      { status: 404 }
    );
  }

  const accessCode = codes.docs[0] as any;

  // Check expiration
  if (accessCode.expiresAt && new Date(accessCode.expiresAt) < new Date()) {
    return NextResponse.json(
      { success: false, error: "This code has expired" },
      { status: 410 }
    );
  }

  // Check not before date
  if (accessCode.validFromDate && new Date(accessCode.validFromDate) > new Date()) {
    return NextResponse.json(
      { success: false, error: "This code is not yet active" },
      { status: 400 }
    );
  }

  // Check usage limit
  if (accessCode.usedCount >= accessCode.maxUses) {
    return NextResponse.json(
      { success: false, error: "This code has reached its usage limit" },
      { status: 410 }
    );
  }

  // Check if user already redeemed this code
  const alreadyRedeemed = accessCode.redemptions?.some(
    (r: any) => r.user === user.id || r.user?.id === user.id
  );
  if (alreadyRedeemed) {
    return NextResponse.json(
      { success: false, error: "You've already redeemed this code" },
      { status: 409 }
    );
  }

  // Calculate access expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (accessCode.durationDays || 1));

  // Record redemption
  const updatedRedemptions = [
    ...(accessCode.redemptions || []),
    {
      user: user.id,
      redeemedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    },
  ];

  await payload.update({
    collection: "access-codes",
    id: accessCode.id,
    data: {
      usedCount: (accessCode.usedCount || 0) + 1,
      redemptions: updatedRedemptions,
    },
  });

  // Update user access tier if code grants full access
  if (accessCode.grantsAccess === "full" || accessCode.grantsAccess === "day_pass") {
    await payload.update({
      collection: "users",
      id: user.id,
      data: {
        accessTier: accessCode.grantsAccess === "full" ? "agency" : "day_pass",
      },
    });
  }

  // Log the payment (free via code)
  await payload.create({
    collection: "payments",
    data: {
      user: user.id,
      paymentType: "day_pass",
      amount: 0,
      currency: "USD",
      gateway: "code",
      status: "completed",
      agency: accessCode.agency || undefined,
    },
  });

  // Build response matching TourGroupAccess interface
  const agencyData = accessCode.agency
    ? await payload.findByID({ collection: "agencies", id: accessCode.agency })
    : null;

  return NextResponse.json({
    success: true,
    access: {
      code: accessCode.code,
      grantsAccess: accessCode.grantsAccess,
      expiresAt: expiresAt.toISOString(),
      agency: agencyData ? { name: agencyData.name, logo: agencyData.logo } : null,
      grantedRoute: accessCode.grantedRoute || null,
      grantedMuseum: accessCode.grantedMuseum || null,
      grantedStory: accessCode.grantedStory || null,
    },
  });
}
