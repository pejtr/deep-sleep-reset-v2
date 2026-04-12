import { describe, expect, it, vi, beforeEach } from "vitest";
import { FUNNEL_PRODUCTS } from "./products";

// Mock getDb
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

describe("FUNNEL_PRODUCTS", () => {
  it("has all required product keys", () => {
    expect(FUNNEL_PRODUCTS).toHaveProperty("tripwire");
    expect(FUNNEL_PRODUCTS).toHaveProperty("oto1");
    expect(FUNNEL_PRODUCTS).toHaveProperty("oto2");
    expect(FUNNEL_PRODUCTS).toHaveProperty("oto3");
  });

  it("tripwire costs $1 (100 cents)", () => {
    expect(FUNNEL_PRODUCTS.tripwire.price).toBe(100);
  });

  it("oto1 costs $7 (700 cents)", () => {
    expect(FUNNEL_PRODUCTS.oto1.price).toBe(700);
  });

  it("oto2 costs $17 (1700 cents)", () => {
    expect(FUNNEL_PRODUCTS.oto2.price).toBe(1700);
  });

  it("oto3 costs $27 (2700 cents)", () => {
    expect(FUNNEL_PRODUCTS.oto3.price).toBe(2700);
  });

  it("all products have successRedirect", () => {
    Object.values(FUNNEL_PRODUCTS).forEach((product) => {
      expect(product.successRedirect).toBeTruthy();
      expect(product.successRedirect).toMatch(/^\//);
    });
  });

  it("tripwire redirects to upsell/1 on success", () => {
    expect(FUNNEL_PRODUCTS.tripwire.successRedirect).toBe("/upsell/1");
  });

  it("oto3 redirects to thank-you on success", () => {
    expect(FUNNEL_PRODUCTS.oto3.successRedirect).toBe("/thank-you");
  });

  it("all products have displayPrice and originalPrice", () => {
    Object.values(FUNNEL_PRODUCTS).forEach((product) => {
      expect(product.displayPrice).toBeTruthy();
      expect(product.originalPrice).toBeTruthy();
    });
  });

  it("all products have discountPercent > 0", () => {
    Object.values(FUNNEL_PRODUCTS).forEach((product) => {
      expect(product.discountPercent).toBeGreaterThan(0);
    });
  });
});

describe("Funnel price validation", () => {
  it("all prices meet Stripe minimum ($0.50 = 50 cents)", () => {
    Object.values(FUNNEL_PRODUCTS).forEach((product) => {
      expect(product.price).toBeGreaterThanOrEqual(50);
    });
  });

  it("prices are in ascending order through funnel", () => {
    const prices = [
      FUNNEL_PRODUCTS.tripwire.price,
      FUNNEL_PRODUCTS.oto1.price,
      FUNNEL_PRODUCTS.oto2.price,
      FUNNEL_PRODUCTS.oto3.price,
    ];
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThan(prices[i - 1]);
    }
  });
});
