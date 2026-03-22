import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

// GET /api/auth/session — returns full session with access info
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ user: null, accessTier: "free", hasSubscription: false });
  }

  try {
    const { user } = await payload.verifyToken({ collection: "users", token });
    if (!user) {
      return NextResponse.json({ user: null, accessTier: "free", hasSubscription: false });
    }

    // Check active subscription
    const subscriptions = await payload.find({
      collection: "subscriptions",
      where: {
        user: { equals: user.id },
        status: { in: ["active", "trial"] },
      },
      limit: 1,
    });

    const hasSubscription = subscriptions.docs.length > 0;

    // Check active tour group access
    const now = new Date().toISOString();
    const accessCodes = await payload.find({
      collection: "access-codes",
      where: {
        "redemptions.user": { equals: user.id },
        "redemptions.expiresAt": { greater_than: now },
      },
      limit: 1,
    });

    const tourGroupAccess = accessCodes.docs.length > 0
      ? {
          code: accessCodes.docs[0].code,
          grantsAccess: accessCodes.docs[0].grantsAccess,
          expiresAt: accessCodes.docs[0].expiresAt,
        }
      : null;

    // Check purchased content
    const purchases = await payload.find({
      collection: "payments",
      where: {
        user: { equals: user.id },
        status: { equals: "completed" },
        paymentType: { equals: "one_time" },
      },
      limit: 100,
    });

    const purchasedContent = purchases.docs
      .map((p: any) => p.purchasedStory?.id || p.purchasedRoute?.id)
      .filter(Boolean);

    // Determine effective access tier
    let accessTier = user.accessTier || "free";
    if (hasSubscription) accessTier = "subscriber";
    else if (tourGroupAccess) accessTier = "agency";

    const { password: _, salt, hash, ...safeUser } = user as any;

    return NextResponse.json({
      user: safeUser,
      accessTier,
      hasSubscription,
      tourGroupAccess,
      purchasedContent,
      subscription: hasSubscription ? subscriptions.docs[0] : null,
    });
  } catch {
    return NextResponse.json({ user: null, accessTier: "free", hasSubscription: false });
  }
}
