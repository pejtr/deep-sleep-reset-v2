/*
 * Checkout — Stripe Integration
 * 
 * PRICING:
 *   - Regular price: $5 (front-end)
 *   - Exit-intent discount: $4 (20% off)
 *   - Upsell 1: $10 (Anxiety Dissolve Audio Pack)
 *   - Upsell 2: $10 (Sleep Optimizer Toolkit)
 * 
 * FUNNEL FLOW:
 *   Front-end ($5) → /upsell-1
 *   Exit discount ($4) → /upsell-1
 *   Upsell 1 ($10) → /upsell-2
 *   Upsell 2 ($10) → /thank-you
 */

export type ProductKey = "frontEnd" | "frontEnd7" | "exitDiscount" | "upsell1" | "upsell2" | "upsell3";

/**
 * Open Stripe Checkout for multiple products (order bump).
 * The first product in the array is the primary product (determines redirect).
 */
export async function openBundleCheckout(products: ProductKey[]) {
  const totalValue = products.reduce((sum, p) => sum + (PRICES[p] || 0), 0);
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    w.fbq("track", "InitiateCheckout", {
      value: totalValue,
      currency: "USD",
      content_name: products.join("+"),
    });
  }

  try {
    const response = await fetch("/api/trpc/checkout.createBundleSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          productKeys: products,
          origin: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    const url = data?.result?.data?.json?.url;

    if (url) {
      window.location.href = url;
    } else {
      console.error("[BundleCheckout] No URL returned:", data);
      alert("Something went wrong creating your checkout. Please try again.");
    }
  } catch (err) {
    console.error("[BundleCheckout] Error:", err);
    alert("Something went wrong. Please try again.");
  }
}

export const PRICES: Record<ProductKey, number> = {
  frontEnd: 5,
  frontEnd7: 7, // A/B test challenger
  exitDiscount: 4,
  upsell1: 10,
  upsell2: 10,
  upsell3: 19,
};

/**
 * Open Stripe Checkout for a product.
 * Creates a checkout session via tRPC, then redirects.
 */
export async function openCheckout(product: ProductKey) {
  // Fire Meta Pixel event
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    w.fbq("track", "InitiateCheckout", {
      value: PRICES[product] || 0,
      currency: "USD",
      content_name: product,
    });
  }

  try {
    // Call the tRPC endpoint via fetch (avoiding circular import with trpc client)
    const response = await fetch("/api/trpc/checkout.createSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          productKey: product,
          origin: window.location.origin,
        },
      }),
    });

    const data = await response.json();
    const url = data?.result?.data?.json?.url;

    if (url) {
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else {
      console.error("[Checkout] No URL returned:", data);
      alert("Something went wrong creating your checkout. Please try again.");
    }
  } catch (err) {
    console.error("[Checkout] Error:", err);
    alert("Something went wrong. Please try again.");
  }
}
