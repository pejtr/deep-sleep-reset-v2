/**
 * Tests for LeadOS Reporter integration
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock ENV ────────────────────────────────────────────────────────────────
vi.mock("./_core/env", () => ({
  ENV: {
    leadgenIngestUrl: "https://crmleadsystem.com/api/ingest/test_key",
  },
}));

// ─── Mock global fetch ────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { reportSaleToLeadOS, reportDailySummaryToLeadOS, sendLeadOSEvent } from "./leadosReporter";

describe("LeadOS Reporter", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reportSaleToLeadOS sends correct payload on success", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const result = await reportSaleToLeadOS({
      amountUsd: 5.0,
      orderId: "cs_test_abc123",
      productName: "7-Night Deep Sleep Reset ($5)",
      customerEmail: "test@example.com",
    });

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledOnce();

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toBe("https://crmleadsystem.com/api/ingest/test_key");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body);
    expect(body.eventType).toBe("sale");
    expect(body.value).toBe(5.0);
    expect(body.currency).toBe("USD");
    expect(body.orderId).toBe("cs_test_abc123");
    expect(body.customerEmail).toBe("test@example.com");
    expect(body.timestamp).toBeDefined();
  });

  it("reportDailySummaryToLeadOS sends correct payload", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    const result = await reportDailySummaryToLeadOS({
      date: "2026-03-22",
      totalRevenue: 35.0,
      orderCount: 7,
    });

    expect(result).toBe(true);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.eventType).toBe("daily_summary");
    expect(body.date).toBe("2026-03-22");
    expect(body.totalRevenue).toBe(35.0);
    expect(body.orderCount).toBe(7);
    expect(body.avgOrderValue).toBe(5.0);
    expect(body.currency).toBe("USD");
  });

  it("calculates avgOrderValue correctly for zero orders", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await reportDailySummaryToLeadOS({
      date: "2026-03-22",
      totalRevenue: 0,
      orderCount: 0,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.avgOrderValue).toBe(0);
  });

  it("retries on HTTP error and returns false after all retries", async () => {
    // All 3 attempts fail with HTTP 500
    mockFetch.mockResolvedValue({ ok: false, status: 500, text: async () => "Server Error" });

    const result = await sendLeadOSEvent({
      eventType: "sale",
      value: 5,
      currency: "USD",
    });

    expect(result).toBe(false);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  }, 30_000); // longer timeout due to retry delays

  it("returns false when LEADGEN_INGEST_URL is not configured", async () => {
    // Temporarily override ENV to empty URL
    const { ENV } = await import("./_core/env");
    const original = ENV.leadgenIngestUrl;
    (ENV as any).leadgenIngestUrl = "";

    const result = await reportSaleToLeadOS({ amountUsd: 5 });

    expect(result).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();

    (ENV as any).leadgenIngestUrl = original;
  });

  it("returns true on first retry after initial failure", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => "Unavailable" })
      .mockResolvedValueOnce({ ok: true });

    const result = await reportSaleToLeadOS({ amountUsd: 10 });

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 15_000);
});

describe("LeadOS Daily Cron", () => {
  it("runLeadOSDailyCron is importable and is a function", async () => {
    const { runLeadOSDailyCron } = await import("./leadosDailyCron");
    expect(typeof runLeadOSDailyCron).toBe("function");
  });

  it("runLeadOSDailyCron skips when UTC hour is not 0", async () => {
    // Mock Date to return UTC hour = 10
    const mockDate = new Date("2026-03-23T10:30:00.000Z");
    vi.setSystemTime(mockDate);

    const { runLeadOSDailyCron } = await import("./leadosDailyCron");
    // Should return without calling fetch (no DB access needed)
    await expect(runLeadOSDailyCron()).resolves.toBeUndefined();
    expect(mockFetch).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
