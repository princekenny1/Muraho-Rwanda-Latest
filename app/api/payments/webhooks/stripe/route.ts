import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * POST /api/payments/webhooks/stripe
 * ====================================
 * Handles Stripe webhook events:
 *   - checkout.session.completed → activate access
 *   - invoice.paid → renew subscription
 *   - customer.subscription.deleted → cancel subscription
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });

  // In production: verify Stripe webhook signature
  // const sig = req.headers.get("stripe-signature");
  // const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

  const event = await req.json();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const { paymentId, userId, type, plan, storyId, routeId } = session.metadata;

        // Mark payment completed
        await payload.update({
          collection: "payments",
          id: paymentId,
          data: {
            status: "completed",
            stripePaymentIntentId: session.payment_intent,
          },
        });

        // Grant access based on payment type
        if (type === "subscription") {
          await payload.create({
            collection: "subscriptions",
            data: {
              user: userId,
              plan: plan || "monthly",
              status: "active",
              stripeSubscriptionId: session.subscription,
              stripeCustomerId: session.customer,
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: calculatePeriodEnd(plan).toISOString(),
              paymentGateway: "stripe",
            },
          });

          await payload.update({
            collection: "users",
            id: userId,
            data: { accessTier: "subscriber" },
          });
        } else if (type === "day_pass") {
          await payload.update({
            collection: "users",
            id: userId,
            data: { accessTier: "day_pass" },
          });
        }
        // one_time purchases: payment record links to content — checked at access time
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        const subs = await payload.find({
          collection: "subscriptions",
          where: { stripeSubscriptionId: { equals: subscriptionId } },
          limit: 1,
        });

        if (subs.docs.length > 0) {
          const sub = subs.docs[0] as any;
          await payload.update({
            collection: "subscriptions",
            id: sub.id,
            data: {
              status: "active",
              currentPeriodStart: new Date().toISOString(),
              currentPeriodEnd: calculatePeriodEnd(sub.plan).toISOString(),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        const subs = await payload.find({
          collection: "subscriptions",
          where: { stripeSubscriptionId: { equals: subscription.id } },
          limit: 1,
        });

        if (subs.docs.length > 0) {
          const sub = subs.docs[0] as any;
          await payload.update({
            collection: "subscriptions",
            id: sub.id,
            data: {
              status: "cancelled",
              cancelledAt: new Date().toISOString(),
            },
          });

          await payload.update({
            collection: "users",
            id: sub.user?.id || sub.user,
            data: { accessTier: "free" },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function calculatePeriodEnd(plan: string): Date {
  const end = new Date();
  if (plan === "annual") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}
