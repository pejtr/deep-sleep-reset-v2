/*
 * Checkout URL Configuration
 * 
 * All CTA buttons across the funnel reference these URLs.
 * Replace the placeholder URLs below with your actual payment links.
 * 
 * GUMROAD SETUP (Recommended for beginners):
 * 
 *   1. Create a free account at https://gumroad.com
 *   2. Create 3 products:
 *      - "The 7-Night Deep Sleep Reset" → $5
 *      - "The Anxiety Dissolve Audio Pack" → $10
 *      - "The Sleep Optimizer Toolkit" → $10
 *   3. For each product, go to Settings → After Purchase → Redirect URL:
 *      - Front-end:  https://YOUR-DOMAIN/upsell-1
 *      - Upsell 1:   https://YOUR-DOMAIN/upsell-2
 *      - Upsell 2:   https://YOUR-DOMAIN/thank-you?value=25&product=Complete+Bundle
 *   4. Copy each product's checkout URL and paste below
 *   5. Gumroad URLs look like: https://YOURNAME.gumroad.com/l/PRODUCT_ID
 * 
 * STRIPE PAYMENT LINKS (Alternative):
 * 
 *   1. Go to https://dashboard.stripe.com/payment-links
 *   2. Create 3 Payment Links with the same prices
 *   3. Set "After payment" → Redirect to your upsell/thank-you URLs
 *   4. Copy the Payment Link URLs and paste below
 *   5. Stripe URLs look like: https://buy.stripe.com/XXXXX
 * 
 * IMPORTANT: Set redirect URLs so the funnel flows correctly:
 *   Front-end purchase → redirects to /upsell-1
 *   Upsell 1 purchase  → redirects to /upsell-2
 *   Upsell 2 purchase  → redirects to /thank-you?value=25&product=Complete+Bundle
 *   "No thanks" links   → already handled in the code (skip to next step)
 */

export const CHECKOUT_URLS = {
  /** $5 Front-end: The 7-Night Deep Sleep Reset */
  frontEnd: "https://YOUR-STORE.gumroad.com/l/deep-sleep-reset",

  /** $10 Upsell 1: The Anxiety Dissolve Audio Pack */
  upsell1: "https://YOUR-STORE.gumroad.com/l/anxiety-dissolve-audio",

  /** $10 Upsell 2: The Sleep Optimizer Toolkit */
  upsell2: "https://YOUR-STORE.gumroad.com/l/sleep-optimizer-toolkit",
} as const;

/**
 * Open checkout in a new tab and fire Meta Pixel InitiateCheckout event
 */
export function openCheckout(product: keyof typeof CHECKOUT_URLS) {
  const url = CHECKOUT_URLS[product];

  // Fire Meta Pixel event
  const w = window as unknown as { fbq?: (...args: unknown[]) => void };
  if (w.fbq) {
    const values: Record<string, number> = {
      frontEnd: 5,
      upsell1: 10,
      upsell2: 10,
    };
    w.fbq("track", "InitiateCheckout", {
      value: values[product] || 0,
      currency: "USD",
      content_name: product,
    });
  }

  // Check if it's still a placeholder
  if (url.includes("YOUR-STORE")) {
    console.warn(
      `[Checkout] Placeholder URL detected for "${product}". Update CHECKOUT_URLS in src/lib/checkout.ts with your real Gumroad/Stripe link.`
    );
    alert(
      "Checkout is not configured yet.\n\nTo set up payments, edit the file:\nsrc/lib/checkout.ts\n\nReplace the placeholder URLs with your Gumroad or Stripe payment links."
    );
    return;
  }

  window.open(url, "_blank");
}
