/**
 * /api/access-codes/redeem — Access Code Redemption
 * ==================================================
 * Validates and redeems a tour group access code for the authenticated user.
 * Creates UserContentAccess and CodeRedemption records, increments code usesCount.
 *
 * Body: { code: string }
 * Returns: { success: true, accessLevel, expiresAt, agencyName }
 *          { success: false, error: string } with 400/401/422
 */

import type { PayloadHandler } from "payload";

export const redeemCode: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user) {
    return Response.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json?.()) || (req as any).body || {};
    const code = (body.code || "").toString().trim().toUpperCase();

    if (!code) {
      return Response.json(
        { success: false, error: "Code is required" },
        { status: 400 }
      );
    }

    // Find access code
    const codesRes = await req.payload.find({
      collection: "access-codes",
      where: { code: { equals: code } },
      limit: 1,
      depth: 1,
    });

    const codeDoc = codesRes.docs[0] as Record<string, any> | undefined;
    if (!codeDoc) {
      return Response.json(
        { success: false, error: "Invalid or expired code" },
        { status: 404 }
      );
    }

    if (!codeDoc.isActive) {
      return Response.json(
        { success: false, error: "This code is no longer active" },
        { status: 422 }
      );
    }

    const maxUses = codeDoc.maxUses ?? 100;
    const usesCount = codeDoc.usesCount ?? 0;
    if (usesCount >= maxUses) {
      return Response.json(
        { success: false, error: "This code has reached its maximum redemptions" },
        { status: 422 }
      );
    }

    const now = new Date();
    const expiresAt = codeDoc.expiresAt ? new Date(codeDoc.expiresAt) : null;
    if (expiresAt && expiresAt < now) {
      return Response.json(
        { success: false, error: "This code has expired" },
        { status: 422 }
      );
    }

    const startsAt = codeDoc.startsAt ? new Date(codeDoc.startsAt) : null;
    if (startsAt && startsAt > now) {
      return Response.json(
        { success: false, error: "This code is not yet valid" },
        { status: 422 }
      );
    }

    // Check if user already redeemed this code
    const existingAccess = await req.payload.find({
      collection: "user-content-access",
      where: {
        and: [
          { user: { equals: user.id } },
          { accessType: { equals: "tour_code" } },
          { agencyCode: { equals: codeDoc.id } },
          {
            or: [
              { expiresAt: { exists: false } },
              { expiresAt: { greater_than: now.toISOString() } },
            ],
          },
        ],
      },
      limit: 1,
    });

    if (existingAccess.docs.length > 0) {
      const existing = existingAccess.docs[0] as Record<string, any>;
      const exp = existing.expiresAt ? new Date(existing.expiresAt) : null;
      const agency = typeof codeDoc.agency === "object" ? codeDoc.agency : null;
      return Response.json({
        success: true,
        accessLevel: codeDoc.accessLevel ?? "full",
        expiresAt: exp?.toISOString() ?? new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(),
        agencyName: agency?.name ?? "Tour Group",
      });
    }

    // Compute expiry (validHours or 48h default)
    const validHours = codeDoc.validHours ?? 48;
    const accessExpiresAt = new Date(now.getTime() + validHours * 60 * 60 * 1000);

    // Create user content access
    const accessDoc = await req.payload.create({
      collection: "user-content-access",
      data: {
        user: user.id,
        accessType: "tour_code",
        contentType: null,
        contentId: null,
        agencyCode: codeDoc.id,
        expiresAt: accessExpiresAt.toISOString(),
      },
    });

    // Create code redemption record
    await req.payload.create({
      collection: "code-redemptions",
      data: {
        code: codeDoc.id,
        user: user.id,
        access: (accessDoc as any).id,
        redeemedAt: now.toISOString(),
      },
    });

    // Increment usesCount on the access code
    await req.payload.update({
      collection: "access-codes",
      id: codeDoc.id,
      data: { usesCount: usesCount + 1 },
    });

    const agency = typeof codeDoc.agency === "object" ? codeDoc.agency : null;

    req.payload.logger?.info?.(`Code redeemed: ${code} by user ${user.id}`);

    return Response.json({
      success: true,
      accessLevel: codeDoc.accessLevel ?? "full",
      expiresAt: accessExpiresAt.toISOString(),
      agencyName: agency?.name ?? "Tour Group",
    });
  } catch (err: any) {
    req.payload.logger?.error?.(`Redeem code error: ${err.message}`);
    return Response.json(
      { success: false, error: err.message || "Failed to redeem code" },
      { status: 500 }
    );
  }
};
