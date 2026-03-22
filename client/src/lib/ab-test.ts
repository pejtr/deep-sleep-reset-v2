/*
 * A/B Headline Testing Utility
 * 
 * Assigns visitors to a variant (A/B/C/D) and persists it for the session.
 * Fires a Meta Pixel custom event so you can measure conversion rates per variant.
 * 
 * VARIANTS:
 *   A — Pain Interruption: "You're Not Tired. You're Sleep-Deprived. There's a Fix."
 *   B — Transformation Specificity: "What If You Woke Up With Energy Tomorrow Morning?"
 *   C — Social Proof / Curiosity: "10,247 People Fixed Their Sleep With This 7-Night Protocol"
 *   D — Fear of Loss: "Every Night You Don't Sleep Is Costing You More Than $5"
 * 
 * HOW TO ANALYZE RESULTS:
 * 1. In Meta Events Manager, go to Custom Conversions or Events
 * 2. Filter by "ABTest" custom event
 * 3. Compare Purchase conversion rates between variants
 * 4. After ~500 visitors per variant, pick the winner and set it as default
 * 
 * HOW TO CHANGE VARIANTS:
 * Edit the HEADLINES object below. Each variant has a main headline and a subheadline.
 */

import { trackEvent } from "@/components/MetaPixel";

export interface HeadlineVariant {
  /** The main headline text (can contain HTML-safe strings) */
  main: string;
  /** The highlighted/amber portion of the headline */
  highlight: string;
  /** The second part of the headline after the highlight */
  continuation: string;
  /** The subheadline text */
  sub: string;
}

export const HEADLINES: Record<"a" | "b" | "c" | "d", HeadlineVariant> = {
  // Variant A — Pain Interruption Frame
  // Pattern interrupt → reframe → immediate solution signal
  a: {
    main: "You're Not Tired. You're ",
    highlight: "Sleep-Deprived.",
    continuation: " There's a Fix.",
    sub: "The 7-Night Deep Sleep Reset uses the same CBT-I protocol sleep clinics charge $800 for — for the price of one coffee.",
  },
  // Variant B — Transformation Specificity Frame
  // Immediate timeline + concrete promise + price anchor in sub
  b: {
    main: "What If You Woke Up With ",
    highlight: "Energy",
    continuation: " Tomorrow Morning?",
    sub: "The 7-Night Deep Sleep Reset has helped 10,000+ people fix their sleep permanently — for $5.",
  },
  // Variant C — Social Proof / Curiosity Frame
  // Specific number + curiosity hook + "here's exactly how"
  c: {
    main: "10,247 People Fixed Their Sleep With This ",
    highlight: "7-Night Protocol.",
    continuation: "",
    sub: "Here's exactly how — a science-backed, step-by-step system that works even if you've tried everything else.",
  },
  // Variant D — Fear of Loss Frame
  // Loss aversion + reframe cost of inaction vs $5
  d: {
    main: "Every Night You Don't Sleep Is ",
    highlight: "Costing You More",
    continuation: " Than $5.",
    sub: "Lost productivity, damaged health, broken relationships — the real price of insomnia is enormous. The fix costs less than a coffee.",
  },
};

export type ABVariant = "a" | "b" | "c" | "d";

const STORAGE_KEY = "dsr-ab-variant";

/**
 * Get or assign the visitor's A/B test variant.
 * Persists in localStorage so the same visitor always sees the same variant.
 * Fires a Meta Pixel custom event on first assignment.
 */
export function getVariant(): ABVariant {
  // Check if already assigned
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "a" || stored === "b" || stored === "c" || stored === "d") {
    return stored;
  }

  // Randomly assign 25/25/25/25
  const r = Math.random();
  const variant: ABVariant = r < 0.25 ? "a" : r < 0.50 ? "b" : r < 0.75 ? "c" : "d";
  localStorage.setItem(STORAGE_KEY, variant);

  // Fire tracking event
  trackEvent("ABTest", {
    variant,
    test_name: "hero_headline_v2",
  });

  return variant;
}

/**
 * Get the headline content for the current visitor's variant
 */
export function getHeadline(): HeadlineVariant {
  const variant = getVariant();
  return HEADLINES[variant];
}
