/**
 * Testimonials Router
 * Handles testimonial collection, moderation, and public display.
 *
 * Flow:
 * 1. Day 7 email sequence email sends a unique link: /testimonial?token=<uuid>
 * 2. Customer fills in star rating + written testimonial on the public form
 * 3. Admin reviews in /admin → Testimonials tab
 * 4. Approved testimonials appear on the landing page
 */

import { z } from "zod";
import { eq, desc, and, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { testimonials } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";

// ─── Helper ──────────────────────────────────────────────────────────────────

async function requireDb() {
  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

function generateToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ─── Standalone helper (called by email sequence) ───────────────────────────

export async function createTestimonialRequest(options: {
  email: string;
  name?: string;
  enrollmentId?: number;
}): Promise<string> {
  const db = await requireDb();
  const token = generateToken();

  await db.insert(testimonials).values({
    token,
    email: options.email,
    name: options.name ?? null,
    enrollmentId: options.enrollmentId ?? null,
    status: "pending",
    featured: 0,
    consentToPublish: 0,
  });

  return token;
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const testimonialsRouter = router({
  /**
   * Create a testimonial request record (called by email sequence on Day 7).
   * Returns the unique token to embed in the survey email link.
   */
  createRequest: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        enrollmentId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const token = generateToken();

      await db.insert(testimonials).values({
        token,
        email: input.email,
        name: input.name ?? null,
        enrollmentId: input.enrollmentId ?? null,
        status: "pending",
        featured: 0,
        consentToPublish: 0,
      });

      return { token };
    }),

  /**
   * Get testimonial request by token (public — used by the form page).
   * Returns basic info to pre-fill the form (name, whether already submitted).
   */
  getByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await requireDb();

      const [row] = await db
        .select({
          id: testimonials.id,
          name: testimonials.name,
          submittedAt: testimonials.submittedAt,
        })
        .from(testimonials)
        .where(eq(testimonials.token, input.token))
        .limit(1);

      if (!row) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired testimonial link." });
      }

      return {
        name: row.name,
        alreadySubmitted: !!row.submittedAt,
      };
    }),

  /**
   * Submit a testimonial (public — called from the form page).
   */
  submit: publicProcedure
    .input(
      z.object({
        token: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        body: z.string().min(10).max(2000),
        nightsToResult: z.number().int().min(1).max(30).optional(),
        consentToPublish: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();

      // Find the testimonial record
      const [existing] = await db
        .select()
        .from(testimonials)
        .where(eq(testimonials.token, input.token))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired testimonial link." });
      }

      if (existing.submittedAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You have already submitted a testimonial." });
      }

      await db
        .update(testimonials)
        .set({
          rating: input.rating,
          body: input.body,
          nightsToResult: input.nightsToResult ?? null,
          consentToPublish: input.consentToPublish ? 1 : 0,
          submittedAt: new Date(),
          // Auto-approve 4-5 star testimonials with consent
          status: input.rating >= 4 && input.consentToPublish ? "approved" : "pending",
        })
        .where(eq(testimonials.token, input.token));

      return { success: true };
    }),

  /**
   * List approved testimonials for the landing page (public).
   */
  listApproved: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(12),
        featuredFirst: z.boolean().default(true),
      })
    )
    .query(async ({ input }) => {
      const db = await requireDb();

      const rows = await db
        .select({
          id: testimonials.id,
          name: testimonials.name,
          rating: testimonials.rating,
          body: testimonials.body,
          nightsToResult: testimonials.nightsToResult,
          featured: testimonials.featured,
          submittedAt: testimonials.submittedAt,
        })
        .from(testimonials)
        .where(
          and(
            eq(testimonials.status, "approved"),
            eq(testimonials.consentToPublish, 1)
          )
        )
        .orderBy(
          input.featuredFirst
            ? sql`${testimonials.featured} DESC, ${testimonials.submittedAt} DESC`
            : desc(testimonials.submittedAt)
        )
        .limit(input.limit);

      return rows;
    }),

  /**
   * Get testimonial stats for landing page (public).
   */
  getStats: publicProcedure.query(async () => {
    const db = await requireDb();

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        avgRating: sql<number>`ROUND(AVG(${testimonials.rating}), 1)`,
        fiveStars: sql<number>`SUM(CASE WHEN ${testimonials.rating} = 5 THEN 1 ELSE 0 END)`,
      })
      .from(testimonials)
      .where(
        and(
          eq(testimonials.status, "approved"),
          eq(testimonials.consentToPublish, 1)
        )
      );

    return {
      total: Number(stats?.total ?? 0),
      avgRating: Number(stats?.avgRating ?? 0),
      fiveStarPercent:
        stats?.total > 0
          ? Math.round((Number(stats.fiveStars) / Number(stats.total)) * 100)
          : 0,
    };
  }),

  // ─── Admin procedures ───────────────────────────────────────────────────────

  /**
   * List all testimonials for admin moderation.
   */
  adminList: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "all"]).default("pending"),
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await requireDb();

      const whereClause =
        input.status === "all"
          ? undefined
          : eq(testimonials.status, input.status);

      const rows = await db
        .select()
        .from(testimonials)
        .where(whereClause)
        .orderBy(desc(testimonials.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ count }] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(testimonials)
        .where(whereClause);

      return { rows, total: Number(count) };
    }),

  /**
   * Approve a testimonial.
   */
  approve: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        featured: z.boolean().default(false),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();

      await db
        .update(testimonials)
        .set({
          status: "approved",
          featured: input.featured ? 1 : 0,
          adminNote: input.adminNote ?? null,
        })
        .where(eq(testimonials.id, input.id));

      return { success: true };
    }),

  /**
   * Reject a testimonial.
   */
  reject: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        adminNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();

      await db
        .update(testimonials)
        .set({
          status: "rejected",
          adminNote: input.adminNote ?? null,
        })
        .where(eq(testimonials.id, input.id));

      return { success: true };
    }),

  /**
   * Toggle featured status of an approved testimonial.
   */
  toggleFeatured: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const [existing] = await db
        .select({ featured: testimonials.featured })
        .from(testimonials)
        .where(eq(testimonials.id, input.id))
        .limit(1);

      if (!existing) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(testimonials)
        .set({ featured: existing.featured ? 0 : 1 })
        .where(eq(testimonials.id, input.id));

      return { featured: !existing.featured };
    }),

  /**
   * Get admin stats overview.
   */
  adminStats: protectedProcedure.query(async () => {
    const db = await requireDb();

    const [stats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        pending: sql<number>`SUM(CASE WHEN ${testimonials.status} = 'pending' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN ${testimonials.status} = 'approved' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN ${testimonials.status} = 'rejected' THEN 1 ELSE 0 END)`,
        avgRating: sql<number>`ROUND(AVG(CASE WHEN ${testimonials.submittedAt} IS NOT NULL THEN ${testimonials.rating} END), 1)`,
        submitted: sql<number>`SUM(CASE WHEN ${testimonials.submittedAt} IS NOT NULL THEN 1 ELSE 0 END)`,
      })
      .from(testimonials);

    return {
      total: Number(stats?.total ?? 0),
      pending: Number(stats?.pending ?? 0),
      approved: Number(stats?.approved ?? 0),
      rejected: Number(stats?.rejected ?? 0),
      avgRating: Number(stats?.avgRating ?? 0),
      submitted: Number(stats?.submitted ?? 0),
      responseRate:
        stats?.total > 0
          ? Math.round((Number(stats.submitted) / Number(stats.total)) * 100)
          : 0,
    };
  }),
});
