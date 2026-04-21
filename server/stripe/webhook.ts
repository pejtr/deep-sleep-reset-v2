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
import { sendPurchaseEmail, getPurchaseEmailVariant, EMAIL_SUBJECT_VARIANTS } from "../email";
import { sendSaleNotificationEmail } from "../email";
import { enrollInSequence } from "../routers/emailSequence";
import { eq, sql } from "drizzle-orm";
import { fireMetaPurchase } from "../meta-capi";
import { emailAbTests } from "../../drizzle/schema";
import { reportSaleToLeadOS } from "../leadosReporter";

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
    frontEnd7: "7-Night Deep Sleep Reset ($7 — A/B test)",
    exitDiscount: "7-Night Deep Sleep Reset — Exit Discount ($4)",
    upsell1: "Anxiety Dissolve Audio Pack ($10)",
    upsell2: "Sleep Optimizer Toolkit ($10)",
    upsell3: "Advanced Sleep Mastery Protocol ($19)",
    chronotypeReport: "Personalized Chronotype Sleep Report ($9)",
  };

  await notifyOwner({
    title: `💰 New Sale: ${productLabels[productKey]}`,
    content: `Customer: ${customerName || "Unknown"}\nEmail: ${customerEmail || "N/A"}\nProduct: ${productLabels[productKey]}\nAmount: $${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}\nSession: ${session.id}`,
  }).catch(err => console.warn("[Webhook] Owner notification failed:", err));

  // 3. Send welcome email to customer (if email available) + record A/B variant
  if (customerEmail) {
    await sendPurchaseEmail({
      to: customerEmail,
      name: customerName || undefined,
      productKey,
      amountCents,
    }).catch(err => console.warn("[Webhook] Customer email failed:", err));

    // Record which A/B subject variant was sent for analytics
    const abVariant = getPurchaseEmailVariant(customerEmail, productKey);
    if (abVariant) {
      await db.insert(emailAbTests).values({
        email: customerEmail,
        variant: abVariant,
        subject: EMAIL_SUBJECT_VARIANTS[abVariant],
        productKey,
      }).catch(err => console.warn("[Webhook] A/B tracking insert failed:", err));
    }
  }

  // 4. Fire Meta Conversions API Purchase event
  if (customerEmail) {
    await fireMetaPurchase({
      email: customerEmail,
      value: amountCents / 100,
      currency: currency.toUpperCase(),
      productName: productLabels[productKey],
    }).catch(err => console.warn("[Webhook] Meta CAPI Purchase failed:", err));
  }

  // 5. Send celebratory admin notification email with cumulative revenue
  try {
    const [totalRevRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(${orders.amountCents}), 0)` })
    .from(orders)
    .where(eq(orders.status, "completed"));
    const [totalOrdRow] = await db
      .select({ cnt: sql<number>`COUNT(*)` })
      .from(orders)
      .where(eq(orders.status, "completed"));
    await sendSaleNotificationEmail({
      customerEmail,
      customerName,
      productLabel: productLabels[productKey],
      amountCents,
      currency,
      totalRevenueCents: Number(totalRevRow?.total ?? 0),
      totalOrders: Number(totalOrdRow?.cnt ?? 0),
    });
  } catch (err) {
    console.warn("[Webhook] Admin sale notification email failed:", err);
  }

  // 6. Report sale to LeadOS in real-time
  await reportSaleToLeadOS({
    amountUsd: amountCents / 100,
    orderId: session.id,
    productName: productLabels[productKey],
    customerEmail: customerEmail || undefined,
  }).catch(err => console.warn("[Webhook] LeadOS sale report failed:", err));

  // 7. Enroll in 7-day nurture sequence (only for core product purchases)
  const coreProducts: ProductKey[] = ["frontEnd", "exitDiscount"];
  if (customerEmail && coreProducts.includes(productKey)) {
    const recentOrder = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.stripeSessionId, session.id))
      .limit(1);
    await enrollInSequence({
      email: customerEmail,
      name: customerName || undefined,
      orderId: recentOrder[0]?.id,
      stripeSessionId: session.id,
    }).catch(err => console.warn("[Webhook] Sequence enrollment failed:", err));
  }
}
