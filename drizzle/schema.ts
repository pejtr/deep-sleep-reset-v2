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

/**
 * Instagram scheduled posts — AI-generated content queue.
 * Each row is one post or story to be published at a scheduled time.
 */
export const igScheduledPosts = mysqlTable("ig_scheduled_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** post or story */
  type: mysqlEnum("type", ["post", "story"]).notNull(),
  /** Topic/theme for this post */
  topic: varchar("topic", { length: 255 }).notNull(),
  /** AI-generated caption */
  caption: text("caption"),
  /** Image prompt used to generate the visual */
  imagePrompt: text("imagePrompt"),
  /** CDN URL of the generated image */
  imageUrl: text("imageUrl"),
  /** Scheduled publish time (UTC) */
  scheduledAt: timestamp("scheduledAt").notNull(),
  /** Status of the post */
  status: mysqlEnum("status", ["pending", "published", "failed", "cancelled"]).default("pending").notNull(),
  /** Instagram post ID after publishing */
  igPostId: varchar("igPostId", { length: 128 }),
  /** Instagram permalink after publishing */
  igPermalink: text("igPermalink"),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** AI learning score — how well this content performed (0-100) */
  performanceScore: int("performanceScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgScheduledPost = typeof igScheduledPosts.$inferSelect;
export type InsertIgScheduledPost = typeof igScheduledPosts.$inferInsert;

/**
 * Instagram post analytics — performance data fetched from Instagram API.
 * Used by the AI to learn which content performs best.
 */
export const igPostAnalytics = mysqlTable("ig_post_analytics", {
  id: int("id").autoincrement().primaryKey(),
  scheduledPostId: int("scheduledPostId").notNull(),
  igPostId: varchar("igPostId", { length: 128 }).notNull(),
  likes: int("likes").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  reach: int("reach").default(0).notNull(),
  impressions: int("impressions").default(0).notNull(),
  saves: int("saves").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  profileVisits: int("profileVisits").default(0).notNull(),
  websiteClicks: int("websiteClicks").default(0).notNull(),
  /** Engagement rate = (likes+comments+saves) / reach * 100 */
  engagementRate: int("engagementRate").default(0).notNull(),
  /** Topic that was used for this post */
  topic: varchar("topic", { length: 255 }),
  /** Post type */
  postType: mysqlEnum("postType", ["post", "story"]).notNull(),
  fetchedAt: timestamp("fetchedAt").defaultNow().notNull(),
});

export type IgPostAnalytics = typeof igPostAnalytics.$inferSelect;
export type InsertIgPostAnalytics = typeof igPostAnalytics.$inferInsert;

/**
 * Instagram AI settings — configurable parameters for the autopilot.
 */
export const igAutopilotSettings = mysqlTable("ig_autopilot_settings", {
  id: int("id").autoincrement().primaryKey(),
  /** Whether autopilot is enabled */
  enabled: int("enabled").default(1).notNull(),
  /** Daily post time in HH:MM UTC format */
  postTimeUtc: varchar("postTimeUtc", { length: 5 }).default("09:00").notNull(),
  /** Daily story time in HH:MM UTC format */
  storyTimeUtc: varchar("storyTimeUtc", { length: 5 }).default("17:00").notNull(),
  /** Content tone: educational, emotional, promotional */
  contentTone: mysqlEnum("contentTone", ["educational", "emotional", "promotional", "mixed"]).default("mixed").notNull(),
  /** Topics to rotate through (JSON array) */
  topicRotation: text("topicRotation"),
  /** Whether to auto-publish or just generate drafts */
  autoPublish: int("autoPublish").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgAutopilotSettings = typeof igAutopilotSettings.$inferSelect;
export type InsertIgAutopilotSettings = typeof igAutopilotSettings.$inferInsert;
