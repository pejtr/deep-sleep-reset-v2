/*
 * A/B Button Color Testing Utility
 *
 * Tests three checkout button color variants on the OrderBump page to identify
 * which color drives the highest conversion rate to Stripe checkout.
 *
 * Variants:
 *   'amber'  — Control: amber/gold (#d4a853) — matches brand palette
 *   'green'  — Challenger A: emerald green — trust, action, "go"
 *   'blue'   — Challenger B: electric blue — professional, calm confidence
 *
 * Assignment: deterministic random, equal 33/33/34 split, 24h TTL
 *
 * HOW TO ANALYZE RESULTS:
 *   Admin panel → Conversion tab → A/B test results table
 *   Filter by variant prefix "btn_" to see button color results.
 *   After ~200 checkout clicks per variant, pick the winner.
 *
 * HOW TO CHANGE VARIANTS:
 *   Edit BUTTON_VARIANTS below. Each variant has Tailwind classes for
 *   the button background, hover state, and text color.
 */

export type ButtonColorVariant = "amber" | "green" | "blue";

export interface ButtonColorConfig {
  /** Human-readable label for analytics */
  label: string;
  /** Tailwind classes for the button */
  className: string;
  /** Hex color for Meta Pixel custom event */
  hex: string;
}

export const BUTTON_VARIANTS: Record<ButtonColorVariant, ButtonColorConfig> = {
  amber: {
    label: "Amber (Control)",
    className:
      "bg-amber hover:bg-amber-light text-background",
    hex: "#d4a853",
  },
  green: {
    label: "Green (Challenger A)",
    className:
      "bg-emerald-500 hover:bg-emerald-400 text-white",
    hex: "#10b981",
  },
  blue: {
    label: "Blue (Challenger B)",
    className:
      "bg-blue-500 hover:bg-blue-400 text-white",
    hex: "#3b82f6",
  },
};

const STORAGE_KEY = "dsr-btn-color-variant";
const TIMESTAMP_KEY = "dsr-btn-color-assigned-at";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or assign the visitor's button color variant.
 * Persists in localStorage for 24 hours so the same visitor always sees
 * the same button color during a test window.
 */
export function getButtonColorVariant(): ButtonColorVariant {
  if (typeof window === "undefined") return "amber";

  const stored = localStorage.getItem(STORAGE_KEY) as ButtonColorVariant | null;
  const assignedAt = parseInt(localStorage.getItem(TIMESTAMP_KEY) ?? "0", 10);
  const isValid =
    stored &&
    Date.now() - assignedAt < TTL_MS &&
    (stored === "amber" || stored === "green" || stored === "blue");

  if (isValid) return stored as ButtonColorVariant;

  // Equal 33/33/34 split
  const r = Math.random();
  const variant: ButtonColorVariant = r < 0.333 ? "amber" : r < 0.666 ? "green" : "blue";

  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());

  return variant;
}

/** Force a specific variant (for testing/admin preview) */
export function forceButtonColorVariant(variant: ButtonColorVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

/** Clear the cached variant (forces re-assignment on next load) */
export function clearButtonColorVariant(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}
