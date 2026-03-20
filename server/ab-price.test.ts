/**
 * Tests for the price A/B test utility (ab-price.ts)
 *
 * Verifies assignment logic, persistence, TTL expiry, forced overrides,
 * and the 50/50 distribution across simulated visitors.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// --- localStorage mock ---
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

Object.defineProperty(global, "localStorage", { value: localStorageMock, writable: true });
Object.defineProperty(global, "window", { value: { localStorage: localStorageMock }, writable: true });

import {
  getPriceVariant,
  forcePriceVariant,
  clearPriceVariant,
  PRICE_VARIANTS,
  type PriceVariant,
} from "../client/src/lib/ab-price";

const STORAGE_KEY = "dsr-price-variant";
const TIMESTAMP_KEY = "dsr-price-assigned-at";
const TTL_MS = 24 * 60 * 60 * 1000;

describe("ab-price: PRICE_VARIANTS config", () => {
  it("has exactly 2 variants: price_5 and price_7", () => {
    const keys = Object.keys(PRICE_VARIANTS);
    expect(keys).toHaveLength(2);
    expect(keys).toContain("price_5");
    expect(keys).toContain("price_7");
  });

  it("price_5 variant has correct values", () => {
    const v = PRICE_VARIANTS.price_5;
    expect(v.priceUsd).toBe(5);
    expect(v.priceCents).toBe(500);
    expect(v.productKey).toBe("frontEnd");
    expect(v.label).toContain("$5");
  });

  it("price_7 variant has correct values", () => {
    const v = PRICE_VARIANTS.price_7;
    expect(v.priceUsd).toBe(7);
    expect(v.priceCents).toBe(700);
    expect(v.productKey).toBe("frontEnd7");
    expect(v.label).toContain("$7");
  });

  it("price_7 is 40% more expensive than price_5", () => {
    const ratio = PRICE_VARIANTS.price_7.priceCents / PRICE_VARIANTS.price_5.priceCents;
    expect(ratio).toBeCloseTo(1.4, 2);
  });

  it("RPV break-even: $7 wins if CVR is at least 71.4% of $5 CVR", () => {
    // At break-even: 5 * cvr5 = 7 * cvr7 → cvr7/cvr5 = 5/7 ≈ 0.714
    const breakEvenRatio = PRICE_VARIANTS.price_5.priceCents / PRICE_VARIANTS.price_7.priceCents;
    expect(breakEvenRatio).toBeCloseTo(0.714, 2);
  });
});

describe("ab-price: getPriceVariant()", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it("returns a valid variant on first call", () => {
    const variant = getPriceVariant();
    expect(["price_5", "price_7"]).toContain(variant);
  });

  it("persists the variant in localStorage", () => {
    const variant = getPriceVariant();
    expect(localStorageMock.getItem(STORAGE_KEY)).toBe(variant);
    expect(localStorageMock.getItem(TIMESTAMP_KEY)).not.toBeNull();
  });

  it("returns the same variant on subsequent calls within TTL", () => {
    const first = getPriceVariant();
    const second = getPriceVariant();
    expect(second).toBe(first);
  });

  it("re-assigns after TTL expires", () => {
    localStorageMock.setItem(STORAGE_KEY, "price_5");
    localStorageMock.setItem(TIMESTAMP_KEY, String(Date.now() - TTL_MS - 1000));

    // Mock Math.random to return 0.8 → price_7
    vi.spyOn(Math, "random").mockReturnValue(0.8);
    const variant = getPriceVariant();
    expect(variant).toBe("price_7");
  });

  it("re-assigns if stored value is invalid", () => {
    localStorageMock.setItem(STORAGE_KEY, "price_99");
    localStorageMock.setItem(TIMESTAMP_KEY, String(Date.now()));

    const variant = getPriceVariant();
    expect(["price_5", "price_7"]).toContain(variant);
  });

  it("Math.random < 0.5 → price_5", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.3);
    const variant = getPriceVariant();
    expect(variant).toBe("price_5");
  });

  it("Math.random >= 0.5 → price_7", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.7);
    const variant = getPriceVariant();
    expect(variant).toBe("price_7");
  });

  it("distributes variants 50/50 across 2000 simulated visitors", () => {
    const counts: Record<PriceVariant, number> = { price_5: 0, price_7: 0 };
    const N = 2000;

    for (let i = 0; i < N; i++) {
      localStorageMock.clear();
      const v = getPriceVariant();
      counts[v]++;
    }

    // Each variant should receive roughly 50% — allow ±5% tolerance
    const tolerance = N * 0.05;
    expect(counts.price_5).toBeGreaterThan(N / 2 - tolerance);
    expect(counts.price_5).toBeLessThan(N / 2 + tolerance);
    expect(counts.price_7).toBeGreaterThan(N / 2 - tolerance);
    expect(counts.price_7).toBeLessThan(N / 2 + tolerance);
  });
});

describe("ab-price: forcePriceVariant()", () => {
  beforeEach(() => localStorageMock.clear());

  it("forces price_5 variant", () => {
    forcePriceVariant("price_5");
    expect(getPriceVariant()).toBe("price_5");
  });

  it("forces price_7 variant", () => {
    forcePriceVariant("price_7");
    expect(getPriceVariant()).toBe("price_7");
  });

  it("overwrites a previously assigned variant", () => {
    forcePriceVariant("price_5");
    forcePriceVariant("price_7");
    expect(getPriceVariant()).toBe("price_7");
  });
});

describe("ab-price: clearPriceVariant()", () => {
  beforeEach(() => localStorageMock.clear());

  it("removes the stored variant so a new one is assigned", () => {
    forcePriceVariant("price_5");
    clearPriceVariant();

    expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorageMock.getItem(TIMESTAMP_KEY)).toBeNull();

    const variant = getPriceVariant();
    expect(["price_5", "price_7"]).toContain(variant);
  });
});
