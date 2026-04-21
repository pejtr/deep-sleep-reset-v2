/**
 * Stripe Product & Price Configuration
 * 
 * Products are created on-the-fly via Stripe API.
 * Prices are in cents (USD).
 */

export type ProductKey = "frontEnd" | "frontEnd7" | "exitDiscount" | "upsell1" | "upsell2" | "upsell3" | "chronotypeReport";

export interface ProductConfig {
  key: ProductKey;
  name: string;
  description: string;
  priceInCents: number;
  /** Where to redirect after successful payment */
  successPath: string;
  /** Where to redirect if payment is cancelled */
  cancelPath: string;
}

export const PRODUCTS: Record<ProductKey, ProductConfig> = {
  frontEnd: {
    key: "frontEnd",
    name: "The 7-Night Deep Sleep Reset",
    description: "The science-backed, step-by-step protocol to fix your broken sleep cycle in 7 nights.",
    priceInCents: 500, // $5.00 — A/B test control
    successPath: "/upsell-1?value=5&currency=USD",
    cancelPath: "/",
  },
  frontEnd7: {
    key: "frontEnd7",
    name: "The 7-Night Deep Sleep Reset",
    description: "The science-backed, step-by-step protocol to fix your broken sleep cycle in 7 nights.",
    priceInCents: 700, // $7.00 — A/B test challenger
    successPath: "/upsell-1?value=7&currency=USD",
    cancelPath: "/",
  },
  exitDiscount: {
    key: "exitDiscount",
    name: "The 7-Night Deep Sleep Reset (Special Offer)",
    description: "The science-backed, step-by-step protocol to fix your broken sleep cycle — 20% off special.",
    priceInCents: 400, // $4.00
    successPath: "/upsell-1?value=4&currency=USD",
    cancelPath: "/",
  },
  upsell1: {
    key: "upsell1",
    name: "Anxiety Dissolve Audio Pack",
    description: "5 powerful guided audio sessions to melt away stress and anxiety on demand.",
    priceInCents: 1000, // $10.00
    successPath: "/upsell-2?purchased=upsell1",
    cancelPath: "/upsell-2",
  },
  upsell2: {
    key: "upsell2",
    name: "Sleep Optimizer Toolkit",
    description: "Sleep Score Tracker, Bedroom Audit Checklist, Supplement Guide, and Screen Detox Protocol.",
    priceInCents: 1000, // $10.00
    successPath: "/upsell-3?purchased=upsell2",
    cancelPath: "/upsell-3",
  },
  upsell3: {
    key: "upsell3",
    name: "Advanced Sleep Mastery Protocol",
    description: "The complete 30-day deep dive: advanced CBT-I techniques, sleep architecture optimization, and lifetime access to the Sleep Mastery Community.",
    priceInCents: 1900, // $19.00
    successPath: "/thank-you?value=44&product=Complete+Mastery+Bundle",
    cancelPath: "/thank-you?value=25&product=Complete+Bundle",
  },
  chronotypeReport: {
    key: "chronotypeReport",
    name: "Personalized Chronotype Sleep Report",
    description: "Your complete personalized sleep blueprint: optimal sleep/wake times, ideal morning routine, peak performance windows, and a 7-day implementation plan — all based on your unique chronotype.",
    priceInCents: 900, // $9.00
    successPath: "/thank-you?value=9&product=Chronotype+Report",
    cancelPath: "/chronotype-quiz",
  },
};

/** Total funnel value if customer buys everything */
export const MAX_FUNNEL_VALUE_CENTS = Object.values(PRODUCTS).reduce(
  (sum, p) => sum + p.priceInCents, 0
);
