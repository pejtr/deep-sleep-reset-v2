/**
 * Tests for the checkout button color A/B test utility (ab-button.ts)
 *
 * These tests run in a Node.js environment, so we mock localStorage/sessionStorage
 * and verify the core assignment, persistence, TTL, and variant distribution logic.
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

// Inject into global before importing the module
Object.defineProperty(global, "localStorage", { value: localStorageMock, writable: true });
Object.defineProperty(global, "window", { value: { localStorage: localStorageMock }, writable: true });

// Now import the module (after globals are set)
import {
  getButtonColorVariant,
  forceButtonColorVariant,
  clearButtonColorVariant,
  BUTTON_VARIANTS,
  type ButtonColorVariant,
} from "../client/src/lib/ab-button";

const STORAGE_KEY = "dsr-btn-color-variant";
const TIMESTAMP_KEY = "dsr-btn-color-assigned-at";
const TTL_MS = 24 * 60 * 60 * 1000;

describe("ab-button: BUTTON_VARIANTS config", () => {
  it("has exactly 3 variants: amber, green, blue", () => {
    const keys = Object.keys(BUTTON_VARIANTS);
    expect(keys).toHaveLength(3);
    expect(keys).toContain("amber");
    expect(keys).toContain("green");
    expect(keys).toContain("blue");
  });

  it("each variant has a non-empty className and hex", () => {
    for (const [, config] of Object.entries(BUTTON_VARIANTS)) {
      expect(config.className.length).toBeGreaterThan(0);
      expect(config.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(config.label.length).toBeGreaterThan(0);
    }
  });

  it("amber variant className includes bg-amber", () => {
    expect(BUTTON_VARIANTS.amber.className).toContain("bg-amber");
  });

  it("green variant className includes bg-emerald", () => {
    expect(BUTTON_VARIANTS.green.className).toContain("bg-emerald");
  });

  it("blue variant className includes bg-blue", () => {
    expect(BUTTON_VARIANTS.blue.className).toContain("bg-blue");
  });
});

describe("ab-button: getButtonColorVariant()", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it("returns a valid variant on first call", () => {
    const variant = getButtonColorVariant();
    expect(["amber", "green", "blue"]).toContain(variant);
  });

  it("persists the variant in localStorage", () => {
    const variant = getButtonColorVariant();
    expect(localStorageMock.getItem(STORAGE_KEY)).toBe(variant);
    expect(localStorageMock.getItem(TIMESTAMP_KEY)).not.toBeNull();
  });

  it("returns the same variant on subsequent calls within TTL", () => {
    const first = getButtonColorVariant();
    const second = getButtonColorVariant();
    expect(second).toBe(first);
  });

  it("re-assigns after TTL expires", () => {
    // Assign a variant with an expired timestamp
    localStorageMock.setItem(STORAGE_KEY, "amber");
    localStorageMock.setItem(TIMESTAMP_KEY, String(Date.now() - TTL_MS - 1000));

    // Mock Math.random to always return green
    vi.spyOn(Math, "random").mockReturnValue(0.5); // 0.5 → green (0.333–0.666)
    const variant = getButtonColorVariant();
    expect(variant).toBe("green");
  });

  it("re-assigns if stored value is invalid", () => {
    localStorageMock.setItem(STORAGE_KEY, "invalid_value");
    localStorageMock.setItem(TIMESTAMP_KEY, String(Date.now()));

    const variant = getButtonColorVariant();
    expect(["amber", "green", "blue"]).toContain(variant);
  });

  it("distributes variants across 3000 simulated visitors", () => {
    const counts: Record<ButtonColorVariant, number> = { amber: 0, green: 0, blue: 0 };
    const N = 3000;

    for (let i = 0; i < N; i++) {
      localStorageMock.clear();
      const v = getButtonColorVariant();
      counts[v]++;
    }

    // Each variant should receive roughly 33% — allow ±5% tolerance
    const tolerance = N * 0.05;
    expect(counts.amber).toBeGreaterThan(N / 3 - tolerance);
    expect(counts.amber).toBeLessThan(N / 3 + tolerance);
    expect(counts.green).toBeGreaterThan(N / 3 - tolerance);
    expect(counts.green).toBeLessThan(N / 3 + tolerance);
    expect(counts.blue).toBeGreaterThan(N / 3 - tolerance);
    expect(counts.blue).toBeLessThan(N / 3 + tolerance);
  });
});

describe("ab-button: forceButtonColorVariant()", () => {
  beforeEach(() => localStorageMock.clear());

  it("forces amber variant", () => {
    forceButtonColorVariant("amber");
    expect(getButtonColorVariant()).toBe("amber");
  });

  it("forces green variant", () => {
    forceButtonColorVariant("green");
    expect(getButtonColorVariant()).toBe("green");
  });

  it("forces blue variant", () => {
    forceButtonColorVariant("blue");
    expect(getButtonColorVariant()).toBe("blue");
  });

  it("overwrites a previously assigned variant", () => {
    forceButtonColorVariant("amber");
    forceButtonColorVariant("blue");
    expect(getButtonColorVariant()).toBe("blue");
  });
});

describe("ab-button: clearButtonColorVariant()", () => {
  beforeEach(() => localStorageMock.clear());

  it("removes the stored variant so a new one is assigned", () => {
    forceButtonColorVariant("amber");
    clearButtonColorVariant();

    expect(localStorageMock.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorageMock.getItem(TIMESTAMP_KEY)).toBeNull();

    // After clearing, a fresh assignment should happen
    const variant = getButtonColorVariant();
    expect(["amber", "green", "blue"]).toContain(variant);
  });
});
