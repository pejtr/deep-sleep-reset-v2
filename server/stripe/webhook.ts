/**
 * Stripe Webhook Handler
 * Registered at /api/stripe/webhook
 */
import type { Request, Response } from "express";
import Stripe from "stripe";
import { getStripe } from "./stripe";
import { getDb } from "../db";
import { orders } from "../../drizzle/schema";
import type { ProductKey } from "./products";
import { notifyOwner } from "../_core/notification";
import { sendPurchaseEmail } from "../email";

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[Webhook] Missing signature or webhook secret");
    return res.status(400).json({ error: "Missing signature or webhook secret" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle test events for webhook verification
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Error processing ${event.type}:`, err);
    // Still return 200 to prevent Stripe from retrying
  }

  return res.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Database not available");
    return;
  }

  const productKey = (session.metadata?.productKey || "frontEnd") as ProductKey;
  const customerEmail = session.customer_email || session.customer_details?.email || null;
  const customerName = session.customer_details?.name || null;
  const amountCents = session.amount_total || 0;
  const currency = session.currency || "usd";

  // 1. Record order in DB
  await db.insert(orders).values({
    stripeSessionId: session.id,
    stripePaymentIntentId: typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null,
    customerEmail,
    productKey,
    amountCents,
    currency,
    status: "completed",
  });

  console.log(
    `[Webhook] Order recorded: ${productKey} — $${(amountCents / 100).toFixed(2)} — ${customerEmail || "no email"}`
  );

  // 2. Notify owner about the sale
  const productLabels: Record<ProductKey, string> = {
    frontEnd: "7-Night Deep Sleep Reset ($5)",
    exitDiscount: "7-Night Deep Sleep Reset — Exit Discount ($4)",
    upsell1: "Anxiety Dissolve Audio Pack ($10)",
    upsell2: "Sleep Optimizer Toolkit ($10)",
  };

  await notifyOwner({
    title: `💰 New Sale: ${productLabels[productKey]}`,
    content: `Customer: ${customerName || "Unknown"}\nEmail: ${customerEmail || "N/A"}\nProduct: ${productLabels[productKey]}\nAmount: $${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}\nSession: ${session.id}`,
  }).catch(err => console.warn("[Webhook] Owner notification failed:", err));

  // 3. Send welcome email to customer (if email available)
  if (customerEmail) {
    await sendPurchaseEmail({
      to: customerEmail,
      name: customerName || undefined,
      productKey,
      amountCents,
    }).catch(err => console.warn("[Webhook] Customer email failed:", err));
  }
}
