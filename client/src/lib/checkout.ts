/*
 * Checkout URL Configuration
 * 
 * PRICING STRATEGY (Direct Stripe — no ClickBank):
 *   - Regular price: $5 (shown on sales page)
 *   - Exit-intent discount: $4 (shown in exit popup — 20% off)
 *   - Upsell 1: $10 (Anxiety Dissolve Audio Pack)
 *   - Upsell 2: $10 (Sleep Optimizer Toolkit)
 * 
 * Stripe fees: 2.9% + $0.30 per transaction
 * Net per customer (max): $23.37 / $25.00
 * 
 * STRIPE SETUP:
 *   After full-stack upgrade, checkout sessions are created server-side.
 *   These URLs will be replaced by API calls to /api/checkout/create-session.
 *   For now they serve as placeholder config.
 * 
 * FUNNEL FLOW:
 *   Front-end ($5) → /upsell-1
 *   Exit discount ($4) → /upsell-1
 *   Upsell 1 ($10) → /upsell-2
 *   Upsell 2 ($10) → /thank-you?value=25&product=Complete+Bundle
 *   "No thanks" → skip to next step
 */

export const CHECKOUT_URLS = {
  /** $5 Front-end: The 7-Night Deep Sleep Reset */
  frontEnd: "#checkout-frontend",

  /** $4 Exit-intent discount: The 7-Night Deep Sleep Reset (special) */
  exitDiscount: "#checkout-exit-discount",

  /** $10 Upsell 1: The Anxiety Dissolve Audio Pack */
  upsell1: "#checkout-upsell1",

  /** $10 Upsell 2: The Sleep Optimizer Toolkit */
  upsell2: "#checkout-upsell2",
} as const;

export const PRICES = {
  frontEnd: 5,
  exitDiscount: 4,
  upsell1: 10,
  upsell2: 10,
} as const;

/**
 * Open checkout — will be replaced by Stripe Checkout Session after upgrade
 */
export function openCheckout(product: keyof typeof CHECKOUT_URLS) {
  const url = CHECKOUT_URLS[product];

  // Fire Meta Pixel event
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    w.fbq("track", "InitiateCheckout", {
      value: PRICES[product] || 0,
      currency: "USD",
      content_name: product,
    });
  }

  // If Stripe is integrated, call the API
  if (url.startsWith("#checkout")) {
    // Will be replaced by fetch("/api/checkout/create-session", ...)
    console.warn(
      `[Checkout] Stripe not yet configured for "${product}". Upgrade to full-stack and set up Stripe.`
    );
    alert(
      `Checkout for "${product}" ($${PRICES[product]}) will be handled by Stripe after full-stack upgrade.\n\nThis is a placeholder — Stripe Checkout Sessions will replace this.`
    );
    return;
  }

  window.open(url, "_blank");
}
