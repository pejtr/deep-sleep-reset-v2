import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { createEmailJob, getUserByOpenId, recordFunnelEvent, upsertPurchaseFromStripe, upsertUser } from "./db";
import { getPrimaryProduct } from "./products";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey)
  : null;

export function getPriceIdFromEnv() {
  return process.env.STRIPE_PRICE_ID ?? process.env.STRIPE_DEFAULT_PRICE_ID ?? "";
}

export async function createCheckoutSession(input: {
  user: {
    id: number;
    name: string | null;
    email: string | null;
  };
  origin: string;
}) {
  if (!stripe) {
    throw new Error("Stripe is not configured.");
  }

  const product = getPrimaryProduct();
  const priceId = getPriceIdFromEnv();
  if (!priceId) {
    throw new Error("Missing STRIPE_PRICE_ID or STRIPE_DEFAULT_PRICE_ID.");
  }

  const session = await stripe.checkout.sessions.create({
    mode: product.mode,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    customer_email: input.user.email ?? undefined,
    client_reference_id: String(input.user.id),
    metadata: {
      user_id: String(input.user.id),
      customer_email: input.user.email ?? "",
      customer_name: input.user.name ?? "",
      product_key: product.key,
    },
    success_url: `${input.origin}${product.successPath}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}${product.cancelPath}`,
  });

  await recordFunnelEvent({
    userId: input.user.id,
    email: input.user.email,
    eventType: "checkout_started",
    detail: `Stripe checkout session created: ${session.id}`,
  });

  return session;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = Number(session.metadata?.user_id ?? session.client_reference_id ?? 0);
  if (!userId) return;

  await upsertPurchaseFromStripe({
    userId,
    productKey: session.metadata?.product_key ?? getPrimaryProduct().key,
    purchaseType: session.mode === "payment" ? "one_time" : "subscription",
    status: session.mode === "payment" ? "paid" : "active",
    stripeCheckoutSessionId: session.id,
    stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
    stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
  });

  await createEmailJob({
    userId,
    email: session.customer_details?.email ?? session.metadata?.customer_email ?? "",
    eventType: "purchase",
    subject: "DeepSleepReset purchase confirmed",
    body: "Your premium access to DeepSleepReset is active. Petra and the members area are ready for you.",
  });

  await recordFunnelEvent({
    userId,
    email: session.customer_details?.email ?? session.metadata?.customer_email ?? null,
    eventType: "checkout_completed",
    detail: `Checkout completed: ${session.id}`,
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const invoiceLike = invoice as Stripe.Invoice & {
    subscription?: string | null;
    payment_intent?: string | null;
  };

  const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === "string"
    ? invoice.parent.subscription_details.subscription
    : typeof invoiceLike.subscription === "string"
      ? invoiceLike.subscription
      : null;

  if (!subscriptionId) return;

  const customerEmail = invoice.customer_email ?? null;
  const userId = Number(invoice.lines.data[0]?.metadata?.user_id ?? 0);
  if (!userId) return;

  await upsertPurchaseFromStripe({
    userId,
    productKey: getPrimaryProduct().key,
    purchaseType: "subscription",
    status: "active",
    stripeCustomerId: typeof invoice.customer === "string" ? invoice.customer : null,
    stripeSubscriptionId: subscriptionId,
    stripePaymentIntentId: typeof invoiceLike.payment_intent === "string" ? invoiceLike.payment_intent : null,
  });

  if (customerEmail) {
    await createEmailJob({
      userId,
      email: customerEmail,
      eventType: "purchase",
      subject: "DeepSleepReset subscription renewed",
      body: "Your DeepSleepReset premium subscription remains active.",
    });
  }
}

async function handleCustomerCreated(customer: Stripe.Customer) {
  if (!customer.email) return;
  await createEmailJob({
    email: customer.email,
    eventType: "signup",
    subject: "Welcome to DeepSleepReset",
    body: "Your DeepSleepReset account is ready. Complete checkout to unlock premium access.",
  });
}

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe || !stripeWebhookSecret) {
    return res.status(500).send("Stripe webhook not configured");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    console.error("[StripeWebhook] signature verification failed", error);
    return res.status(400).send("Invalid signature");
  }

  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "customer.created":
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;
      default:
        console.log(`[StripeWebhook] Ignored event ${event.type}`);
        break;
    }

    console.log(`[StripeWebhook] Processed ${event.type} (${event.id}) at ${new Date().toISOString()}`);
    return res.json({ received: true });
  } catch (error) {
    console.error("[StripeWebhook] processing error", error);
    return res.status(500).send("Webhook processing failed");
  }
}

export function registerStripeWebhook(app: Express) {
  app.post("/api/stripe/webhook", handleStripeWebhook);
}
