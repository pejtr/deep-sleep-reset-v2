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

export const HEADLINES: Record<"a" | "b" | "c", HeadlineVariant> = {
  a: {
    main: "You're Not Tired. Your Brain Is ",
    highlight: "Stuck Awake.",
    continuation: "",
    sub: "Discover the 7-Night Protocol that resets your body's natural sleep switch — for the price of one coffee.",
  },
  b: {
    main: "Fix Your Sleep in ",
    highlight: "3 Nights",
    continuation: " (Without Pills)",
    sub: "The science-backed protocol 10,000+ people used to fall asleep in 15 minutes. No melatonin. No apps. Just sleep.",
  },
  c: {
    main: "This Is Why You ",
    highlight: "Wake Up at 3AM",
    continuation: " — And How to Stop It",
    sub: "Change your sleep. Change your life. The 7-Night Deep Sleep Reset for less than a cup of coffee.",
  },
};

export type ABVariant = "a" | "b" | "c";

const STORAGE_KEY = "dsr-ab-variant";

/**
 * Get or assign the visitor's A/B test variant.
 * Persists in localStorage so the same visitor always sees the same variant.
 * Fires a Meta Pixel custom event on first assignment.
 */
export function getVariant(): ABVariant {
  // Check if already assigned
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "a" || stored === "b" || stored === "c") {
    return stored;
  }

  // Randomly assign 33/33/33
  const r = Math.random();
  const variant: ABVariant = r < 0.33 ? "a" : r < 0.66 ? "b" : "c";
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
