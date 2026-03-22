/**
 * /api/webhooks/stripe — Stripe webhook handler
 * /api/webhooks/flutterwave — Flutterwave webhook handler
 *
 * Handles: subscription created/renewed/cancelled, one-time payments, agency purchases
 */
import type { PayloadHandler } from "payload";
import crypto from "crypto";

// ── Stripe Webhook ───────────────────────────────────────
export const stripeWebhook: PayloadHandler = async (req) => {
  try {
    const sig = (req as any).headers?.get?.("stripe-signature") ?? (req as any).headers?.["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!sig || !secret) return Response.json({ error: "Missing signature or secret" }, { status: 400 });

    // Verify Stripe signature (HMAC-SHA256) — need raw body (Request.text() gives raw string)
    const rawBody = typeof (req as any).body === "string"
      ? (req as any).body
      : await (req as Request).text?.() ?? JSON.stringify((req as any).body ?? {});
    const sigParts = sig.split(",").reduce((acc: Record<string, string>, part: string) => {
      const [key, val] = part.split("=");
      acc[key.trim()] = val;
      return acc;
    }, {});

    const timestamp = sigParts["t"];
    const expectedSig = sigParts["v1"];

    if (!timestamp || !expectedSig) {
      return Response.json({ error: "Invalid signature format" }, { status: 400 });
    }

    // Reject if timestamp is older than 5 minutes (replay attack protection)
    const tolerance = 300; // 5 minutes
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (timestampAge > tolerance) {
      return Response.json({ error: "Webhook timestamp too old" }, { status: 400 });
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${rawBody}`;
    const computedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex");

    // Timing-safe comparison
    if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(computedSig))) {
      req.payload.logger?.warn?.("Stripe webhook: signature verification failed");
      return Response.json({ error: "Signature verification failed" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.type;

    req.payload.logger?.info?.(`Stripe webhook: ${eventType}`);

    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const purchaseType = session.metadata?.purchaseType; // "subscription" | "one_time" | "agency"

        if (purchaseType === "subscription") {
          // Create/activate subscription
          await req.payload.create({
            collection: "subscriptions",
            data: {
              user: userId,
              plan: session.metadata?.plan || "monthly",
              status: "active",
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: new Date(Date.now() + (session.metadata?.plan === "annual" ? 365 : 30) * 86400000).toISOString(),
              paymentGateway: "stripe",
            },
          });

          // Grant user content access
          if (userId) {
            await req.payload.create({
              collection: "user-content-access",
              data: { user: userId, accessType: "subscription", stripePaymentId: session.payment_intent },
            });
          }
        } else if (purchaseType === "agency") {
          // Agency plan purchase — handled in agency-purchases
          const agencyId = session.metadata?.agencyId;
          const planId = session.metadata?.planId;
          if (agencyId && planId) {
            await req.payload.create({
              collection: "agency-purchases",
              data: {
                agency: agencyId, plan: planId,
                quantity: parseInt(session.metadata?.quantity || "1"),
                totalPriceCents: session.amount_total,
                codesAllocated: parseInt(session.metadata?.codesAllocated || "0"),
                codesRemaining: parseInt(session.metadata?.codesAllocated || "0"),
                purchasedAt: new Date().toISOString(),
                stripePaymentId: session.payment_intent,
                status: "active",
              },
            });
          }
        }

        // Log payment
        await req.payload.create({
          collection: "payments",
          data: {
            user: userId, paymentType: purchaseType === "subscription" ? "subscription" : "one_time",
            amount: (session.amount_total || 0) / 100, currency: (session.currency || "usd").toUpperCase(),
            gateway: "stripe", status: "completed", stripePaymentIntentId: session.payment_intent,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const existing = await req.payload.find({
          collection: "subscriptions",
          where: { stripeSubscriptionId: { equals: sub.id } },
          limit: 1,
        });
        if (existing.docs[0]) {
          await req.payload.update({
            collection: "subscriptions", id: existing.docs[0].id,
            data: {
              status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "cancelled",
              currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const existing = await req.payload.find({
          collection: "subscriptions",
          where: { stripeSubscriptionId: { equals: sub.id } },
          limit: 1,
        });
        if (existing.docs[0]) {
          await req.payload.update({
            collection: "subscriptions", id: existing.docs[0].id,
            data: { status: "cancelled", cancelledAt: new Date().toISOString() },
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch (err: any) {
    req.payload.logger?.error?.(`Stripe webhook error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

// ── Flutterwave Webhook ──────────────────────────────────
export const flutterwaveWebhook: PayloadHandler = async (req) => {
  try {
    // Verify webhook signature (timing-safe comparison to prevent timing attacks)
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    const signature = (req as any).headers?.get?.("verif-hash") ?? (req as any).headers?.["verif-hash"];
    if (secretHash && signature) {
      const sigBuffer = Buffer.from(signature);
      const hashBuffer = Buffer.from(secretHash);
      if (sigBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(sigBuffer, hashBuffer)) {
        req.payload.logger?.warn?.("Flutterwave webhook: signature verification failed");
        return Response.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (secretHash && !signature) {
      return Response.json({ error: "Missing signature" }, { status: 401 });
    }

    const event = (await (req as any).json?.()) ?? (req as any).body ?? {};
    const data = event?.data;

    req.payload.logger?.info?.(`Flutterwave webhook: ${event?.event}`);

    if (event?.event === "charge.completed" && data?.status === "successful") {
      const userId = data.meta?.userId;
      const purchaseType = data.meta?.purchaseType;

      // Log payment
      await req.payload.create({
        collection: "payments",
        data: {
          user: userId,
          paymentType: purchaseType || "one_time",
          amount: data.amount,
          currency: data.currency || "RWF",
          gateway: data.payment_type === "mobilemoneygh" || data.payment_type === "mobilemoneyug"
            ? "mtn_momo" : "flutterwave",
          status: "completed",
          flutterwaveTransactionId: data.id?.toString(),
        },
      });

      // Grant access
      if (userId) {
        await req.payload.create({
          collection: "user-content-access",
          data: {
            user: userId,
            accessType: purchaseType === "subscription" ? "subscription" : "purchase",
            contentType: data.meta?.contentType,
            contentId: data.meta?.contentId,
          },
        });
      }
    }

    return Response.json({ received: true });
  } catch (err: any) {
    req.payload.logger?.error?.(`Flutterwave webhook error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
