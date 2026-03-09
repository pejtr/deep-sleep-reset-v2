import { bigint, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Orders table — tracks completed Stripe payments.
 * Minimal: only Stripe IDs + product key. Query Stripe API for details.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Stripe Checkout Session ID */
  stripeSessionId: varchar("stripeSessionId", { length: 255 }).notNull().unique(),
  /** Stripe Payment Intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  /** Customer email (for guest checkouts without login) */
  customerEmail: varchar("customerEmail", { length: 320 }),
  /** Product key: frontEnd, exitDiscount, upsell1, upsell2 */
  productKey: varchar("productKey", { length: 64 }).notNull(),
  /** Amount in cents */
  amountCents: int("amountCents").notNull(),
  /** Currency code */
  currency: varchar("currency", { length: 10 }).default("usd").notNull(),
  /** Payment status */
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Leads table — email addresses captured via chatbot or opt-in forms.
 * Used for follow-up email sequences and retargeting.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Source of the lead: chatbot, exit_popup, order_bump, etc. */
  source: varchar("source", { length: 64 }).default("chatbot").notNull(),
  /** A/B test variant they were shown */
  abVariant: varchar("abVariant", { length: 32 }),
  /** Whether they converted (purchased) */
  converted: int("converted").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Chat insights — AI-extracted key information from chatbot conversations.
 * Tracks sleep issues, objections, intent signals for personalization.
 */
export const chatInsights = mysqlTable("chat_insights", {
  id: int("id").autoincrement().primaryKey(),
  /** Lead email or session ID */
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  /** Extracted sleep issue category */
  sleepIssue: varchar("sleepIssue", { length: 128 }),
  /** User's main objection to buying */
  objection: varchar("objection", { length: 255 }),
  /** Purchase intent level: low, medium, high */
  intentLevel: mysqlEnum("intentLevel", ["low", "medium", "high"]).default("low").notNull(),
  /** Raw extracted keywords/tags */
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatInsight = typeof chatInsights.$inferSelect;
export type InsertChatInsight = typeof chatInsights.$inferInsert;

/**
 * Chat surveys — satisfaction feedback at end of chatbot conversation.
 */
export const chatSurveys = mysqlTable("chat_surveys", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  email: varchar("email", { length: 320 }),
  /** 1-5 star rating */
  rating: int("rating").notNull(),
  /** Optional comment */
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatSurvey = typeof chatSurveys.$inferSelect;
export type InsertChatSurvey = typeof chatSurveys.$inferInsert;
