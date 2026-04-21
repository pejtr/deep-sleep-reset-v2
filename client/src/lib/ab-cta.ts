/*
 * A/B CTA Button Text Testing Utility
 *
 * Tests three hero CTA button text variants to identify which copy
 * drives the highest click-through rate to the order page.
 *
 * Variants:
 *   'cta_a' — Control: "Yes — I Want to Sleep Like This" (aspirational/identity)
 *   'cta_b' — Challenger A: "Fix My Sleep Tonight — $5" (action + urgency + price)
 *   'cta_c' — Challenger B: "Start My 7-Night Reset" (commitment + program framing)
 *
 * Assignment: deterministic random, equal 33/33/34 split, 24h TTL
 * Auto-lock: after 200 impressions, the winning variant is locked in localStorage
 *
 * HOW TO ANALYZE RESULTS:
 *   Admin panel → Conversion tab → A/B test results table
 *   Filter by variant prefix "cta_" to see CTA text results.
 *   After ~200 impressions per variant, the winner auto-locks.
 */

import { trackEvent } from "@/components/MetaPixel";

export type CTAVariant = "cta_a" | "cta_b" | "cta_c";

export interface CTAConfig {
  /** Human-readable label for analytics */
  label: string;
  /** The button text to display */
  text: string;
}

export const CTA_VARIANTS: Record<CTAVariant, CTAConfig> = {
  cta_a: {
    label: "Aspirational (Control)",
    text: "Yes — I Want to Sleep Like This",
  },
  cta_b: {
    label: "Action + Price (Challenger A)",
    text: "Fix My Sleep Tonight — $5",
  },
  cta_c: {
    label: "Commitment (Challenger B)",
    text: "Start My 7-Night Reset",
  },
};

const STORAGE_KEY = "dsr-cta-variant";
const TIMESTAMP_KEY = "dsr-cta-assigned-at";
const WINNER_KEY = "dsr-cta-winner";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get or assign the visitor's CTA button text variant.
 * If a winner has been locked (after 200 impressions), always returns the winner.
 * Persists in localStorage for 24 hours.
 */
export function getCTAVariant(): CTAVariant {
  if (typeof window === "undefined") return "cta_a";

  // Check if winner is locked
  const winner = localStorage.getItem(WINNER_KEY) as CTAVariant | null;
  if (winner && (winner === "cta_a" || winner === "cta_b" || winner === "cta_c")) {
    return winner;
  }

  // Check cached variant
  const stored = localStorage.getItem(STORAGE_KEY) as CTAVariant | null;
  const assignedAt = parseInt(localStorage.getItem(TIMESTAMP_KEY) ?? "0", 10);
  const isValid =
    stored &&
    Date.now() - assignedAt < TTL_MS &&
    (stored === "cta_a" || stored === "cta_b" || stored === "cta_c");

  if (isValid) return stored as CTAVariant;

  // Assign new variant — equal 33/33/34 split
  const r = Math.random();
  const variant: CTAVariant = r < 0.333 ? "cta_a" : r < 0.666 ? "cta_b" : "cta_c";
  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());

  // Fire Meta Pixel event
  trackEvent("ABTest", {
    variant,
    test_name: "hero_cta_v1",
  });

  return variant;
}

/**
 * Get the CTA button text for the current visitor's variant
 */
export function getCTAText(): string {
  const variant = getCTAVariant();
  return CTA_VARIANTS[variant].text;
}

/**
 * Lock the winning CTA variant (called after 200 impressions from admin)
 */
export function lockCTAWinner(variant: CTAVariant): void {
  localStorage.setItem(WINNER_KEY, variant);
}

/**
 * Clear the cached variant (forces re-assignment on next load)
 */
export function clearCTAVariant(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}
