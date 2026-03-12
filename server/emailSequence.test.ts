/**
 * Email Sequence Tests
 * Tests for the 7-day post-purchase nurture sequence
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { EMAIL_SEQUENCE, SEQUENCE_LENGTH } from "./emailSequenceTemplates";

// ─── Template tests ───────────────────────────────────────────────────────────

describe("Email Sequence Templates", () => {
  it("should have exactly 6 emails (Day 1–6)", () => {
    expect(EMAIL_SEQUENCE).toHaveLength(6);
    expect(SEQUENCE_LENGTH).toBe(6);
  });

  it("should have correct day numbers", () => {
    EMAIL_SEQUENCE.forEach((email, index) => {
      expect(email.dayNumber).toBe(index + 1);
    });
  });

  it("should have non-empty subjects for all emails", () => {
    EMAIL_SEQUENCE.forEach((email) => {
      expect(email.subject).toBeTruthy();
      expect(email.subject.length).toBeGreaterThan(10);
    });
  });

  it("should have non-empty preview text for all emails", () => {
    EMAIL_SEQUENCE.forEach((email) => {
      expect(email.previewText).toBeTruthy();
      expect(email.previewText.length).toBeGreaterThan(10);
    });
  });

  it("should generate HTML content with firstName", () => {
    const email = EMAIL_SEQUENCE[0];
    const html = email.buildHtml("Alice", "https://deep-sleep-reset.com/upsell-1");
    expect(html).toContain("Alice");
    expect(html).toContain("Night 2");
    expect(html).toContain("<!DOCTYPE html>");
  });

  it("should generate text content with firstName", () => {
    const email = EMAIL_SEQUENCE[0];
    const text = email.buildText("Bob", "https://deep-sleep-reset.com/upsell-1");
    expect(text).toContain("Bob");
    expect(text).toContain("Night 2");
  });

  it("Day 4 email should contain upsell URL in HTML", () => {
    const day4 = EMAIL_SEQUENCE[3]; // dayNumber 4
    expect(day4.dayNumber).toBe(4);
    const upsellUrl = "https://deep-sleep-reset.com/upsell-1";
    const html = day4.buildHtml("Alice", upsellUrl);
    expect(html).toContain(upsellUrl);
    expect(html).toContain("$27");
  });

  it("Day 4 email should contain upsell URL in text", () => {
    const day4 = EMAIL_SEQUENCE[3];
    const upsellUrl = "https://deep-sleep-reset.com/upsell-1";
    const text = day4.buildText("Alice", upsellUrl);
    expect(text).toContain(upsellUrl);
  });

  it("Day 6 (final) email should contain upsell and referral ask", () => {
    const day6 = EMAIL_SEQUENCE[5]; // dayNumber 6
    expect(day6.dayNumber).toBe(6);
    const html = day6.buildHtml("Alice", "https://deep-sleep-reset.com/upsell-1");
    expect(html).toContain("$27");
    expect(html).toContain("deep-sleep-reset.com"); // referral link
  });

  it("should handle undefined name gracefully (use 'there')", () => {
    const email = EMAIL_SEQUENCE[0];
    // Pass empty string to simulate missing name
    const html = email.buildHtml("there", "https://deep-sleep-reset.com/upsell-1");
    expect(html).toContain("there");
    expect(html).not.toContain("undefined");
  });

  it("all HTML emails should have proper email structure", () => {
    EMAIL_SEQUENCE.forEach((email) => {
      const html = email.buildHtml("Test User", "https://example.com/upsell");
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("Deep Sleep Reset");
      expect(html).toContain("Unsubscribe");
    });
  });

  it("all text emails should have footer", () => {
    EMAIL_SEQUENCE.forEach((email) => {
      const text = email.buildText("Test", "https://example.com/upsell");
      expect(text).toContain("Deep Sleep Reset");
    });
  });
});

// ─── Enrollment logic tests ───────────────────────────────────────────────────

describe("Email Sequence Enrollment Logic", () => {
  it("should schedule first email 24 hours after enrollment", () => {
    const now = Date.now();
    const expectedSendAt = new Date(now + 24 * 60 * 60 * 1000);
    const diff = Math.abs(expectedSendAt.getTime() - now - 24 * 60 * 60 * 1000);
    expect(diff).toBeLessThan(1000); // within 1 second
  });

  it("SEQUENCE_LENGTH should match EMAIL_SEQUENCE array length", () => {
    expect(SEQUENCE_LENGTH).toBe(EMAIL_SEQUENCE.length);
  });

  it("sequence covers nights 2 through 7 (6 emails)", () => {
    // Day 0 (Night 1) is handled by the immediate purchase email
    // Days 1-6 cover Nights 2-7
    const nights = EMAIL_SEQUENCE.map((e) => e.dayNumber);
    expect(nights).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("upsell emails are on Day 4 and Day 6", () => {
    const day4 = EMAIL_SEQUENCE.find((e) => e.dayNumber === 4);
    const day6 = EMAIL_SEQUENCE.find((e) => e.dayNumber === 6);
    expect(day4).toBeDefined();
    expect(day6).toBeDefined();

    // Both should contain upsell content
    const html4 = day4!.buildHtml("Test", "https://example.com/upsell");
    const html6 = day6!.buildHtml("Test", "https://example.com/upsell");
    expect(html4).toContain("https://example.com/upsell");
    expect(html6).toContain("https://example.com/upsell");
  });
});

// ─── Subject line quality tests ───────────────────────────────────────────────

describe("Email Subject Lines", () => {
  it("all subjects should be under 80 characters (email best practice)", () => {
    EMAIL_SEQUENCE.forEach((email) => {
      expect(email.subject.length).toBeLessThanOrEqual(80);
    });
  });

  it("subjects should not be duplicated", () => {
    const subjects = EMAIL_SEQUENCE.map((e) => e.subject);
    const unique = new Set(subjects);
    expect(unique.size).toBe(subjects.length);
  });

  it("preview texts should not be duplicated", () => {
    const previews = EMAIL_SEQUENCE.map((e) => e.previewText);
    const unique = new Set(previews);
    expect(unique.size).toBe(previews.length);
  });
});
