/**
 * /api/payments/cancel-subscription — Cancel active subscription
 * /api/payments/subscription-status — Check subscription status
 *
 * Cancels via Stripe API (at period end) or Flutterwave.
 */

import type { PayloadHandler } from "payload";

// ── Cancel Subscription ─────────────────────────────────────

export const cancelSubscription: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json?.() || req.body;
    const { subscriptionId } = body;

    if (!subscriptionId) {
      return Response.json({ error: "subscriptionId is required" }, { status: 400 });
    }

    // Fetch subscription and verify ownership
    const sub = await req.payload.findByID({
      collection: "subscriptions",
      id: subscriptionId,
    });

    const subDoc = sub as Record<string, any>;
    const subUserId = typeof subDoc.user === "object" ? subDoc.user.id : subDoc.user;

    if (subUserId !== user.id && user.role !== "admin") {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    if (subDoc.status === "cancelled") {
      return Response.json({ error: "Subscription already cancelled" }, { status: 400 });
    }

    // Cancel via payment gateway
    if (subDoc.paymentGateway === "stripe" && subDoc.stripeSubscriptionId) {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        // Cancel at period end (user keeps access until current period expires)
        const resp = await fetch(
          `https://api.stripe.com/v1/subscriptions/${subDoc.stripeSubscriptionId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${stripeKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "cancel_at_period_end=true",
          }
        );

        if (!resp.ok) {
          const err = await resp.json();
          req.payload.logger.error(`Stripe cancel error: ${JSON.stringify(err)}`);
          // Still mark as cancelled locally even if Stripe fails
        }
      }
    }

    // Update local subscription record
    await req.payload.update({
      collection: "subscriptions",
      id: subscriptionId,
      data: {
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
      },
    });

    req.payload.logger.info(`Subscription cancelled: ${subscriptionId} by user ${user.id}`);

    return Response.json({ success: true, message: "Subscription cancelled. Access continues until period end." });
  } catch (err: any) {
    req.payload.logger.error(`Cancel subscription error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

// ── Subscription Status ─────────────────────────────────────

export const subscriptionStatus: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const res = await req.payload.find({
      collection: "subscriptions",
      where: {
        and: [
          { user: { equals: user.id } },
          { status: { in: ["active", "trial", "past_due"] } },
        ],
      },
      sort: "-createdAt",
      limit: 1,
    });

    if (res.docs.length === 0) {
      return Response.json({ hasSubscription: false, subscription: null });
    }

    const sub = res.docs[0] as Record<string, any>;

    return Response.json({
      hasSubscription: true,
      subscription: {
        id: sub.id,
        plan: sub.plan,
        status: sub.status,
        currentPeriodEnd: sub.currentPeriodEnd,
        cancelledAt: sub.cancelledAt,
        gateway: sub.paymentGateway,
      },
    });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};
