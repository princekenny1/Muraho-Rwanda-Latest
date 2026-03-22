/**
 * /api/payments/create-checkout — Payment Checkout Session Creator
 * ================================================================
 * Creates Stripe Checkout sessions (international) or Flutterwave payment links (local RW).
 *
 * Body:
 *   type: "subscription" | "one_time" | "day_pass" | "agency"
 *   plan?: "monthly" | "annual"
 *   gateway: "stripe" | "flutterwave"
 *   amount?: number (cents, for one_time)
 *   contentId?: string (for one_time content unlock)
 *   agencyId?: string (for agency purchases)
 *   returnUrl: string
 *
 * Returns:
 *   { checkoutUrl: string, sessionId: string, gateway: string }
 */

import type { PayloadHandler } from "payload";

// ── Price config ─────────────────────────────────────────

const PRICES = {
  subscription: {
    monthly: { usd: 999, rwf: 9_900, label: "Muraho Rwanda Monthly" },
    annual: { usd: 7999, rwf: 79_900, label: "Muraho Rwanda Annual" },
  },
  day_pass: { usd: 499, rwf: 4_900, label: "Muraho Rwanda Day Pass" },
} as const;

// ── Stripe Checkout ──────────────────────────────────────

async function createStripeCheckout(params: {
  type: string;
  plan?: string;
  amount?: number;
  contentId?: string;
  agencyId?: string;
  userId: string;
  userEmail: string;
  returnUrl: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) throw new Error("Stripe not configured");

  const baseUrl = process.env.APP_URL || "https://muraho.rw";
  const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/payment/cancel`;

  // Build line items based on purchase type
  let lineItems: any[];
  let mode: "payment" | "subscription" = "payment";
  const metadata: Record<string, string> = {
    userId: params.userId,
    purchaseType: params.type,
  };

  if (params.type === "subscription") {
    mode = "subscription";
    const plan = params.plan === "annual" ? "annual" : "monthly";
    const price = PRICES.subscription[plan];
    metadata.plan = plan;

    lineItems = [{
      price_data: {
        currency: "usd",
        product_data: { name: price.label },
        unit_amount: price.usd,
        recurring: { interval: plan === "annual" ? "year" : "month" },
      },
      quantity: 1,
    }];
  } else if (params.type === "day_pass") {
    lineItems = [{
      price_data: {
        currency: "usd",
        product_data: { name: PRICES.day_pass.label },
        unit_amount: PRICES.day_pass.usd,
      },
      quantity: 1,
    }];
  } else if (params.type === "one_time" && params.amount) {
    metadata.contentId = params.contentId || "";
    lineItems = [{
      price_data: {
        currency: "usd",
        product_data: { name: "Content Unlock" },
        unit_amount: params.amount,
      },
      quantity: 1,
    }];
  } else if (params.type === "agency" && params.agencyId) {
    metadata.agencyId = params.agencyId;
    lineItems = [{
      price_data: {
        currency: "usd",
        product_data: { name: "Agency Access Codes" },
        unit_amount: params.amount || 1500,
      },
      quantity: 1,
    }];
  } else {
    throw new Error("Invalid purchase configuration");
  }

  // Create Stripe Checkout session via API
  const body = new URLSearchParams();
  body.append("mode", mode);
  body.append("success_url", successUrl);
  body.append("cancel_url", cancelUrl);
  body.append("customer_email", params.userEmail);

  lineItems.forEach((item, i) => {
    if (item.price_data) {
      body.append(`line_items[${i}][price_data][currency]`, item.price_data.currency);
      body.append(`line_items[${i}][price_data][product_data][name]`, item.price_data.product_data.name);
      body.append(`line_items[${i}][price_data][unit_amount]`, String(item.price_data.unit_amount));
      if (item.price_data.recurring) {
        body.append(`line_items[${i}][price_data][recurring][interval]`, item.price_data.recurring.interval);
      }
    }
    body.append(`line_items[${i}][quantity]`, String(item.quantity));
  });

  Object.entries(metadata).forEach(([key, value]) => {
    body.append(`metadata[${key}]`, value);
  });

  const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.error?.message || "Stripe session creation failed");
  }

  const session = await resp.json();
  return { checkoutUrl: session.url, sessionId: session.id };
}

// ── Flutterwave Payment Link ─────────────────────────────

async function createFlutterwaveCheckout(params: {
  type: string;
  plan?: string;
  amount?: number;
  userId: string;
  userEmail: string;
  returnUrl: string;
}): Promise<{ checkoutUrl: string; sessionId: string }> {
  const flwKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!flwKey) throw new Error("Flutterwave not configured");

  const baseUrl = process.env.APP_URL || "https://muraho.rw";
  const txRef = `mrw-${params.type}-${params.userId}-${Date.now()}`;

  // Calculate amount in RWF
  let amount: number;
  let description: string;

  if (params.type === "subscription") {
    const plan = params.plan === "annual" ? "annual" : "monthly";
    amount = PRICES.subscription[plan].rwf;
    description = PRICES.subscription[plan].label;
  } else if (params.type === "day_pass") {
    amount = PRICES.day_pass.rwf;
    description = PRICES.day_pass.label;
  } else {
    amount = params.amount || 5000;
    description = "Content Access";
  }

  const resp = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${flwKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency: "RWF",
      redirect_url: `${baseUrl}/payment/success?ref=${txRef}`,
      customer: { email: params.userEmail },
      payment_options: "mobilemoneyrwanda,card",
      customizations: {
        title: "Muraho Rwanda",
        description,
        logo: `${baseUrl}/logo.png`,
      },
      meta: {
        userId: params.userId,
        purchaseType: params.type,
        plan: params.plan || "",
      },
    }),
  });

  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.message || "Flutterwave payment link failed");
  }

  const data = await resp.json();
  return {
    checkoutUrl: data.data?.link || "",
    sessionId: txRef,
  };
}

// ── Main Handler ─────────────────────────────────────────

export const createCheckout: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json?.() || req.body;
    const {
      type,
      plan,
      gateway = "stripe",
      amount,
      contentId,
      agencyId,
      returnUrl = "/",
    } = body;

    if (!type || !["subscription", "one_time", "day_pass", "agency"].includes(type)) {
      return Response.json(
        { error: "Invalid type. Must be: subscription, one_time, day_pass, agency" },
        { status: 400 }
      );
    }

    // Log payment attempt
    req.payload.logger.info(
      `Payment checkout: type=${type}, gateway=${gateway}, user=${user.id}`
    );

    let result: { checkoutUrl: string; sessionId: string };

    if (gateway === "flutterwave") {
      result = await createFlutterwaveCheckout({
        type, plan, amount, userId: user.id, userEmail: user.email, returnUrl,
      });
    } else {
      result = await createStripeCheckout({
        type, plan, amount, contentId, agencyId,
        userId: user.id, userEmail: user.email, returnUrl,
      });
    }

    return Response.json({
      checkoutUrl: result.checkoutUrl,
      sessionId: result.sessionId,
      gateway,
    });
  } catch (err: any) {
    req.payload.logger.error(`Payment checkout error: ${err.message}`);
    return Response.json(
      { error: err.message || "Payment service error" },
      { status: 500 }
    );
  }
};
