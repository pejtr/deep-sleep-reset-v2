/*
 * Checkout URL Configuration
 * 
 * Replace placeholder URLs with your actual Stripe/Gumroad checkout links.
 * All CTA buttons across the funnel reference these URLs.
 * 
 * SETUP INSTRUCTIONS:
 * 
 * Option A: Gumroad
 *   1. Create products at https://gumroad.com
 *   2. Set prices: Front-end $5, Upsell 1 $10, Upsell 2 $10
 *   3. Copy the checkout URLs and paste below
 * 
 * Option B: Stripe Payment Links
 *   1. Create Payment Links at https://dashboard.stripe.com/payment-links
 *   2. Set prices and configure success URLs
 *   3. Copy the Payment Link URLs and paste below
 * 
 * Option C: ThriveCart / other
 *   1. Create funnels with the 3 products
 *   2. Copy checkout URLs and paste below
 * 
 * SUCCESS URL SETUP:
 * After payment, redirect customers to your Thank You page:
 *   - Front-end: https://yourdomain.com/thank-you?value=5&product=Deep+Sleep+Reset
 *   - Upsell 1:  https://yourdomain.com/thank-you?value=10&product=Anxiety+Dissolve+Audio+Pack
 *   - Upsell 2:  https://yourdomain.com/thank-you?value=10&product=Sleep+Optimizer+Toolkit
 */

export const CHECKOUT_URLS = {
  /** $5 Front-end: The 7-Night Deep Sleep Reset */
  frontEnd: "#",  // ← Replace with your checkout URL

  /** $10 Upsell 1: The Anxiety Dissolve Audio Pack */
  upsell1: "#",   // ← Replace with your checkout URL

  /** $10 Upsell 2: The Sleep Optimizer Toolkit */
  upsell2: "#",   // ← Replace with your checkout URL
} as const;

/**
 * Open checkout in a new tab and fire Meta Pixel event
 */
export function openCheckout(product: keyof typeof CHECKOUT_URLS) {
  const url = CHECKOUT_URLS[product];
  if (url === "#") {
    // Show a helpful message during development
    console.warn(
      `[Checkout] No URL configured for "${product}". Update CHECKOUT_URLS in src/lib/checkout.ts`
    );
  }
  window.open(url, "_blank");
}
