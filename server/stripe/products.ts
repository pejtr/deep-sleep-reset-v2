/**
 * Stripe Product & Price Configuration
 * 
 * Products are created on-the-fly via Stripe API.
 * Prices are in cents (USD).
 */

export type ProductKey = "frontEnd" | "exitDiscount" | "upsell1" | "upsell2";

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
    priceInCents: 500, // $5.00
    successPath: "/upsell-1",
    cancelPath: "/",
  },
  exitDiscount: {
    key: "exitDiscount",
    name: "The 7-Night Deep Sleep Reset (Special Offer)",
    description: "The science-backed, step-by-step protocol to fix your broken sleep cycle — 20% off special.",
    priceInCents: 400, // $4.00
    successPath: "/upsell-1",
    cancelPath: "/",
  },
  upsell1: {
    key: "upsell1",
    name: "Anxiety Dissolve Audio Pack",
    description: "5 powerful guided audio sessions to melt away stress and anxiety on demand.",
    priceInCents: 1000, // $10.00
    successPath: "/upsell-2",
    cancelPath: "/upsell-2",
  },
  upsell2: {
    key: "upsell2",
    name: "Sleep Optimizer Toolkit",
    description: "Sleep Score Tracker, Bedroom Audit Checklist, Supplement Guide, and Screen Detox Protocol.",
    priceInCents: 1000, // $10.00
    successPath: "/thank-you?value=25&product=Complete+Bundle",
    cancelPath: "/thank-you?value=5&product=Deep+Sleep+Reset",
  },
};

/** Total funnel value if customer buys everything */
export const MAX_FUNNEL_VALUE_CENTS = Object.values(PRODUCTS).reduce(
  (sum, p) => sum + p.priceInCents, 0
);
