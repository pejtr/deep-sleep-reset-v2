/**
 * LeadOS Daily Summary Cron
 *
 * Runs every hour (registered in server/_core/index.ts).
 * At midnight UTC (00:00–01:00 window), aggregates yesterday's sales
 * from the orders table and sends a daily_summary event to LeadOS.
 *
 * Uses a simple "last-run" timestamp to ensure the report fires only once
 * per day even if the server restarts within the midnight window.
 */

import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { reportDailySummaryToLeadOS } from "./leadosReporter";

// In-memory guard: stores the last date (YYYY-MM-DD UTC) for which a report was sent
let lastReportedDate: string | null = null;

function getUtcDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Called every hour by the server cron.
 * Only fires the actual LeadOS report during the midnight UTC window (00:00–01:00).
 */
export async function runLeadOSDailyCron(): Promise<void> {
  const now = new Date();
  const utcHour = now.getUTCHours();

  // Only fire in the 00:00–01:00 UTC window
  if (utcHour !== 0) {
    return;
  }

  // Determine yesterday's date in UTC
  const yesterday = new Date(now);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const reportDate = getUtcDateString(yesterday);

  // Guard: don't send the same day twice
  if (lastReportedDate === reportDate) {
    console.log(`[LeadOS Cron] Daily report for ${reportDate} already sent, skipping.`);
    return;
  }

  console.log(`[LeadOS Cron] Generating daily summary for ${reportDate}...`);

  try {
    const db = await getDb();
    if (!db) {
      console.error("[LeadOS Cron] Database not available, skipping daily report.");
      return;
    }

    // Define the UTC day window for yesterday
    const dayStart = new Date(`${reportDate}T00:00:00.000Z`);
    const dayEnd = new Date(`${reportDate}T23:59:59.999Z`);

    // Aggregate completed orders for yesterday
    const [revenueRow] = await db
      .select({ total: sql<number>`COALESCE(SUM(amount_cents), 0)` })
      .from(orders)
      .where(
        and(
          eq(orders.status, "completed"),
          gte(orders.createdAt, dayStart),
          lt(orders.createdAt, dayEnd)
        )
      );

    const [countRow] = await db
      .select({ cnt: sql<number>`COUNT(*)` })
      .from(orders)
      .where(
        and(
          eq(orders.status, "completed"),
          gte(orders.createdAt, dayStart),
          lt(orders.createdAt, dayEnd)
        )
      );

    const totalRevenueCents = Number(revenueRow?.total ?? 0);
    const orderCount = Number(countRow?.cnt ?? 0);
    const totalRevenueUsd = Math.round(totalRevenueCents / 100 * 100) / 100;

    console.log(
      `[LeadOS Cron] ${reportDate}: ${orderCount} orders, $${totalRevenueUsd} revenue`
    );

    const success = await reportDailySummaryToLeadOS({
      date: reportDate,
      totalRevenue: totalRevenueUsd,
      orderCount,
    });

    if (success) {
      lastReportedDate = reportDate;
      console.log(`[LeadOS Cron] Daily report for ${reportDate} sent successfully.`);
    } else {
      console.error(`[LeadOS Cron] Failed to send daily report for ${reportDate}.`);
    }
  } catch (err) {
    console.error("[LeadOS Cron] Unexpected error:", err);
  }
}
