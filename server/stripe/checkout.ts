/**
 * Stripe Checkout Session creation
 */
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

interface CreateBundleCheckoutParams {
  productKeys: ProductKey[];
  origin: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Create a checkout session with multiple products (order bump).
 * The primary product determines success/cancel redirect paths.
 */
export async function createBundleCheckoutSession(params: CreateBundleCheckoutParams) {
  const stripe = getStripe();
  const [primaryKey] = params.productKeys;
  const primaryProduct = PRODUCTS[primaryKey];
  if (!primaryProduct) {
    throw new Error(`Unknown primary product: ${primaryKey}`);
  }

  const lineItems = params.productKeys.map((key) => {
    const product = PRODUCTS[key];
    if (!product) throw new Error(`Unknown product: ${key}`);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
          description: product.description,
        },
        unit_amount: product.priceInCents,
      },
      quantity: 1,
    };
  });

  const totalCents = params.productKeys.reduce(
    (sum, key) => sum + (PRODUCTS[key]?.priceInCents || 0),
    0
  );

  // Build success URL with total value for Meta Pixel dynamic tracking
  const totalDollars = (totalCents / 100).toFixed(2);
  const primarySuccessBase = primaryProduct.successPath.split('?')[0];
  const primarySuccessParams = new URLSearchParams(primaryProduct.successPath.split('?')[1] || '');
  primarySuccessParams.set('value', totalDollars);
  primarySuccessParams.set('currency', 'USD');
  const bundleSuccessPath = `${primarySuccessBase}?${primarySuccessParams.toString()}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    customer_email: params.customerEmail || undefined,
    allow_promotion_codes: true,
    success_url: `${params.origin}${bundleSuccessPath}`,
    cancel_url: `${params.origin}${primaryProduct.cancelPath}`,
    metadata: {
      productKeys: params.productKeys.join(","),
      primaryProductKey: primaryKey,
      totalCents: String(totalCents),
      ...(params.metadata || {}),
    },
  });
  return { url: session.url, sessionId: session.id };
}
