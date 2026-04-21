import {
  boolean,
  decimal,
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Quiz results
export const quizResults = mysqlTable("quiz_results", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }),
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]).notNull(),
  answers: text("answers"), // JSON string
  email: varchar("email", { length: 320 }),
  source: varchar("source", { length: 50 }).default("organic"), // fb, ig, direct
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type QuizResult = typeof quizResults.$inferSelect;

// Email leads
export const emailLeads = mysqlTable("email_leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]),
  source: varchar("source", { length: 50 }).default("quiz_result"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailLead = typeof emailLeads.$inferSelect;

// Orders
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  stripeSessionId: varchar("stripeSessionId", { length: 256 }),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  product: mysqlEnum("product", ["tripwire", "oto1", "oto2", "oto3"]).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("usd"),
  status: mysqlEnum("status", ["pending", "pending_gumroad", "paid", "failed", "refunded"]).default("pending").notNull(),
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]),
  email: varchar("email", { length: 320 }),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Order = typeof orders.$inferSelect;

// Scheduled emails for autonomous 7-day sequence
export const scheduledEmails = mysqlTable("scheduled_emails", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  name: text("name"),
  chronotype: varchar("chronotype", { length: 20 }).notNull(),
  day: int("day").notNull(), // 1, 2, 3, 5, 7
  sendAt: timestamp("sendAt").notNull(),
  sentAt: timestamp("sentAt"),
  status: mysqlEnum("status", ["pending", "processing", "sent", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ScheduledEmail = typeof scheduledEmails.$inferSelect;

// A/B test tracking
export const abTestEvents = mysqlTable("ab_test_events", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 100 }).notNull(),
  variant: varchar("variant", { length: 10 }).notNull(),
  eventType: mysqlEnum("eventType", ["impression", "click", "conversion"]).notNull(),
  sessionId: varchar("sessionId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AbTestEvent = typeof abTestEvents.$inferSelect;

// A/B test weights — stores winner allocations (70/30 split)
export const abTestWeights = mysqlTable("ab_test_weights", {
  id: int("id").autoincrement().primaryKey(),
  testName: varchar("testName", { length: 100 }).notNull(),
  variant: varchar("variant", { length: 10 }).notNull(),
  weight: int("weight").default(50).notNull(), // 0-100 percentage
  isWinner: mysqlEnum("isWinner", ["yes", "no"]).default("no").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AbTestWeight = typeof abTestWeights.$inferSelect;

// Optimization history — log of all auto-optimization actions
export const optimizationHistoryTable = mysqlTable("optimization_history", {
  id: int("id").autoincrement().primaryKey(),
  action: text("action").notNull(),
  testName: varchar("testName", { length: 100 }),
  winner: varchar("winner", { length: 10 }),
  confidence: int("confidence"),
  impact: varchar("impact", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OptimizationHistoryEntry = typeof optimizationHistoryTable.$inferSelect;

// Premium Subscriptions — Sleep Optimizers Community
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 256 }),
  tier: mysqlEnum("tier", ["basic", "pro", "elite"]).notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  canceledAt: timestamp("canceledAt"),
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]),
  source: varchar("source", { length: 50 }).default("funnel"), // funnel, email, organic
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Member content — monthly exclusive content for subscribers
export const memberContent = mysqlTable("member_content", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  contentType: mysqlEnum("contentType", ["guide", "audio", "video", "report", "bonus"]).notNull(),
  tier: mysqlEnum("tier", ["basic", "pro", "elite"]).notNull(), // minimum tier required
  downloadUrl: text("downloadUrl"),
  month: varchar("month", { length: 7 }).notNull(), // YYYY-MM format
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]), // null = all
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MemberContent = typeof memberContent.$inferSelect;

// Content history — AI-generated content for social media / email
export const contentHistory = mysqlTable("content_history", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", ["reel_script", "email", "instagram", "facebook", "tiktok", "blog", "ad_copy"]).notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  chronotype: mysqlEnum("chronotype", ["lion", "bear", "wolf", "dolphin"]),
  generatedBy: mysqlEnum("generatedBy", ["manual", "cron"]).default("manual").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ContentHistory = typeof contentHistory.$inferSelect;
export type InsertContentHistory = typeof contentHistory.$inferInsert;

// API Keys — for external marketing system access (Zapier, Make.com, n8n)
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  keyHash: varchar("key_hash", { length: 64 }).notNull().unique(), // SHA-256 hash
  name: varchar("name", { length: 128 }).notNull(), // e.g. "Zapier Integration"
  permissions: mysqlEnum("permissions", ["read", "write", "admin"]).default("read").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

