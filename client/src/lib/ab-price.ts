/*
 * A/B Price Testing Utility
 *
 * Tests two price points for the base "7-Night Deep Sleep Reset" product
 * to identify whether a higher price increases or decreases revenue per visitor.
 *
 * Variants:
 *   'price_5'  — Control: $5.00 (current price, high conversion expected)
 *   'price_7'  — Challenger: $7.00 (+40% revenue per sale if CVR holds)
 *
 * Key metric: Revenue per visitor (RPV) = price × CVR
 *   - If $7 CVR ≥ 71% of $5 CVR → $7 wins on RPV
 *   - Example: $5 @ 10% CVR = $0.50 RPV vs $7 @ 8% CVR = $0.56 RPV → $7 wins
 *
 * Assignment: deterministic random, equal 50/50 split, 24h TTL
 *
 * HOW TO ANALYZE RESULTS:
 *   Admin panel → Conversion tab → A/B test results table
 *   Filter by variant prefix "price_" to see price test results.
 *   After ~500 impressions per variant, compare Revenue Per Visitor (RPV):
 *     RPV = (conversions / impressions) × price
 *   Declare a winner when RPV difference is statistically significant.
 *
 * HOW TO LOCK IN A WINNER:
 *   Call forcePriceVariant("price_5") or forcePriceVariant("price_7") in
 *   OrderBump.tsx to stop splitting traffic and always show the winning price.
 */

export type PriceVariant = "price_5" | "price_7";

export interface PriceConfig {
  /** Human-readable label for analytics */
  label: string;
  /** Price in dollars (display) */
  priceUsd: number;
  /** Price in cents (Stripe) */
  priceCents: number;
  /** Stripe product key to use for checkout */
  productKey: "frontEnd" | "frontEnd7";
}

export const PRICE_VARIANTS: Record<PriceVariant, PriceConfig> = {
  price_5: {
    label: "$5 Control",
    priceUsd: 5,
    priceCents: 500,
    productKey: "frontEnd",
  },
  price_7: {
    label: "$7 Challenger",
    priceUsd: 7,
    priceCents: 700,
    productKey: "frontEnd7",
  },
};

const STORAGE_KEY = "dsr-price-variant";
const TIMESTAMP_KEY = "dsr-price-assigned-at";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or assign the visitor's price variant.
 * Persists in localStorage for 24 hours so the same visitor always sees
 * the same price during a test window.
 */
export function getPriceVariant(): PriceVariant {
  if (typeof window === "undefined") return "price_5";

  const stored = localStorage.getItem(STORAGE_KEY) as PriceVariant | null;
  const assignedAt = parseInt(localStorage.getItem(TIMESTAMP_KEY) ?? "0", 10);
  const isValid =
    stored &&
    Date.now() - assignedAt < TTL_MS &&
    (stored === "price_5" || stored === "price_7");

  if (isValid) return stored as PriceVariant;

  // Equal 50/50 split
  const variant: PriceVariant = Math.random() < 0.5 ? "price_5" : "price_7";

  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());

  return variant;
}

/** Force a specific price variant (for testing/admin preview) */
export function forcePriceVariant(variant: PriceVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

/** Clear the cached price variant (forces re-assignment on next load) */
export function clearPriceVariant(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}
