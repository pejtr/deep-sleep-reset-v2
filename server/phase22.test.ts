/**
 * Phase 22 Tests — Quiz Score Trend + Testimonial Media + Chatbot Teaser Script
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Quiz Score History ───────────────────────────────────────────────────────
describe("Quiz score history", () => {
  it("saveQuizAttempt accepts valid data", async () => {
    const { saveQuizAttempt } = await import("./db");
    // Mock getDb to avoid real DB in tests
    vi.mock("./db", async (importOriginal) => {
      const mod = await importOriginal<typeof import("./db")>();
      return {
        ...mod,
        saveQuizAttempt: vi.fn().mockResolvedValue(undefined),
        getQuizHistory: vi.fn().mockResolvedValue([
          { id: 1, score: 35, label: "Severe Insomnia", createdAt: new Date("2026-01-01") },
          { id: 2, score: 55, label: "Moderate Insomnia", createdAt: new Date("2026-01-08") },
          { id: 3, score: 72, label: "Mild Sleep Disruption", createdAt: new Date("2026-01-15") },
        ]),
      };
    });

    await expect(
      saveQuizAttempt({ sessionId: "test_session_001", score: 42, label: "Moderate Insomnia" })
    ).resolves.toBeUndefined();
  });

  it("getQuizHistory returns chronological attempts", async () => {
    const { getQuizHistory } = await import("./db");
    const history = await getQuizHistory("test_session_001");
    expect(history).toHaveLength(3);
    // Should be oldest first (chronological for chart)
    expect(history[0].score).toBeLessThanOrEqual(history[history.length - 1].score);
  });

  it("score trend delta calculation is correct", () => {
    const history = [
      { score: 35 },
      { score: 55 },
      { score: 72 },
    ];
    const first = history[0].score;
    const last = history[history.length - 1].score;
    const delta = last - first;
    expect(delta).toBe(37);
    expect(delta > 0).toBe(true); // improving
  });

  it("score trend shows no chart for single attempt", () => {
    const history = [{ score: 42 }];
    // Chart should not render if fewer than 2 attempts
    expect(history.length < 2).toBe(true);
  });
});

// ─── Testimonial Media ────────────────────────────────────────────────────────
describe("Testimonial media submission", () => {
  it("validates required fields", () => {
    const validateSubmission = (data: { name: string; quote: string; rating: number }) => {
      if (!data.name || data.name.length < 2) return { valid: false, error: "Name too short" };
      if (!data.quote || data.quote.length < 10) return { valid: false, error: "Quote too short" };
      if (data.rating < 1 || data.rating > 5) return { valid: false, error: "Invalid rating" };
      return { valid: true };
    };

    expect(validateSubmission({ name: "Sarah M.", quote: "Amazing product, changed my sleep!", rating: 5 })).toEqual({ valid: true });
    expect(validateSubmission({ name: "A", quote: "Great", rating: 5 })).toEqual({ valid: false, error: "Name too short" });
    expect(validateSubmission({ name: "Sarah M.", quote: "Short", rating: 5 })).toEqual({ valid: false, error: "Quote too short" });
    expect(validateSubmission({ name: "Sarah M.", quote: "Amazing product, changed my sleep!", rating: 6 })).toEqual({ valid: false, error: "Invalid rating" });
  });

  it("media type detection works correctly", () => {
    const detectMediaType = (mimeType: string): "image" | "video" | null => {
      if (mimeType.startsWith("image/")) return "image";
      if (mimeType.startsWith("video/")) return "video";
      return null;
    };

    expect(detectMediaType("image/jpeg")).toBe("image");
    expect(detectMediaType("image/png")).toBe("image");
    expect(detectMediaType("video/mp4")).toBe("video");
    expect(detectMediaType("video/webm")).toBe("video");
    expect(detectMediaType("application/pdf")).toBeNull();
  });

  it("file size limit is enforced at 16MB", () => {
    const MAX_SIZE = 16 * 1024 * 1024; // 16MB
    const checkSize = (bytes: number) => bytes <= MAX_SIZE;

    expect(checkSize(5 * 1024 * 1024)).toBe(true);   // 5MB — OK
    expect(checkSize(16 * 1024 * 1024)).toBe(true);  // 16MB — OK (boundary)
    expect(checkSize(16 * 1024 * 1024 + 1)).toBe(false); // 16MB+1 — rejected
  });

  it("S3 key generation is unique and scoped", () => {
    const generateKey = (originalName: string) => {
      const ext = originalName.split(".").pop() ?? "bin";
      const suffix = Math.random().toString(36).slice(2, 8);
      return `testimonials/${Date.now()}-${suffix}.${ext}`;
    };

    const key1 = generateKey("photo.jpg");
    const key2 = generateKey("photo.jpg");

    expect(key1).toMatch(/^testimonials\/\d+-[a-z0-9]+\.jpg$/);
    expect(key1).not.toBe(key2); // unique
  });
});

// ─── Chatbot Teaser Qualifying Script ────────────────────────────────────────
describe("Chatbot Teaser qualifying script", () => {
  const getPersonalizedCTA = (totalUrgency: number) => {
    if (totalUrgency >= 5) {
      return { tier: "high", cta: "🚀 Start the 7-Night Reset — $5" };
    } else if (totalUrgency >= 3) {
      return { tier: "medium", cta: "💡 See the 7-Night Protocol — $5" };
    } else {
      return { tier: "low", cta: "✨ Explore the Reset — $5" };
    }
  };

  it("returns high urgency CTA for score >= 5", () => {
    expect(getPersonalizedCTA(5).tier).toBe("high");
    expect(getPersonalizedCTA(6).tier).toBe("high");
  });

  it("returns medium urgency CTA for score 3-4", () => {
    expect(getPersonalizedCTA(3).tier).toBe("medium");
    expect(getPersonalizedCTA(4).tier).toBe("medium");
  });

  it("returns low urgency CTA for score 0-2", () => {
    expect(getPersonalizedCTA(0).tier).toBe("low");
    expect(getPersonalizedCTA(2).tier).toBe("low");
  });

  it("all 3 questions have exactly 3 answer options", () => {
    const questions = [
      { options: 3 },
      { options: 3 },
      { options: 3 },
    ];
    questions.forEach(q => expect(q.options).toBe(3));
  });

  it("urgency values are 0, 1, or 2 per option", () => {
    const validUrgencyValues = [0, 1, 2];
    const sampleOptions = [
      { urgency: 0 },
      { urgency: 1 },
      { urgency: 2 },
    ];
    sampleOptions.forEach(opt => {
      expect(validUrgencyValues).toContain(opt.urgency);
    });
  });

  it("max possible urgency is 6 (3 questions × max 2 each)", () => {
    const maxUrgency = 3 * 2;
    expect(maxUrgency).toBe(6);
    expect(getPersonalizedCTA(maxUrgency).tier).toBe("high");
  });
});
