import { eq } from "drizzle-orm";
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
