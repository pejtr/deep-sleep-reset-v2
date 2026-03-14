import { eq, gte, sql, desc, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { abEvents, chatInsights, chatSurveys, InsertAbEvent, InsertChatInsight, InsertChatSurvey, InsertLead, InsertUser, InsertQuizAttempt, InsertTestimonialMedia, leads, orders, quizAttempts, testimonialMedia, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

/**
 * Save AI-extracted chat insights for a session.
 * Upserts by sessionId so we keep the latest extraction.
 */
export async function saveChatInsight(data: InsertChatInsight): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save chat insight: database not available");
    return;
  }
  try {
    await db.insert(chatInsights).values(data).onDuplicateKeyUpdate({
      set: {
        sleepIssue: data.sleepIssue,
        objection: data.objection,
        intentLevel: data.intentLevel,
        tags: data.tags,
        email: data.email,
      },
    });
  } catch (error) {
    console.error("[Database] Failed to save chat insight:", error);
  }
}

/**
 * Save a chatbot satisfaction survey response.
 */
export async function saveChatSurvey(data: InsertChatSurvey): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save chat survey: database not available");
    return;
  }
  try {
    await db.insert(chatSurveys).values(data);
  } catch (error) {
    console.error("[Database] Failed to save chat survey:", error);
  }
}

/**
 * Check if an email has a completed order (returning customer detection).
 */
export async function getOrdersByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(orders)
      .where(eq(orders.customerEmail, email))
      .limit(5);
  } catch {
    return [];
  }
}

/**
 * Save a lead email captured via chatbot or opt-in form.
 * Silently ignores duplicate emails (unique constraint).
 */
export async function saveLead(data: InsertLead): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save lead: database not available");
    return;
  }
  try {
    await db.insert(leads).values(data).onDuplicateKeyUpdate({
      set: { source: data.source }, // update source if email already exists
    });
  } catch (error) {
    console.error("[Database] Failed to save lead:", error);
    // Don't throw — lead capture should never break the chatbot
  }
}

// ============================================================
// Admin Analytics Queries
// ============================================================

/**
 * Get high-level KPI stats for the admin dashboard.
 */
export async function getAdminStats() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7days = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const last30days = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);

  const [totalRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount_cents), 0)` })
    .from(orders)
    .where(eq(orders.status, "completed"));

  const [totalOrders] = await db
    .select({ cnt: count() })
    .from(orders)
    .where(eq(orders.status, "completed"));

  const [todayRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount_cents), 0)` })
    .from(orders)
    .where(sql`status = 'completed' AND created_at >= ${today}`);

  const [last7Revenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount_cents), 0)` })
    .from(orders)
    .where(sql`status = 'completed' AND created_at >= ${last7days}`);

  const [last30Revenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(amount_cents), 0)` })
    .from(orders)
    .where(sql`status = 'completed' AND created_at >= ${last30days}`);

  const [totalLeads] = await db
    .select({ cnt: count() })
    .from(leads);

  const [convertedLeads] = await db
    .select({ cnt: count() })
    .from(leads)
    .where(eq(leads.converted, 1));

  const [avgRating] = await db
    .select({ avg: sql<number>`COALESCE(AVG(rating), 0)` })
    .from(chatSurveys);

  const [totalSurveys] = await db
    .select({ cnt: count() })
    .from(chatSurveys);

  return {
    totalRevenueCents: Number(totalRevenue?.total ?? 0),
    totalOrders: Number(totalOrders?.cnt ?? 0),
    todayRevenueCents: Number(todayRevenue?.total ?? 0),
    last7RevenueCents: Number(last7Revenue?.total ?? 0),
    last30RevenueCents: Number(last30Revenue?.total ?? 0),
    totalLeads: Number(totalLeads?.cnt ?? 0),
    convertedLeads: Number(convertedLeads?.cnt ?? 0),
    avgChatRating: Number(avgRating?.avg ?? 0),
    totalSurveys: Number(totalSurveys?.cnt ?? 0),
  };
}

/**
 * Get funnel conversion stats by product key.
 */
