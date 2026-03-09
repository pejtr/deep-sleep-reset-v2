/**
 * Stripe Checkout Session creation
 */
import type { Request } from "express";
import { getStripe } from "./stripe";
import { PRODUCTS, type ProductKey } from "./products";

interface CreateCheckoutParams {
  productKey: ProductKey;
  origin: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const stripe = getStripe();
  const product = PRODUCTS[params.productKey];

  if (!product) {
    throw new Error(`Unknown product: ${params.productKey}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    customer_email: params.customerEmail || undefined,
    allow_promotion_codes: true,
    success_url: `${params.origin}${product.successPath}`,
    cancel_url: `${params.origin}${product.cancelPath}`,
    metadata: {
      productKey: params.productKey,
      ...(params.metadata || {}),
    },
  });

  return { url: session.url, sessionId: session.id };
}
