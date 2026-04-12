import {
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
  status: mysqlEnum("status", ["pending", "paid", "failed", "refunded"]).default("pending").notNull(),
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
