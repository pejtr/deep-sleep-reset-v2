import { and, asc, count, desc, eq, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  contentHistory,
  contentItems,
  emailJobs,
  funnelEvents,
  InsertPurchase,
  InsertUser,
  programProgress,
  purchases,
  qaChecklistItems,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

    const textFields = ["name", "email", "loginMethod", "stripeCustomerId"] as const;
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
      values.role = "admin";
      updateSet.role = "admin";
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

export async function syncAuthenticatedUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
}) {
  const existing = await getUserByOpenId(user.openId);

  await upsertUser({
    openId: user.openId,
    name: user.name ?? null,
    email: user.email ?? null,
    loginMethod: user.loginMethod ?? "manus",
    lastSignedIn: new Date(),
  });

  const refreshed = await getUserByOpenId(user.openId);

  if (!existing && refreshed) {
    await recordFunnelEvent({
      userId: refreshed.id,
      email: refreshed.email,
      eventType: "signup",
      detail: "Manus OAuth signup completed",
    });

    if (refreshed.email) {
      await createEmailJob({
        userId: refreshed.id,
        email: refreshed.email,
        eventType: "signup",
        subject: "Welcome to DeepSleepReset",
        body: "Your DeepSleepReset account is now active. Continue to checkout to unlock Premium access.",
      });
    }
  }

  return refreshed ?? existing ?? null;
}

export async function ensureProgramProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(programProgress).where(eq(programProgress.userId, userId)).limit(1);
  if (existing[0]) return existing[0];

  await db.insert(programProgress).values({ userId, status: "locked" });
  const created = await db.select().from(programProgress).where(eq(programProgress.userId, userId)).limit(1);
  return created[0] ?? null;
}

export async function recordFunnelEvent(input: {
  userId?: number | null;
  email?: string | null;
  eventType:
    | "landing_view"
    | "checkout_started"
    | "checkout_completed"
    | "signup"
    | "login"
    | "content_view"
    | "checkin";
  detail?: string | null;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(funnelEvents).values({
    userId: input.userId ?? null,
    email: input.email ?? null,
    eventType: input.eventType,
    detail: input.detail ?? null,
  });
}

export async function createEmailJob(input: {
  userId?: number | null;
  email: string;
  eventType: "signup" | "purchase" | "funnel" | "checkin";
  subject: string;
  body: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(emailJobs).values({
    userId: input.userId ?? null,
    email: input.email,
    eventType: input.eventType,
    subject: input.subject,
    body: input.body,
    status: "pending",
  });
}

export async function listDueEmailJobs(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(emailJobs)
    .where(
      and(
        or(eq(emailJobs.status, "pending"), eq(emailJobs.status, "failed")),
        lte(emailJobs.nextAttemptAt, new Date()),
      ),
    )
    .orderBy(asc(emailJobs.nextAttemptAt))
    .limit(limit);
}

export async function markEmailJobStatus(input: {
  id: number;
  status: "processing" | "sent" | "failed";
  retryCount?: number;
  nextAttemptAt?: Date;
  lastError?: string | null;
}) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(emailJobs)
    .set({
      status: input.status,
      retryCount: input.retryCount,
      nextAttemptAt: input.nextAttemptAt,
      lastError: input.lastError ?? null,
      updatedAt: new Date(),
    })
    .where(eq(emailJobs.id, input.id));
}

export async function upsertPurchaseFromStripe(input: {
  userId: number;
  productKey: string;
  purchaseType: "one_time" | "subscription";
  status: "pending" | "paid" | "active" | "canceled" | "refunded";
  stripeCheckoutSessionId?: string | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripePaymentIntentId?: string | null;
}) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [
    input.stripeCheckoutSessionId ? eq(purchases.stripeCheckoutSessionId, input.stripeCheckoutSessionId) : undefined,
    input.stripeSubscriptionId ? eq(purchases.stripeSubscriptionId, input.stripeSubscriptionId) : undefined,
    input.stripePaymentIntentId ? eq(purchases.stripePaymentIntentId, input.stripePaymentIntentId) : undefined,
  ].filter(Boolean);

  const existing = conditions.length
    ? await db.select().from(purchases).where(or(...conditions)).limit(1)
    : [];

  const values: InsertPurchase = {
    userId: input.userId,
    productKey: input.productKey,
    purchaseType: input.purchaseType,
    status: input.status,
    stripeCheckoutSessionId: input.stripeCheckoutSessionId ?? null,
    stripeCustomerId: input.stripeCustomerId ?? null,
    stripeSubscriptionId: input.stripeSubscriptionId ?? null,
    stripePaymentIntentId: input.stripePaymentIntentId ?? null,
  };

  if (existing[0]) {
    await db.update(purchases).set({ ...values, updatedAt: new Date() }).where(eq(purchases.id, existing[0].id));
    await unlockPremiumForUser(input.userId);
    return existing[0].id;
  }

  const result = await db.insert(purchases).values(values);
  await unlockPremiumForUser(input.userId);
  return Number(result[0].insertId);
}

