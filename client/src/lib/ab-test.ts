/*
 * A/B Headline Testing Utility
 * 
 * Assigns visitors to a variant (A or B) and persists it for the session.
 * Fires a Meta Pixel custom event so you can measure conversion rates per variant.
 * 
 * HOW TO ANALYZE RESULTS:
 * 1. In Meta Events Manager, go to Custom Conversions or Events
 * 2. Filter by "ABTest" custom event
 * 3. Compare Purchase conversion rates between variant_a and variant_b
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

export const HEADLINES: Record<"a" | "b", HeadlineVariant> = {
  a: {
    main: "Still Lying Awake at ",
    highlight: "3:17 AM",
    continuation: ", Staring at the Ceiling?",
    sub: 'Discover the 7-Night Protocol That Resets Your Body\'s Natural Sleep Switch... Without Melatonin, Sleeping Pills, or "Counting Sheep."',
  },
  b: {
    main: "What If You Could ",
    highlight: "Fall Asleep in 15 Minutes",
    continuation: " — Every Single Night?",
    sub: "The Science-Backed 7-Night Reset That 10,000+ People Used to Fix Their Broken Sleep. No Pills. No Apps. Just Sleep.",
  },
};

export type ABVariant = "a" | "b";

const STORAGE_KEY = "dsr-ab-variant";

/**
 * Get or assign the visitor's A/B test variant.
 * Persists in localStorage so the same visitor always sees the same variant.
 * Fires a Meta Pixel custom event on first assignment.
 */
export function getVariant(): ABVariant {
  // Check if already assigned
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "a" || stored === "b") {
    return stored;
  }

  // Randomly assign 50/50
  const variant: ABVariant = Math.random() < 0.5 ? "a" : "b";
  localStorage.setItem(STORAGE_KEY, variant);

  // Fire tracking event
  trackEvent("ABTest", {
    variant,
    test_name: "hero_headline",
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
