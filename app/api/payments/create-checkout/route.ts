import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@/payload.config";

/**
 * POST /api/payments/create-checkout
 * ====================================
 * Creates a payment session. Detects gateway from currency/locale:
 *   - Stripe: USD, EUR, GBP → international tourists
 *   - Flutterwave: RWF, MTN MoMo → local users
 *
 * Body: {
 *   type: "subscription" | "one_time" | "day_pass",
 *   plan?: "monthly" | "annual",
 *   storyId?: string,
 *   routeId?: string,
 *   currency?: "USD" | "RWF",
 *   gateway?: "stripe" | "flutterwave",
 *   successUrl: string,
 *   cancelUrl: string,
 * }
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { user } = await payload.verifyToken({ collection: "users", token });
  if (!user) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const body = await req.json();
  const {
    type,
    plan,
    storyId,
    routeId,
    currency = "USD",
    gateway: requestedGateway,
    successUrl,
    cancelUrl,
  } = body;

  // Auto-detect gateway from currency if not specified
  const gateway = requestedGateway || (currency === "RWF" ? "flutterwave" : "stripe");

  // Fetch pricing from global settings
  const settings = await payload.findGlobal({ slug: "site-settings" });
  const pricing = (settings as any).pricing || {};

  let amount: number;
  let description: string;

  switch (type) {
    case "subscription":
      amount = plan === "annual" ? (pricing.annualPrice || 79.99) : (pricing.monthlyPrice || 9.99);
      description = `Muraho Rwanda ${plan === "annual" ? "Annual" : "Monthly"} Subscription`;
      break;

    case "one_time":
      if (storyId) {
        const story = await payload.findByID({ collection: "stories", id: storyId });
        amount = (story as any).price || pricing.minimumStoryPrice || 1.99;
        description = `Unlock: ${typeof story.title === "string" ? story.title : (story.title as any)?.en}`;
      } else if (routeId) {
        const route = await payload.findByID({ collection: "routes", id: routeId });
        amount = (route as any).price || 4.99;
        description = `Unlock Route: ${typeof route.name === "string" ? route.name : (route.name as any)?.en}`;
      } else {
        return NextResponse.json({ error: "storyId or routeId required" }, { status: 400 });
      }
      break;

    case "day_pass":
      amount = pricing.dayPassPrice || 4.99;
      description = "Muraho Rwanda Day Pass";
      break;

    default:
      return NextResponse.json({ error: "Invalid payment type" }, { status: 400 });
  }

  // Record pending payment
  const payment = await payload.create({
    collection: "payments",
    data: {
      user: user.id,
      paymentType: type,
      amount,
      currency,
      gateway,
      status: "pending",
      purchasedStory: storyId || undefined,
      purchasedRoute: routeId || undefined,
    },
  });

  if (gateway === "stripe") {
    // Build Stripe checkout session
    const checkoutData = {
      paymentId: payment.id,
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: currency.toLowerCase(),
      description,
      successUrl: `${successUrl}?payment_id=${payment.id}`,
      cancelUrl,
      customerEmail: (user as any).email,
      metadata: {
        paymentId: payment.id,
        userId: user.id,
        type,
        plan: plan || "",
        storyId: storyId || "",
        routeId: routeId || "",
      },
    };

    // In production: call Stripe SDK
    // const session = await stripe.checkout.sessions.create({...});
    return NextResponse.json({
      gateway: "stripe",
      paymentId: payment.id,
      // checkoutUrl: session.url,
      checkoutData, // Frontend creates Stripe session client-side
    });

  } else {
    // Build Flutterwave payment
    const flutterwaveData = {
      paymentId: payment.id,
      amount,
      currency,
      description,
      redirect_url: `${successUrl}?payment_id=${payment.id}`,
      customer: {
        email: (user as any).email,
        name: (user as any).fullName || "",
      },
      meta: {
        paymentId: payment.id,
        userId: user.id,
        type,
      },
    };

    // In production: call Flutterwave SDK
    // const response = await flw.Charge.create({...});
    return NextResponse.json({
      gateway: "flutterwave",
      paymentId: payment.id,
      flutterwaveData, // Frontend initiates Flutterwave payment
    });
  }
}
