import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productKey: varchar("productKey", { length: 64 }).notNull(),
  purchaseType: mysqlEnum("purchaseType", ["one_time", "subscription"]).notNull().default("subscription"),
  status: mysqlEnum("status", ["pending", "paid", "active", "canceled", "refunded"]).notNull().default("pending"),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 128 }).unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }).unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const programProgress = mysqlTable("programProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  status: mysqlEnum("status", ["locked", "active", "completed"]).notNull().default("locked"),
  currentDay: int("currentDay").notNull().default(1),
  completedDays: int("completedDays").notNull().default(0),
  streakDays: int("streakDays").notNull().default(0),
  lastCheckInAt: timestamp("lastCheckInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentItems = mysqlTable("contentItems", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: varchar("title", { length: 160 }).notNull(),
  summary: text("summary").notNull(),
  body: text("body").notNull(),
  contentType: mysqlEnum("contentType", ["tip", "audio", "video", "checkin"]).notNull(),
  mediaUrl: varchar("mediaUrl", { length: 1024 }),
  dayNumber: int("dayNumber").notNull().default(1),
  isPremium: int("isPremium").notNull().default(1),
  isPublished: int("isPublished").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentHistory = mysqlTable("contentHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  contentItemId: int("contentItemId").notNull(),
  progressPercent: int("progressPercent").notNull().default(0),
  completed: int("completed").notNull().default(0),
  lastViewedAt: timestamp("lastViewedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const emailJobs = mysqlTable("emailJobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }).notNull(),
  eventType: mysqlEnum("eventType", ["signup", "purchase", "funnel", "checkin"]).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "sent", "failed"]).notNull().default("pending"),
  retryCount: int("retryCount").notNull().default(0),
  nextAttemptAt: timestamp("nextAttemptAt").defaultNow().notNull(),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const funnelEvents = mysqlTable("funnelEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }),
  eventType: mysqlEnum("eventType", [
    "landing_view",
    "checkout_started",
    "checkout_completed",
    "signup",
    "login",
    "content_view",
    "checkin",
  ]).notNull(),
  detail: text("detail"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const qaChecklistItems = mysqlTable("qaChecklistItems", {
  id: int("id").autoincrement().primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "pass", "fail"]).notNull().default("pending"),
  notes: text("notes"),
  updatedByUserId: int("updatedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;
export type ProgramProgress = typeof programProgress.$inferSelect;
export type InsertProgramProgress = typeof programProgress.$inferInsert;
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;
export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;
export type EmailJob = typeof emailJobs.$inferSelect;
export type InsertEmailJob = typeof emailJobs.$inferInsert;
export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type InsertFunnelEvent = typeof funnelEvents.$inferInsert;
export type QaChecklistItem = typeof qaChecklistItems.$inferSelect;
export type InsertQaChecklistItem = typeof qaChecklistItems.$inferInsert;
