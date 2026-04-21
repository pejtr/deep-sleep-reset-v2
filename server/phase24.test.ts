import { describe, it, expect, vi } from "vitest";

// ─── Meta CAPI module ────────────────────────────────────────────────────────

describe("Meta CAPI helper", () => {
  it("exports fireMetaPurchase, fireMetaLead, fireMetaInitiateCheckout", async () => {
    const mod = await import("./meta-capi");
    expect(typeof mod.fireMetaPurchase).toBe("function");
    expect(typeof mod.fireMetaLead).toBe("function");
    expect(typeof mod.fireMetaInitiateCheckout).toBe("function");
  });

  it("fireMetaPurchase does not throw when META_PIXEL_ID is empty", async () => {
    const mod = await import("./meta-capi");
    // Should gracefully no-op when pixel ID is not configured
    await expect(
      mod.fireMetaPurchase({ email: "test@example.com", value: 5, currency: "USD", orderId: "ord_123" })
    ).resolves.not.toThrow();
  });

  it("fireMetaLead does not throw when META_PIXEL_ID is empty", async () => {
    const mod = await import("./meta-capi");
    await expect(
      mod.fireMetaLead({ email: "test@example.com", source: "quiz" })
    ).resolves.not.toThrow();
  });

  it("fireMetaInitiateCheckout does not throw when META_PIXEL_ID is empty", async () => {
    const mod = await import("./meta-capi");
    await expect(
      mod.fireMetaInitiateCheckout({ value: 5, productName: "frontEnd" })
    ).resolves.not.toThrow();
  });
});

// ─── Abandoned checkout DB helpers ───────────────────────────────────────────

describe("Abandoned checkout DB helpers", () => {
  it("exports recordAbandonedCheckout, getAbandonedCheckoutStats, markAbandonedCheckoutRecovered", async () => {
    const mod = await import("./db");
    expect(typeof mod.recordAbandonedCheckout).toBe("function");
    expect(typeof mod.getAbandonedCheckoutStats).toBe("function");
    expect(typeof mod.markAbandonedCheckoutRecovered).toBe("function");
  });
});

// ─── Upsell3 product definition ──────────────────────────────────────────────

describe("Upsell3 product", () => {
  it("exists in PRODUCTS with correct price", async () => {
    const { PRODUCTS } = await import("./stripe/products");
    expect(PRODUCTS.upsell3).toBeDefined();
    expect(PRODUCTS.upsell3.priceInCents).toBe(1900);
    expect(PRODUCTS.upsell3.name).toContain("Sleep Mastery");
  });

  it("has correct success and cancel paths", async () => {
    const { PRODUCTS } = await import("./stripe/products");
    expect(PRODUCTS.upsell3.successPath).toContain("thank-you");
    expect(PRODUCTS.upsell3.cancelPath).toBeDefined();
  });
});

// ─── A/B headline variants ──────────────────────────────────────────────────

describe("A/B headline variants", () => {
  it("has 3 variants (a, b, c) in ab-test.ts", async () => {
    // We can't import client-side code directly, but we can check the file exists
    const fs = await import("fs");
    const content = fs.readFileSync("client/src/lib/ab-test.ts", "utf-8");
    expect(content).toContain('"a"');
    expect(content).toContain('"b"');
    expect(content).toContain('"c"');
    expect(content).toContain("Wake Up at 3AM");
  });
});

// ─── ENV config ─────────────────────────────────────────────────────────────

describe("ENV config", () => {
  it("includes metaPixelId and metaCapiToken", async () => {
    const { ENV } = await import("./_core/env");
    expect("metaPixelId" in ENV).toBe(true);
    expect("metaCapiToken" in ENV).toBe(true);
  });
});

// ─── Product key schema ─────────────────────────────────────────────────────

describe("Product key schema", () => {
  it("includes upsell3 in the product keys", async () => {
    const { PRODUCTS } = await import("./stripe/products");
    const keys = Object.keys(PRODUCTS);
    expect(keys).toContain("upsell3");
    expect(keys).toContain("frontEnd");
    expect(keys).toContain("exitDiscount");
    expect(keys).toContain("upsell1");
    expect(keys).toContain("upsell2");
  });
});
