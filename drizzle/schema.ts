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

/**
 * Instagram A/B caption tests — two caption variants for the same post.
 * After 48h, the winner (higher engagement) is identified and used for future content.
 */
export const igAbTests = mysqlTable("ig_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  /** The original scheduled post ID (variant A) */
  postAId: int("postAId").notNull(),
  /** The variant B scheduled post ID */
  postBId: int("postBId").notNull(),
  /** Topic shared by both variants */
  topic: varchar("topic", { length: 255 }).notNull(),
  /** Status: running, completed, cancelled */
  status: mysqlEnum("status", ["running", "completed", "cancelled"]).default("running").notNull(),
  /** Winner: a, b, or null if tie/not yet determined */
  winner: mysqlEnum("winner", ["a", "b", "tie"]),
  /** Engagement rate of variant A */
  engagementA: int("engagementA"),
  /** Engagement rate of variant B */
  engagementB: int("engagementB"),
  /** When to evaluate the test (48h after posting) */
  evaluateAt: timestamp("evaluateAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgAbTest = typeof igAbTests.$inferSelect;
export type InsertIgAbTest = typeof igAbTests.$inferInsert;

/**
 * Instagram hashtag performance — tracks which hashtags drive the most reach.
 * Used by the optimizer to auto-select best hashtags for future posts.
 */
export const igHashtagStats = mysqlTable("ig_hashtag_stats", {
  id: int("id").autoincrement().primaryKey(),
  hashtag: varchar("hashtag", { length: 128 }).notNull().unique(),
  /** Total times used */
  timesUsed: int("timesUsed").default(0).notNull(),
  /** Average reach when this hashtag was included */
  avgReach: int("avgReach").default(0).notNull(),
  /** Average engagement rate when this hashtag was included */
  avgEngagementRate: int("avgEngagementRate").default(0).notNull(),
  /** Total reach accumulated */
  totalReach: bigint("totalReach", { mode: "number" }).default(0).notNull(),
  /** Last time this hashtag was used */
  lastUsedAt: timestamp("lastUsedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgHashtagStats = typeof igHashtagStats.$inferSelect;
export type InsertIgHashtagStats = typeof igHashtagStats.$inferInsert;

/**
 * Instagram repost queue — top-performing posts scheduled for reposting every 30 days.
 */
export const igRepostQueue = mysqlTable("ig_repost_queue", {
  id: int("id").autoincrement().primaryKey(),
  /** Original post ID that performed well */
  originalPostId: int("originalPostId").notNull(),
  /** New scheduled post ID (the repost) */
  repostId: int("repostId"),
  /** Engagement rate that qualified it for repost */
  qualifyingEngagementRate: int("qualifyingEngagementRate").notNull(),
  /** When to repost */
  scheduledAt: timestamp("scheduledAt").notNull(),
  /** Status */
  status: mysqlEnum("status", ["pending", "published", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IgRepostQueue = typeof igRepostQueue.$inferSelect;
export type InsertIgRepostQueue = typeof igRepostQueue.$inferInsert;

/**
 * Instagram DM keyword rules — when a comment contains a keyword, auto-send a DM.
 * Example: keyword "SLEEP" → DM with checkout link.
 */
export const igDmRules = mysqlTable("ig_dm_rules", {
  id: int("id").autoincrement().primaryKey(),
  /** Keyword to match in comments (case-insensitive) */
  keyword: varchar("keyword", { length: 128 }).notNull(),
  /** Whether this rule is active */
  enabled: int("enabled").default(1).notNull(),
  /** DM message template. Supports {name} placeholder. */
  dmTemplate: text("dmTemplate").notNull(),
  /** Optional: only trigger on specific post IDs (JSON array). Null = all posts. */
  postFilter: text("postFilter"),
  /** Match mode: exact (full word match) or contains (substring) */
  matchMode: mysqlEnum("matchMode", ["exact", "contains"]).default("contains").notNull(),
  /** Total times this rule has been triggered */
  triggerCount: int("triggerCount").default(0).notNull(),
  /** Total DMs sent from this rule */
  dmsSent: int("dmsSent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgDmRule = typeof igDmRules.$inferSelect;
export type InsertIgDmRule = typeof igDmRules.$inferInsert;

/**
 * Instagram comment events — log of all comments scanned by the auto-responder.
 * Prevents duplicate DMs by tracking which comments were already processed.
 */
export const igCommentEvents = mysqlTable("ig_comment_events", {
  id: int("id").autoincrement().primaryKey(),
  /** Instagram comment ID (unique per comment) */
  igCommentId: varchar("igCommentId", { length: 128 }).notNull().unique(),
  /** Instagram post ID the comment was on */
  igPostId: varchar("igPostId", { length: 128 }).notNull(),
  /** Instagram user ID who commented */
  igUserId: varchar("igUserId", { length: 128 }).notNull(),
  /** Instagram username who commented */
  igUsername: varchar("igUsername", { length: 128 }),
  /** The comment text */
  commentText: text("commentText").notNull(),
  /** Whether a keyword was matched */
  keywordMatched: varchar("keywordMatched", { length: 128 }),
  /** Rule ID that was triggered (if any) */
  ruleId: int("ruleId"),
  /** Processing status */
  status: mysqlEnum("status", ["scanned", "matched", "dm_sent", "dm_failed", "skipped"]).default("scanned").notNull(),
  /** Error message if DM failed */
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IgCommentEvent = typeof igCommentEvents.$inferSelect;
export type InsertIgCommentEvent = typeof igCommentEvents.$inferInsert;

/**
 * Instagram DM log — record of every DM sent by the auto-responder.
 */
export const igDmLog = mysqlTable("ig_dm_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Rule that triggered this DM */
  ruleId: int("ruleId").notNull(),
  /** Comment event that triggered this DM */
  commentEventId: int("commentEventId").notNull(),
  /** Instagram user ID who received the DM */
  igUserId: varchar("igUserId", { length: 128 }).notNull(),
  /** Instagram username who received the DM */
  igUsername: varchar("igUsername", { length: 128 }),
  /** The actual DM message sent */
  message: text("message").notNull(),
  /** Whether the DM was successfully sent */
  success: int("success").default(0).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type IgDmLog = typeof igDmLog.$inferSelect;
export type InsertIgDmLog = typeof igDmLog.$inferInsert;

/**
 * Instagram webhook config — stores the Meta webhook verification token and app credentials.
 * Used for receiving real-time comment notifications from Meta.
 */
export const igWebhookConfig = mysqlTable("ig_webhook_config", {
  id: int("id").autoincrement().primaryKey(),
  /** Meta App ID */
  metaAppId: varchar("metaAppId", { length: 128 }),
  /** Meta App Secret (encrypted) */
  metaAppSecret: text("metaAppSecret"),
  /** Instagram Page Access Token */
  pageAccessToken: text("pageAccessToken"),
  /** Webhook verify token (user-defined string) */
  verifyToken: varchar("verifyToken", { length: 255 }),
  /** Whether webhook is active and verified */
  webhookActive: int("webhookActive").default(0).notNull(),
  /** Last webhook event received at */
  lastEventAt: timestamp("lastEventAt"),
  /** Total events received */
  totalEventsReceived: int("totalEventsReceived").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type IgWebhookConfig = typeof igWebhookConfig.$inferSelect;
export type InsertIgWebhookConfig = typeof igWebhookConfig.$inferInsert;

/**
 * Email sequence enrollments — tracks which customers are enrolled in the
 * 7-day post-purchase nurture sequence and their current progress.
 */
export const emailSequenceEnrollments = mysqlTable("email_sequence_enrollments", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer name for personalization */
  name: varchar("name", { length: 255 }),
  /** Order ID that triggered enrollment */
  orderId: int("orderId"),
  /** Stripe session ID for reference */
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  /** Which day email to send next (1-6, 0 = all done) */
  nextDayToSend: int("nextDayToSend").default(1).notNull(),
  /** When to send the next email (UTC timestamp) */
  nextSendAt: timestamp("nextSendAt").notNull(),
  /** Status of the enrollment */
  status: mysqlEnum("status", ["active", "completed", "unsubscribed", "paused"]).default("active").notNull(),
  /** Whether customer purchased the upsell (audio pack) */
  purchasedUpsell: int("purchasedUpsell").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferSelect;
export type InsertEmailSequenceEnrollment = typeof emailSequenceEnrollments.$inferInsert;

/**
 * Email send log — record of every email sent in the nurture sequence.
 * Tracks delivery status, open tracking, and click tracking.
 */
export const emailSendLog = mysqlTable("email_send_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Enrollment this email belongs to */
  enrollmentId: int("enrollmentId").notNull(),
  /** Customer email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Day number in the sequence (1-6) */
  dayNumber: int("dayNumber").notNull(),
  /** Email subject line */
  subject: varchar("subject", { length: 500 }).notNull(),
  /** Whether the email was sent successfully */
  success: int("success").default(0).notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Brevo message ID for tracking */
  messageId: varchar("messageId", { length: 255 }),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
});

export type EmailSendLog = typeof emailSendLog.$inferSelect;
export type InsertEmailSendLog = typeof emailSendLog.$inferInsert;

/**
 * Testimonials — customer feedback collected via Day 7 email survey.
 * Admin can approve/reject before displaying on landing page.
 */
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  /** Unique token for the testimonial submission link (sent in Day 7 email) */
  token: varchar("token", { length: 128 }).notNull().unique(),
  /** Customer email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer name (from enrollment) */
  name: varchar("name", { length: 255 }),
  /** Enrollment ID that generated this request */
  enrollmentId: int("enrollmentId"),
  /** 1-5 star rating */
  rating: int("rating"),
  /** Customer's written testimonial */
  body: text("body"),
  /** How many nights it took to see results */
  nightsToResult: int("nightsToResult"),
  /** Whether customer consents to public display */
  consentToPublish: int("consentToPublish").default(0).notNull(),
  /** Admin moderation status */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  /** Whether to feature on landing page (pinned to top) */
  featured: int("featured").default(0).notNull(),
  /** Admin notes */
  adminNote: text("adminNote"),
  /** When the customer submitted the testimonial */
  submittedAt: timestamp("submittedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

/**
 * Blog posts — SEO-optimized articles targeting sleep/insomnia keywords.
 * Drives organic traffic from Google and links back to the product.
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** URL-friendly slug, e.g. "how-to-fall-asleep-fast" */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** SEO title (50-60 chars) */
  title: varchar("title", { length: 255 }).notNull(),
  /** Meta description (120-160 chars) */
  metaDescription: varchar("metaDescription", { length: 500 }),
  /** Focus keyword for this article */
  focusKeyword: varchar("focusKeyword", { length: 128 }),
  /** Secondary keywords (JSON array) */
  secondaryKeywords: text("secondaryKeywords"),
  /** Full article body in Markdown */
  body: text("body").notNull(),
  /** Excerpt shown on blog listing page */
  excerpt: text("excerpt"),
  /** Hero image CDN URL */
  heroImageUrl: text("heroImageUrl"),
  /** Hero image alt text */
  heroImageAlt: varchar("heroImageAlt", { length: 255 }),
  /** Author name */
  author: varchar("author", { length: 128 }).default("Deep Sleep Reset Team").notNull(),
  /** Category: sleep-science, insomnia, anxiety, cbt-i, lifestyle */
  category: varchar("category", { length: 64 }).default("sleep-science").notNull(),
  /** Estimated read time in minutes */
  readTimeMinutes: int("readTimeMinutes").default(5).notNull(),
  /** Publication status */
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  /** Whether to feature on blog homepage */
  featured: int("featured").default(0).notNull(),
  /** JSON-LD FAQ data for schema markup (JSON array of {question, answer}) */
  faqSchema: text("faqSchema"),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Blog comments — user-submitted comments on blog posts.
 * Moderated: only approved comments are shown publicly.
 */
export const blogComments = mysqlTable("blog_comments", {
  id: int("id").autoincrement().primaryKey(),
  /** FK to blog_posts.id */
  postId: int("postId").notNull(),
  /** Display name (guest or user) */
  authorName: varchar("authorName", { length: 128 }).notNull(),
  /** Email (not shown publicly, for moderation) */
  authorEmail: varchar("authorEmail", { length: 320 }),
  /** Comment body */
  body: text("body").notNull(),
  /** Star rating 1-5 (optional) */
  rating: int("rating"),
  /** Moderation status */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = typeof blogComments.$inferInsert;

/**
 * Newsletter subscribers — email addresses captured from the blog.
 */
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 128 }),
  /** Source: blog, landing_page, exit_popup */
  source: varchar("source", { length: 64 }).default("blog").notNull(),
  /** Whether they confirmed via double opt-in */
  confirmed: int("confirmed").default(0).notNull(),
  /** Confirmation token for double opt-in */
  confirmToken: varchar("confirmToken", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

/**
 * A/B test events — tracks impressions and conversions per hook variant.
 * Variant IDs: 'quiz' (Sleep Score Quiz), 'chatbot' (Chatbot Teaser), 'social' (Social Proof Wall)
 */
export const abEvents = mysqlTable("ab_events", {
  id: int("id").autoincrement().primaryKey(),
  /** Which variant was shown: quiz | chatbot | social | btn_amber | btn_green | btn_blue | price_5 | price_7 */
  variant: mysqlEnum("variant", ["quiz", "chatbot", "social", "btn_amber", "btn_green", "btn_blue", "price_5", "price_7"]).notNull(),
  /** Event type: impression (variant shown) or conversion (CTA clicked → checkout) */
  eventType: mysqlEnum("eventType", ["impression", "conversion"]).notNull(),
  /** Anonymous session ID (from localStorage) */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** Optional: email if captured */
  email: varchar("email", { length: 320 }),
  /** Optional: extra metadata, e.g. chatbot script variant (sleep-impact | identity-shift) */
  metadata: varchar("metadata", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AbEvent = typeof abEvents.$inferSelect;
export type InsertAbEvent = typeof abEvents.$inferInsert;

/**
 * Quiz attempts — stores each Sleep Score Quiz result per session.
 * Used to show score trend chart across multiple attempts.
 */
export const quizAttempts = mysqlTable("quiz_attempts", {
  id: int("id").autoincrement().primaryKey(),
  /** Anonymous session ID (from localStorage) */
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  /** Optional: email if captured */
  email: varchar("email", { length: 320 }),
  /** Score 0-100 */
  score: int("score").notNull(),
  /** Score label: Critical, Poor, Fair, Good, Excellent */
  label: varchar("label", { length: 32 }).notNull(),
  /** Optional personal note the user can attach to this attempt */
  note: varchar("note", { length: 280 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

/**
 * Testimonial media — user-submitted photos or videos attached to testimonials.
 * Displayed in the Social Proof Wall hook. Moderated before showing publicly.
 */
export const testimonialMedia = mysqlTable("testimonial_media", {
  id: int("id").autoincrement().primaryKey(),
  /** Submitter's display name */
  name: varchar("name", { length: 128 }).notNull(),
  /** Short testimonial quote */
  quote: text("quote").notNull(),
  /** Star rating 1-5 */
  rating: int("rating").default(5).notNull(),
  /** S3 CDN URL of the uploaded image or video */
  mediaUrl: text("mediaUrl"),
  /** Type of media: image | video */
  mediaType: mysqlEnum("mediaType", ["image", "video"]),
  /** Moderation status */
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TestimonialMedia = typeof testimonialMedia.$inferSelect;
export type InsertTestimonialMedia = typeof testimonialMedia.$inferInsert;

/**
 * Abandoned checkouts — tracks visitors who entered their email on the order page
 * but did not complete payment. Used for abandoned cart recovery emails.
 */
export const abandonedCheckouts = mysqlTable("abandoned_checkouts", {
  id: int("id").autoincrement().primaryKey(),
  /** Email entered on the order/checkout page */
  email: varchar("email", { length: 320 }).notNull(),
  /** Name if captured */
  name: varchar("name", { length: 255 }),
  /** Product they were trying to buy */
  productKey: varchar("productKey", { length: 64 }).default("frontEnd").notNull(),
  /** Whether a recovery email was sent */
  recoverySent: int("recoverySent").default(0).notNull(),
  /** Whether they eventually completed the purchase */
  recovered: int("recovered").default(0).notNull(),
  /** Timestamp when recovery email was sent */
  recoverySentAt: timestamp("recoverySentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AbandonedCheckout = typeof abandonedCheckouts.$inferSelect;
export type InsertAbandonedCheckout = typeof abandonedCheckouts.$inferInsert;

/**
 * Email A/B test tracking — records which subject variant was sent and tracks opens/clicks.
 */
export const emailAbTests = mysqlTable("email_ab_tests", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Subject variant: A, B, or C */
  variant: varchar("variant", { length: 4 }).notNull(),
  /** The actual subject line sent */
  subject: varchar("subject", { length: 255 }).notNull(),
  /** Product key for context */
  productKey: varchar("productKey", { length: 64 }).notNull(),
  /** Whether the email was opened (tracked via pixel) */
  opened: int("opened").default(0).notNull(),
  /** Whether a link was clicked */
  clicked: int("clicked").default(0).notNull(),
  /** Timestamp of first open */
  openedAt: timestamp("openedAt"),
  /** Timestamp of first click */
  clickedAt: timestamp("clickedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type EmailAbTest = typeof emailAbTests.$inferSelect;
export type InsertEmailAbTest = typeof emailAbTests.$inferInsert;

/**
 * Sleep Chronotype quiz results — personalised sleep type assessment.
 * 4 types: Lion (early riser), Bear (solar), Wolf (night owl), Dolphin (light sleeper).
 */
export const chronotypeResults = mysqlTable("chronotype_results", {
  id: int("id").autoincrement().primaryKey(),
  /** Anonymous session identifier */
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  /** Optional email if captured */
  email: varchar("email", { length: 320 }),
  /** Chronotype: lion, bear, wolf, dolphin */
  chronotype: varchar("chronotype", { length: 32 }).notNull(),
  /** Raw score JSON: { lion: number, bear: number, wolf: number, dolphin: number } */
  scoreData: text("scoreData").notNull(),
  /** LLM-generated personalised sleep plan (markdown) */
  personalPlan: text("personalPlan"),
  /** Optimal sleep window e.g. "22:30 – 06:30" */
  sleepWindow: varchar("sleepWindow", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ChronotypeResult = typeof chronotypeResults.$inferSelect;
export type InsertChronotypeResult = typeof chronotypeResults.$inferInsert;