export async function unlockPremiumForUser(userId: number) {
  const db = await getDb();
  if (!db) return;

  await ensureProgramProgress(userId);
  await db
    .update(programProgress)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(programProgress.userId, userId));
}

export async function userHasPremiumAccess(userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ id: purchases.id })
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        or(eq(purchases.status, "paid"), eq(purchases.status, "active")),
      ),
    )
    .limit(1);

  return result.length > 0;
}

export async function getMemberDashboard(userId: number) {
  const db = await getDb();
  if (!db) return null;

  await seedContentItemsIfEmpty();
  await ensureProgramProgress(userId);

  const progress = await db.select().from(programProgress).where(eq(programProgress.userId, userId)).limit(1);
  const feed = await db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      summary: contentItems.summary,
      contentType: contentItems.contentType,
      dayNumber: contentItems.dayNumber,
      mediaUrl: contentItems.mediaUrl,
      isPublished: contentItems.isPublished,
    })
    .from(contentItems)
    .where(and(eq(contentItems.isPremium, 1), eq(contentItems.isPublished, 1)))
    .orderBy(asc(contentItems.dayNumber), desc(contentItems.createdAt))
    .limit(10);

  return {
    progress: progress[0] ?? null,
    feed,
  };
}

export async function getContentFeed(userId: number) {
  const db = await getDb();
  if (!db) return [];

  await seedContentItemsIfEmpty();

  return db
    .select({
      id: contentItems.id,
      slug: contentItems.slug,
      title: contentItems.title,
      summary: contentItems.summary,
      body: contentItems.body,
      contentType: contentItems.contentType,
      mediaUrl: contentItems.mediaUrl,
      dayNumber: contentItems.dayNumber,
      progressPercent: contentHistory.progressPercent,
      completed: contentHistory.completed,
      lastViewedAt: contentHistory.lastViewedAt,
    })
    .from(contentItems)
    .leftJoin(
      contentHistory,
      and(eq(contentHistory.contentItemId, contentItems.id), eq(contentHistory.userId, userId)),
    )
    .where(and(eq(contentItems.isPremium, 1), eq(contentItems.isPublished, 1)))
    .orderBy(asc(contentItems.dayNumber), desc(contentItems.createdAt));
}