export async function getFunnelStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      productKey: orders.productKey,
      cnt: count(),
      totalCents: sql<number>`COALESCE(SUM(amount_cents), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "completed"))
    .groupBy(orders.productKey);

  return result.map(r => ({
    productKey: r.productKey,
    count: Number(r.cnt),
    totalCents: Number(r.totalCents),
  }));
}

/**
 * Get recent orders for the admin orders table.
 */
export async function getRecentOrders(limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

/**
 * Get recent leads.
 */
export async function getRecentLeads(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

/**
 * Get recent chat insights.
 */
export async function getRecentChatInsights(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatInsights)
    .orderBy(desc(chatInsights.createdAt))
    .limit(limit);
}

/**
 * Get recent chat surveys.
 */
export async function getRecentChatSurveys(limit = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(chatSurveys)
    .orderBy(desc(chatSurveys.createdAt))
    .limit(limit);
}

/**
 * Get lead source breakdown for conversion analytics.
 */
export async function getLeadSourceStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      source: leads.source,
      total: count(),
      converted: sql<number>`COALESCE(SUM(converted), 0)`,
    })
    .from(leads)
    .groupBy(leads.source);

  return result.map(r => ({
    source: r.source,
    total: Number(r.total),
    converted: Number(r.converted),
    convRate: r.total > 0 ? ((Number(r.converted) / Number(r.total)) * 100).toFixed(1) : "0.0",
  }));
}

/**
 * Save an A/B test event (impression or conversion).
 */
export async function saveAbEvent(event: InsertAbEvent): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(abEvents).values(event);
  } catch (err) {
    console.error("[AB] Failed to save event:", err);
  }
}

/**
 * Get A/B test stats: impressions, conversions, CVR per variant.
 */
export async function getAbStats() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      variant: abEvents.variant,
      eventType: abEvents.eventType,
      cnt: count(),
    })
    .from(abEvents)
    .groupBy(abEvents.variant, abEvents.eventType);

  // Pivot into per-variant rows
  const map: Record<string, { impressions: number; conversions: number }> = {};
  for (const row of result) {
    if (!map[row.variant]) map[row.variant] = { impressions: 0, conversions: 0 };
    if (row.eventType === "impression") map[row.variant].impressions = Number(row.cnt);
    if (row.eventType === "conversion") map[row.variant].conversions = Number(row.cnt);
  }

  return Object.entries(map).map(([variant, data]) => ({
    variant,
    impressions: data.impressions,
    conversions: data.conversions,
    cvr: data.impressions > 0
      ? ((data.conversions / data.impressions) * 100).toFixed(1)
      : "0.0",
  }));
}

/**
 * Save a quiz attempt (score + label) for a session.
 */
export async function saveQuizAttempt(data: InsertQuizAttempt): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(quizAttempts).values(data);
  } catch (err) {
    console.error("[Quiz] Failed to save attempt:", err);
  }
}

/**
 * Get quiz attempt history for a session (last 10 attempts, oldest first).
 */
export async function getQuizHistory(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const rows = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.sessionId, sessionId))
      .orderBy(desc(quizAttempts.createdAt))
      .limit(10);
    // Return in chronological order for the chart
    return rows.reverse().map(r => ({
      id: r.id,
      score: r.score,
      label: r.label,
      createdAt: r.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Submit a user testimonial with optional media.
 */
export async function submitTestimonialMedia(data: InsertTestimonialMedia): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.insert(testimonialMedia).values(data);
    return (result as unknown as { insertId: number }).insertId ?? 0;
  } catch (err) {
    console.error("[Testimonial] Failed to submit:", err);
    return 0;
  }
}

/**
 * Get approved testimonials with media for the Social Proof Wall.
 */
export async function getApprovedTestimonialMedia(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(testimonialMedia)
      .where(eq(testimonialMedia.status, "approved"))
      .orderBy(desc(testimonialMedia.createdAt))
      .limit(limit);
  } catch {
    return [];
  }
}

/**
 * Get pending testimonials for admin moderation.
 */
export async function getPendingTestimonialMedia() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db
      .select()
      .from(testimonialMedia)
      .where(eq(testimonialMedia.status, "pending"))
      .orderBy(desc(testimonialMedia.createdAt));
  } catch {
    return [];
  }
}

/**
 * Approve or reject a testimonial media submission.
 */
export async function moderateTestimonialMedia(id: number, status: "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    await db.update(testimonialMedia).set({ status }).where(eq(testimonialMedia.id, id));
  } catch (err) {
    console.error("[Testimonial] Failed to moderate:", err);
  }
}

/**
 * Get daily revenue for chart (last 30 days).
 */
export async function getDailyRevenue() {
  const db = await getDb();
  if (!db) return [];

  const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await db
    .select({
      date: sql<string>`DATE(created_at)`,
      totalCents: sql<number>`COALESCE(SUM(amount_cents), 0)`,
      orderCount: count(),
    })
    .from(orders)
    .where(sql`status = 'completed' AND created_at >= ${last30days}`)
    .groupBy(sql`DATE(created_at)`)
    .orderBy(sql`DATE(created_at)`);

  return result.map(r => ({
    date: String(r.date),
    totalCents: Number(r.totalCents),
    orderCount: Number(r.orderCount),
  }));
}
