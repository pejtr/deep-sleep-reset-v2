/**
 * Email module tests
 * Validates Brevo API key and email sending functionality
 */
import { describe, it, expect, vi } from "vitest";

describe("Brevo API Key Validation", () => {
  it("should have BREVO_API_KEY configured", () => {
    const apiKey = process.env.BREVO_API_KEY;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe("string");
    expect(apiKey!.length).toBeGreaterThan(10);
  });

  it("should validate Brevo API key by calling account endpoint", async () => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("BREVO_API_KEY not set — skipping live test");
      return;
    }

    const response = await fetch("https://api.brevo.com/v3/account", {
      headers: {
        accept: "application/json",
        "api-key": apiKey,
      },
    });

    // 200 = valid key, 401 = invalid key
    expect(response.status).toBe(200);

    const data = await response.json() as { email?: string; plan?: unknown[] };
    expect(data.email).toBeDefined();
    console.log(`[Brevo] Connected as: ${data.email}`);
  });
});

describe("sendPurchaseEmail", () => {
  it("should build correct email for frontEnd product", async () => {
    // Mock fetch to avoid actual API calls in unit tests
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", mockFetch);

    const { sendPurchaseEmail } = await import("./email");

    await expect(
      sendPurchaseEmail({
        to: "test@example.com",
        name: "Test User",
        productKey: "frontEnd",
        amountCents: 500,
      })
    ).resolves.not.toThrow();

    // Verify fetch was called with correct Brevo endpoint
    if (process.env.BREVO_API_KEY) {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.brevo.com/v3/smtp/email",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "api-key": process.env.BREVO_API_KEY,
          }),
        })
      );
    }

    vi.unstubAllGlobals();
  });

  it("should not throw when BREVO_API_KEY is missing (fallback to logging)", async () => {
    const originalKey = process.env.BREVO_API_KEY;
    delete process.env.BREVO_API_KEY;

    const { sendPurchaseEmail } = await import("./email");

    await expect(
      sendPurchaseEmail({
        to: "test@example.com",
        name: "Test User",
        productKey: "upsell1",
        amountCents: 1000,
      })
    ).resolves.not.toThrow();

    process.env.BREVO_API_KEY = originalKey;
  });
});
