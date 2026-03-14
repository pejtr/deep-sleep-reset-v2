/**
 * Email Sequence Router
 * Handles 7-day post-purchase nurture sequence enrollment, sending, and admin management.
 *
 * Flow:
 * 1. Customer purchases → stripe webhook calls enrollInSequence()
 * 2. Cron job runs every hour → processSequenceQueue() sends due emails
 * 3. Admin can view enrollments, send logs, and manually trigger sends
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { emailSequenceEnrollments, emailSendLog } from "../../drizzle/schema";
import { eq, and, lte, desc, sql } from "drizzle-orm";
import { EMAIL_SEQUENCE, SEQUENCE_LENGTH, SURVEY_EMAIL } from "../emailSequenceTemplates";

const UPSELL_URL = "https://deep-sleep-reset.com/upsell-1";
const HOURS_BETWEEN_EMAILS = 24; // Send one email per day

// ─── Helper: enroll a customer in the sequence ────────────────────────────────

export async function enrollInSequence(options: {
  email: string;
  name?: string;
  orderId?: number;
  stripeSessionId?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if already enrolled (don't double-enroll)
  const existing = await db
    .select({ id: emailSequenceEnrollments.id, status: emailSequenceEnrollments.status })
    .from(emailSequenceEnrollments)
    .where(eq(emailSequenceEnrollments.email, options.email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[EmailSequence] ${options.email} already enrolled — skipping`);
    return;
  }

  // Schedule first email for 24 hours after purchase
  const nextSendAt = new Date(Date.now() + HOURS_BETWEEN_EMAILS * 60 * 60 * 1000);

  await db.insert(emailSequenceEnrollments).values({
    email: options.email,
    name: options.name,
    orderId: options.orderId,
    stripeSessionId: options.stripeSessionId,
    nextDayToSend: 1,
    nextSendAt,
    status: "active",
    purchasedUpsell: 0,
  });

  console.log(`[EmailSequence] Enrolled ${options.email} — first email at ${nextSendAt.toISOString()}`);
}

// ─── Helper: process the queue (called by cron) ───────────────────────────────

export async function processSequenceQueue(): Promise<{ sent: number; errors: number }> {
  const db = await getDb();
  if (!db) return { sent: 0, errors: 0 };

  const now = new Date();
  let sent = 0;
  let errors = 0;

  // Find all active enrollments where nextSendAt is in the past
  const due = await db
    .select()
    .from(emailSequenceEnrollments)
    .where(
      and(
        eq(emailSequenceEnrollments.status, "active"),
        lte(emailSequenceEnrollments.nextSendAt, now)
      )
    )
    .limit(50); // Process max 50 at a time

  for (const enrollment of due) {
    const dayIndex = enrollment.nextDayToSend - 1; // 0-indexed into EMAIL_SEQUENCE array
    const emailTemplate = EMAIL_SEQUENCE[dayIndex];

    if (!emailTemplate) {
      // Sequence complete
      await db
        .update(emailSequenceEnrollments)
        .set({ status: "completed" })
        .where(eq(emailSequenceEnrollments.id, enrollment.id));
      continue;
    }

    const firstName = enrollment.name?.split(" ")[0] || "there";
    const htmlContent = emailTemplate.buildHtml(firstName, UPSELL_URL);
    const textContent = emailTemplate.buildText(firstName, UPSELL_URL);

    let success = false;
    let errorMessage: string | undefined;
    let messageId: string | undefined;

    try {
      await sendSequenceEmail({
        to: enrollment.email,
        name: enrollment.name ?? undefined,
        subject: emailTemplate.subject,
        htmlContent,
        textContent,
      });
      success = true;
      sent++;
      console.log(`[EmailSequence] Sent Day ${enrollment.nextDayToSend} to ${enrollment.email}`);
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      errors++;
      console.error(`[EmailSequence] Failed Day ${enrollment.nextDayToSend} to ${enrollment.email}:`, errorMessage);
    }

    // Log the send attempt
    await db.insert(emailSendLog).values({
      enrollmentId: enrollment.id,
      email: enrollment.email,
      dayNumber: enrollment.nextDayToSend,
      subject: emailTemplate.subject,
      success: success ? 1 : 0,
      errorMessage,
      messageId,
    });

    if (success) {
      const nextDay = enrollment.nextDayToSend + 1;
      const isLastEmail = nextDay > SEQUENCE_LENGTH;

      await db
        .update(emailSequenceEnrollments)
        .set({
          nextDayToSend: nextDay,
          nextSendAt: new Date(Date.now() + HOURS_BETWEEN_EMAILS * 60 * 60 * 1000),
          status: isLastEmail ? "completed" : "active",
        })
        .where(eq(emailSequenceEnrollments.id, enrollment.id));

      // After last email (Day 6), trigger testimonial survey email
      if (isLastEmail) {
        try {
          // Create testimonial request and get token
          const { createTestimonialRequest } = await import("./testimonials");
          const token = await createTestimonialRequest({
            email: enrollment.email,
            name: enrollment.name ?? undefined,
            enrollmentId: enrollment.id,
          });
          const surveyUrl = `https://deep-sleep-reset.com/testimonial?token=${token}`;
          const firstName = enrollment.name?.split(" ")[0] || "there";
          await sendSequenceEmail({
            to: enrollment.email,
            name: enrollment.name ?? undefined,
            subject: SURVEY_EMAIL.subject,
            htmlContent: SURVEY_EMAIL.buildHtml(firstName, surveyUrl),
            textContent: SURVEY_EMAIL.buildText(firstName, surveyUrl),
          });
          console.log(`[EmailSequence] Survey email sent to ${enrollment.email}`);
        } catch (err) {
          console.error(`[EmailSequence] Failed to send survey email to ${enrollment.email}:`, err);
        }
      }
    }
  }

  return { sent, errors };
}

// ─── Email sender (uses Brevo, same as existing email.ts) ────────────────────

async function sendSequenceEmail(options: {
  to: string;
  name?: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.log(`[EmailSequence] BREVO_API_KEY not set — logging email:`);
    console.log(`  To: ${options.to} | Subject: ${options.subject}`);
    return;
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Deep Sleep Reset", email: "support@deepsleepreset.com" },
      to: [{ email: options.to, name: options.name || options.to }],
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo API error ${response.status}: ${detail}`);
  }
}

// ─── tRPC Router ──────────────────────────────────────────────────────────────

export const emailSequenceRouter = router({
  // Admin: get all enrollments with stats
  getEnrollments: protectedProcedure
    .input(z.object({
      status: z.enum(["active", "completed", "unsubscribed", "paused", "all"]).default("all"),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) return [];

      const conditions = input.status !== "all"
        ? [eq(emailSequenceEnrollments.status, input.status as "active" | "completed" | "unsubscribed" | "paused")]
        : [];

      return db
        .select()
        .from(emailSequenceEnrollments)
        .where(conditions.length > 0 ? conditions[0] : undefined)
        .orderBy(desc(emailSequenceEnrollments.createdAt))
        .limit(input.limit);
    }),

  // Admin: get send log for a specific enrollment
  getSendLog: protectedProcedure
    .input(z.object({ enrollmentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(emailSendLog)
        .where(eq(emailSendLog.enrollmentId, input.enrollmentId))
        .orderBy(emailSendLog.dayNumber);
    }),

  // Admin: get all send logs (recent)
  getAllSendLogs: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(200).default(100) }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(emailSendLog)
        .orderBy(desc(emailSendLog.sentAt))
        .limit(input.limit);
    }),

  // Admin: get sequence stats
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admin only");
    const db = await getDb();
    if (!db) return null;

    const [totalEnrolled] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSequenceEnrollments);

    const [activeCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSequenceEnrollments)
      .where(eq(emailSequenceEnrollments.status, "active"));

    const [completedCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSequenceEnrollments)
      .where(eq(emailSequenceEnrollments.status, "completed"));

    const [totalSent] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSendLog)
      .where(eq(emailSendLog.success, 1));

    const [totalFailed] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSendLog)
      .where(eq(emailSendLog.success, 0));

    const [upsellCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(emailSequenceEnrollments)
      .where(eq(emailSequenceEnrollments.purchasedUpsell, 1));

    const deliveryRate = totalSent.count + totalFailed.count > 0
      ? Math.round((totalSent.count / (totalSent.count + totalFailed.count)) * 100)
      : 100;

    return {
      totalEnrolled: totalEnrolled.count,
      active: activeCount.count,
      completed: completedCount.count,
      totalEmailsSent: totalSent.count,
      totalFailed: totalFailed.count,
      deliveryRate,
      upsellConversions: upsellCount.count,
      upsellRate: totalEnrolled.count > 0
        ? Math.round((upsellCount.count / totalEnrolled.count) * 100)
        : 0,
    };
  }),

  // Admin: manually trigger queue processing
  processQueue: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new Error("Admin only");
    return processSequenceQueue();
  }),

  // Admin: manually enroll an email
  enrollManual: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      await enrollInSequence({ email: input.email, name: input.name });
      return { success: true };
    }),

  // Admin: pause or resume an enrollment
  updateEnrollmentStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["active", "paused", "unsubscribed"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new Error("Admin only");
      const db = await getDb();
      if (!db) throw new Error("DB unavailable");

      await db
        .update(emailSequenceEnrollments)
        .set({ status: input.status })
        .where(eq(emailSequenceEnrollments.id, input.id));

      return { success: true };
    }),

  // Public: unsubscribe endpoint (called from email footer link)
  unsubscribe: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      await db
        .update(emailSequenceEnrollments)
        .set({ status: "unsubscribed" })
        .where(eq(emailSequenceEnrollments.email, input.email));

      return { success: true };
    }),
});
