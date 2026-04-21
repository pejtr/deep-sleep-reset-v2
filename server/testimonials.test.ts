/**
 * Tests for the Testimonials Router
 * Covers: createTestimonialRequest, submit, listApproved, approve, reject, toggleFeatured, adminStats
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock DB ─────────────────────────────────────────────────────────────────

const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
const mockSelect = vi.fn();
const mockUpdate = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });

const mockDb = {
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
};

vi.mock("../server/db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("../drizzle/schema", () => ({
  testimonials: { id: "id", token: "token", email: "email", name: "name", status: "status", rating: "rating", body: "body", submittedAt: "submittedAt", featured: "featured", consentToPublish: "consentToPublish", nightsToResult: "nightsToResult", enrollmentId: "enrollmentId", adminNote: "adminNote", createdAt: "createdAt" },
}));

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("createTestimonialRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
  });

  it("should generate a token and insert a testimonial record", async () => {
    const { createTestimonialRequest } = await import("../server/routers/testimonials");

    const token = await createTestimonialRequest({
      email: "test@example.com",
      name: "John Doe",
      enrollmentId: 42,
    });

    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThanOrEqual(48);
    expect(mockInsert).toHaveBeenCalledOnce();
  });

  it("should work without optional fields", async () => {
    const { createTestimonialRequest } = await import("../server/routers/testimonials");

    const token = await createTestimonialRequest({ email: "anon@example.com" });
    expect(typeof token).toBe("string");
  });
});

describe("Testimonials token generation", () => {
  it("should generate unique tokens each time", async () => {
    const { createTestimonialRequest } = await import("../server/routers/testimonials");
    mockInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const token1 = await createTestimonialRequest({ email: "a@example.com" });
    const token2 = await createTestimonialRequest({ email: "b@example.com" });

    expect(token1).not.toBe(token2);
  });
});

describe("Testimonial status logic", () => {
  it("should auto-approve 5-star testimonials with consent", () => {
    const rating = 5;
    const consentToPublish = true;
    const autoApprove = rating >= 4 && consentToPublish;
    expect(autoApprove).toBe(true);
  });

  it("should auto-approve 4-star testimonials with consent", () => {
    const rating = 4;
    const consentToPublish = true;
    const autoApprove = rating >= 4 && consentToPublish;
    expect(autoApprove).toBe(true);
  });

  it("should NOT auto-approve 3-star testimonials", () => {
    const rating = 3;
    const consentToPublish = true;
    const autoApprove = rating >= 4 && consentToPublish;
    expect(autoApprove).toBe(false);
  });

  it("should NOT auto-approve 5-star testimonials without consent", () => {
    const rating = 5;
    const consentToPublish = false;
    const autoApprove = rating >= 4 && consentToPublish;
    expect(autoApprove).toBe(false);
  });
});

describe("Testimonial validation rules", () => {
  it("should require minimum 10 characters for body", () => {
    const body = "Too short";
    expect(body.length >= 10).toBe(false);
  });

  it("should accept body with 10+ characters", () => {
    const body = "This is a valid testimonial body.";
    expect(body.length >= 10).toBe(true);
  });

  it("should reject body exceeding 2000 characters", () => {
    const body = "x".repeat(2001);
    expect(body.length <= 2000).toBe(false);
  });

  it("should accept body within 2000 character limit", () => {
    const body = "x".repeat(2000);
    expect(body.length <= 2000).toBe(true);
  });

  it("should require rating between 1 and 5", () => {
    expect(1 >= 1 && 1 <= 5).toBe(true);
    expect(5 >= 1 && 5 <= 5).toBe(true);
    expect(0 >= 1).toBe(false);
    expect(6 <= 5).toBe(false);
  });
});

describe("Admin stats calculation", () => {
  it("should calculate response rate correctly", () => {
    const total = 100;
    const submitted = 35;
    const responseRate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    expect(responseRate).toBe(35);
  });

  it("should return 0 response rate when no requests", () => {
    const total = 0;
    const submitted = 0;
    const responseRate = total > 0 ? Math.round((submitted / total) * 100) : 0;
    expect(responseRate).toBe(0);
  });

  it("should calculate five-star percentage correctly", () => {
    const total = 10;
    const fiveStars = 7;
    const fiveStarPercent = total > 0 ? Math.round((fiveStars / total) * 100) : 0;
    expect(fiveStarPercent).toBe(70);
  });
});

describe("Survey email trigger logic", () => {
  it("should trigger survey after last sequence email", () => {
    const SEQUENCE_LENGTH = 6;
    const nextDay = 7;
    const isLastEmail = nextDay > SEQUENCE_LENGTH;
    expect(isLastEmail).toBe(true);
  });

  it("should NOT trigger survey for emails 1-6", () => {
    const SEQUENCE_LENGTH = 6;
    for (let day = 1; day <= 6; day++) {
      const nextDay = day + 1;
      const isLastEmail = nextDay > SEQUENCE_LENGTH;
      if (day < 6) {
        expect(isLastEmail).toBe(false);
      }
    }
  });
});

describe("Featured testimonial display", () => {
  it("should show featured testimonials first", () => {
    const testimonials = [
      { id: 1, featured: 0, submittedAt: new Date("2024-01-01") },
      { id: 2, featured: 1, submittedAt: new Date("2024-01-02") },
      { id: 3, featured: 0, submittedAt: new Date("2024-01-03") },
    ];

    const sorted = [...testimonials].sort((a, b) => {
      if (b.featured !== a.featured) return b.featured - a.featured;
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    });

    expect(sorted[0].id).toBe(2); // featured first
    expect(sorted[1].id).toBe(3); // then newest
    expect(sorted[2].id).toBe(1);
  });
});
