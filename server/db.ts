import { eq, gte, sql, desc, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { chatInsights, chatSurveys, InsertChatInsight, InsertChatSurvey, InsertLead, InsertUser, leads, orders, users } from "../drizzle/schema";
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
