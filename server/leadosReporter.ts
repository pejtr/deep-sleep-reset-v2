/**
 * LeadOS Reporter
 * Sends sales events to LeadOS CRM via the ingest API.
 * Endpoint: POST https://crmleadsystem.com/api/ingest/{apiKey}
 *
 * Event types:
 *  - "sale"        : fired immediately on every Stripe purchase
 *  - "daily_summary": fired once per day with aggregated stats
 */

import { ENV } from "./_core/env";

export interface LeadOSSaleEvent {
  eventType: "sale";
  value: number;
  currency: string;
  orderId?: string;
  productName?: string;
  customerEmail?: string;
  timestamp?: string; // ISO-8601
}

export interface LeadOSDailySummaryEvent {
  eventType: "daily_summary";
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  currency: string;
  orderCount: number;
  avgOrderValue: number;
}

type LeadOSEvent = LeadOSSaleEvent | LeadOSDailySummaryEvent;

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Send a single event to LeadOS with automatic retry on transient errors.
 * Returns true on success, false after all retries exhausted.
 */
export async function sendLeadOSEvent(event: LeadOSEvent): Promise<boolean> {
  const url = ENV.leadgenIngestUrl;
  if (!url) {
    console.warn("[LeadOS] LEADGEN_INGEST_URL not configured, skipping event.");
    return false;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (res.ok) {
        console.log(
          `[LeadOS] Event sent successfully: ${event.eventType}`,
          event
        );
        return true;
      }

      const text = await res.text().catch(() => "");
      console.warn(
        `[LeadOS] Attempt ${attempt}/${MAX_RETRIES} failed: HTTP ${res.status} — ${text}`
      );
    } catch (err) {
      console.warn(`[LeadOS] Attempt ${attempt}/${MAX_RETRIES} error:`, err);
    }

    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  console.error(`[LeadOS] All ${MAX_RETRIES} attempts failed for event: ${event.eventType}`);
  return false;
}

/**
 * Convenience wrapper for a single sale event.
 */
export async function reportSaleToLeadOS(params: {
  amountUsd: number;
  orderId?: string;
  productName?: string;
  customerEmail?: string;
}): Promise<boolean> {
  return sendLeadOSEvent({
    eventType: "sale",
    value: params.amountUsd,
    currency: "USD",
    orderId: params.orderId,
    productName: params.productName,
    customerEmail: params.customerEmail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Convenience wrapper for the daily summary event.
 */
export async function reportDailySummaryToLeadOS(params: {
  date: string;
  totalRevenue: number;
  orderCount: number;
}): Promise<boolean> {
  const avgOrderValue =
    params.orderCount > 0
      ? Math.round((params.totalRevenue / params.orderCount) * 100) / 100
      : 0;

  return sendLeadOSEvent({
    eventType: "daily_summary",
    date: params.date,
    totalRevenue: params.totalRevenue,
    currency: "USD",
    orderCount: params.orderCount,
    avgOrderValue,
  });
}