export async function saveDailyCheckIn(userId: number) {
  const db = await getDb();
  if (!db) return null;

  await ensureProgramProgress(userId);
  const [current] = await db.select().from(programProgress).where(eq(programProgress.userId, userId)).limit(1);
  if (!current) return null;

  const completedDays = current.completedDays + 1;
  const currentDay = Math.max(current.currentDay, completedDays + 1);
  const streakDays = current.streakDays + 1;

  await db
    .update(programProgress)
    .set({
      completedDays,
      currentDay,
      streakDays,
      lastCheckInAt: new Date(),
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(programProgress.userId, userId));

  await recordFunnelEvent({ userId, eventType: "checkin", detail: "Daily check-in completed" });

  const [updated] = await db.select().from(programProgress).where(eq(programProgress.userId, userId)).limit(1);
  return updated ?? null;
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
}

export async function listAdminContentItems() {
  const db = await getDb();
  if (!db) return [];

  await seedContentItemsIfEmpty();
  return db.select().from(contentItems).orderBy(asc(contentItems.dayNumber), desc(contentItems.createdAt));
}

export async function upsertContentItem(input: {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  contentType: "tip" | "audio" | "video" | "checkin";
  dayNumber: number;
  mediaUrl?: string | null;
  isPremium: number;
  isPublished: number;
}) {
  const db = await getDb();
  if (!db) return;

  if (input.id) {
    await db
      .update(contentItems)
      .set({
        slug: input.slug,
        title: input.title,
        summary: input.summary,
        body: input.body,
        contentType: input.contentType,
        dayNumber: input.dayNumber,
        mediaUrl: input.mediaUrl ?? null,
        isPremium: input.isPremium,
        isPublished: input.isPublished,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, input.id));
    return;
  }

  await db.insert(contentItems).values({
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    body: input.body,
    contentType: input.contentType,
    dayNumber: input.dayNumber,
    mediaUrl: input.mediaUrl ?? null,
    isPremium: input.isPremium,
    isPublished: input.isPublished,
  });
}

export async function getAdminOverview() {
  const db = await getDb();
  if (!db) {
    return {
      totals: { subscribers: 0, activeMembers: 0, funnelEvents: 0 },
      recentPurchases: [],
      recentEvents: [],
    };
  }

  const [subscriberCount] = await db.select({ value: count() }).from(users);
  const [activeMembersCount] = await db
    .select({ value: count() })
    .from(purchases)
    .where(or(eq(purchases.status, "paid"), eq(purchases.status, "active")));
  const [eventCount] = await db.select({ value: count() }).from(funnelEvents);

  const recentPurchases = await db.select().from(purchases).orderBy(desc(purchases.createdAt)).limit(8);
  const recentEvents = await db.select().from(funnelEvents).orderBy(desc(funnelEvents.createdAt)).limit(10);

  return {
    totals: {
      subscribers: subscriberCount?.value ?? 0,
      activeMembers: activeMembersCount?.value ?? 0,
      funnelEvents: eventCount?.value ?? 0,
    },
    recentPurchases,
    recentEvents,
  };
}

export async function seedContentItemsIfEmpty() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select({ value: count() }).from(contentItems);
  if ((existing[0]?.value ?? 0) > 0) return;

  await db.insert(contentItems).values([
    {
      slug: "evening-reset-ritual",
      title: "Evening Reset Ritual",
      summary: "A calming wind-down sequence to lower mental noise before sleep.",
      body: "Start by dimming bright light, then spend ten quiet minutes unloading the day on paper. Finish with slow breathing and a deliberate transition away from decision-making.",
      contentType: "video",
      dayNumber: 1,
      isPremium: 1,
      isPublished: 1,
    },
    {
      slug: "midday-cortisol-check",
      title: "Midday Cortisol Check",
      summary: "A short audio-guided reset for restoring calm earlier in the day.",
      body: "Use this check-in when your nervous system feels overstimulated. The goal is not perfection, only a softer landing into the evening.",
      contentType: "audio",
      dayNumber: 2,
      mediaUrl: "/",
      isPremium: 1,
      isPublished: 1,
    },
    {
      slug: "nightly-reflection",
      title: "Nightly Reflection Prompt",
      summary: "A gentle journaling prompt to help Petra conversations go deeper.",
      body: "What felt loud today, what felt nourishing, and what can wait until tomorrow? Keep your answers brief and honest.",
      contentType: "checkin",
      dayNumber: 3,
      isPremium: 1,
      isPublished: 1,
    },
  ]);
}

export async function listQaChecklist() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(qaChecklistItems).orderBy(asc(qaChecklistItems.id));
}

export async function seedQaChecklistIfEmpty() {
  const db = await getDb();
  if (!db) return;

  const existing = await db.select({ value: count() }).from(qaChecklistItems);
  if ((existing[0]?.value ?? 0) > 0) return;

  await db.insert(qaChecklistItems).values([
    {
      label: "Public funnel visual review",
      description: "Verify hero, benefits, testimonials, and CTA quality across desktop and mobile.",
    },
    {
      label: "Checkout and purchase gating",
      description: "Confirm paid users reach premium content and non-paying users remain blocked.",
    },
    {
      label: "Petra premium-only validation",
      description: "Ensure Petra is visible only to premium members and responds with Gentle Support tone.",
    },
    {
      label: "Email automation resilience",
      description: "Review queued email behavior and retry handling for transient ECONNRESET failures.",
    },
  ]);
}

export async function updateQaChecklistItem(input: {
  id: number;
  status: "pending" | "pass" | "fail";
  notes?: string | null;
  updatedByUserId?: number | null;
}) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(qaChecklistItems)
    .set({
      status: input.status,
      notes: input.notes ?? null,
      updatedByUserId: input.updatedByUserId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(qaChecklistItems.id, input.id));
}
