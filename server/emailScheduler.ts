// Autonomous Email Scheduler — sends 7-day follow-up sequence after purchase
// Uses database to track scheduled emails and processes them via cron-like interval

import { getDb } from "./db";
import { scheduledEmails } from "../drizzle/schema";
import { eq, lte, and } from "drizzle-orm";
import { sendSequenceEmail } from "./emailService";

const SEQUENCE_DAYS = [1, 2, 3, 5, 7]; // Days after purchase to send emails

// ─── Schedule email sequence for a new customer ───────────────────────────────
export async function scheduleEmailSequence({
  email,
  name,
  chronotype,
  purchasedAt,
}: {
  email: string;
  name?: string;
  chronotype: string;
  purchasedAt: Date;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[EmailScheduler] DB not available — skipping schedule");
    return;
  }

  const inserts = SEQUENCE_DAYS.map((day) => {
    const sendAt = new Date(purchasedAt.getTime() + day * 24 * 60 * 60 * 1000);
    return {
      email,
      name: name || null,
      chronotype,
      day,
      sendAt,
      status: "pending" as const,
    };
  });

  try {
    for (const insert of inserts) {
      await db.insert(scheduledEmails).values(insert);
    }
    console.log(`[EmailScheduler] Scheduled ${inserts.length} emails for ${email}`);
  } catch (err) {
    console.error("[EmailScheduler] Failed to schedule emails:", err);
  }
}

// ─── Process pending emails (called by interval) ──────────────────────────────
export async function processPendingEmails(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    const now = new Date();
    const pending = await db
      .select()
      .from(scheduledEmails)
      .where(
        and(
          eq(scheduledEmails.status, "pending"),
          lte(scheduledEmails.sendAt, now)
        )
      )
      .limit(20); // Process max 20 at a time to avoid rate limits

    if (pending.length === 0) return;

    console.log(`[EmailScheduler] Processing ${pending.length} pending emails`);

    for (const scheduled of pending) {
      try {
        // Mark as processing to prevent duplicate sends
        await db
          .update(scheduledEmails)
          .set({ status: "processing" })
          .where(eq(scheduledEmails.id, scheduled.id));

        const success = await sendSequenceEmail({
          email: scheduled.email,
          name: scheduled.name || undefined,
          chronotype: scheduled.chronotype,
          day: scheduled.day,
        });

        await db
          .update(scheduledEmails)
          .set({
            status: success ? "sent" : "failed",
            sentAt: success ? new Date() : null,
          })
          .where(eq(scheduledEmails.id, scheduled.id));

        console.log(
          `[EmailScheduler] Day ${scheduled.day} email ${success ? "sent" : "failed"} → ${scheduled.email}`
        );
      } catch (err) {
        console.error(`[EmailScheduler] Error processing email ${scheduled.id}:`, err);
        await db
          .update(scheduledEmails)
          .set({ status: "failed" })
          .where(eq(scheduledEmails.id, scheduled.id));
      }
    }
  } catch (err) {
    console.error("[EmailScheduler] processPendingEmails error:", err);
  }
}

// ─── Start scheduler (runs every 5 minutes) ───────────────────────────────────
let schedulerInterval: NodeJS.Timeout | null = null;

export function startEmailScheduler(): void {
  if (schedulerInterval) return; // Already running

  console.log("[EmailScheduler] Starting — checking every 5 minutes");

  // Run immediately on start
  processPendingEmails().catch(console.error);

  // Then every 5 minutes
  schedulerInterval = setInterval(() => {
    processPendingEmails().catch(console.error);
  }, 5 * 60 * 1000);
}

export function stopEmailScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log("[EmailScheduler] Stopped");
  }
}
