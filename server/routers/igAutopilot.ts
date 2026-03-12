import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { getDb } from "../db";
import {
  igScheduledPosts,
  igPostAnalytics,
  igAutopilotSettings,
  igAbTests,
  igHashtagStats,
  igRepostQueue,
} from "../../drizzle/schema";
import { eq, desc, and, lte, sql } from "drizzle-orm";
import { execMcpTool } from "../_core/mcp";

// Helper to get DB or throw
async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  }
  return next({ ctx });
});

// Sleep topics pool — AI rotates through these based on performance
const SLEEP_TOPICS = [
  { id: "why_3am", label: "Why You Wake at 3am", tone: "educational" },
  { id: "racing_mind", label: "Racing Mind at Night", tone: "emotional" },
  { id: "breathing_478", label: "4-7-8 Breathing Method", tone: "educational" },
  { id: "cortisol", label: "Cortisol & Sleep", tone: "educational" },
  { id: "sleep_pressure", label: "Sleep Pressure Reset", tone: "educational" },
  { id: "stimulus_control", label: "Bed = Sleep Association", tone: "educational" },
  { id: "circadian_rhythm", label: "Circadian Clock Reset", tone: "educational" },
  { id: "melatonin_myth", label: "Melatonin Doesn't Work", tone: "emotional" },
  { id: "sleep_deprivation", label: "Cost of Sleep Deprivation", tone: "emotional" },
  { id: "cbti_method", label: "What is CBT-I?", tone: "educational" },
  { id: "before_after", label: "Before & After Sleep", tone: "emotional" },
  { id: "testimonial", label: "Social Proof / Results", tone: "promotional" },
  { id: "price_value", label: "$5 Value Proposition", tone: "promotional" },
  { id: "body_scan", label: "Body Scan Technique", tone: "educational" },
  { id: "navy_seal", label: "Navy SEAL Sleep Trick", tone: "educational" },
];

type AnalyticsRow = typeof igPostAnalytics.$inferSelect;

// Use AI to pick the best topic based on past analytics
async function pickBestTopic(recentAnalytics: AnalyticsRow[]): Promise<string> {
  if (recentAnalytics.length === 0) {
    return SLEEP_TOPICS[Math.floor(Math.random() * SLEEP_TOPICS.length)]!.id;
  }

  const topicScores: Record<string, { totalEngagement: number; count: number }> = {};
  for (const a of recentAnalytics) {
    if (!a.topic) continue;
    if (!topicScores[a.topic]) topicScores[a.topic] = { totalEngagement: 0, count: 0 };
    topicScores[a.topic]!.totalEngagement += a.engagementRate;
    topicScores[a.topic]!.count++;
  }

  const topicSummary = SLEEP_TOPICS.map(t => {
    const score = topicScores[t.id];
    const avgEngagement = score ? Math.round(score.totalEngagement / score.count) : 0;
    return `${t.id}: "${t.label}" (avg engagement: ${avgEngagement}%, tone: ${t.tone})`;
  }).join("\n");

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are an Instagram content strategist for "Deep Sleep Reset" — a $5 sleep improvement program. Pick the next best topic to post about based on past performance data.`,
      },
      {
        role: "user",
        content: `Topics and their past engagement:\n\n${topicSummary}\n\nPick the single best topic ID to post next. Respond with ONLY the topic ID.`,
      },
    ],
  });

  const topicId = (result.choices[0]?.message?.content as string || "").trim();
  const found = SLEEP_TOPICS.find(t => t.id === topicId);
  return found ? found.id : SLEEP_TOPICS[Math.floor(Math.random() * SLEEP_TOPICS.length)]!.id;
}

// Generate AI caption and image prompt for a topic
async function generateContentForTopic(
  topicId: string,
  postType: "post" | "story"
): Promise<{ caption: string; imagePrompt: string }> {
  const topic = SLEEP_TOPICS.find(t => t.id === topicId) || SLEEP_TOPICS[0]!;

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `You are a world-class Instagram copywriter for "Deep Sleep Reset" — a $5 science-backed sleep improvement program (7-night CBT-I protocol). Brand voice: warm, knowledgeable, empathetic. Visual style: dark navy (#0a0e1a), amber/gold accents, crescent moon motif, cinematic premium wellness.`,
      },
      {
        role: "user",
        content: `Create Instagram ${postType} content for the topic: "${topic.label}" (tone: ${topic.tone}).

Return a JSON object with exactly these two fields:
1. "caption" — the full Instagram caption (for posts: 150-300 words with emojis, hashtags at end; for stories: 1-2 punchy sentences, no hashtags)
2. "imagePrompt" — a detailed image generation prompt for a ${postType === "post" ? "4:5 vertical" : "9:16 vertical"} Instagram ${postType}. Must describe: dark navy background, crescent moon, text overlays with key message, amber/gold accents, premium wellness aesthetic.

Respond ONLY with valid JSON.`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "ig_content",
        strict: true,
        schema: {
          type: "object",
          properties: {
            caption: { type: "string" },
            imagePrompt: { type: "string" },
          },
          required: ["caption", "imagePrompt"],
          additionalProperties: false,
        },
      },
    },
  });

  const raw = result.choices[0]?.message?.content as string;
  try {
    const parsed = JSON.parse(raw);
    return { caption: parsed.caption || "", imagePrompt: parsed.imagePrompt || "" };
  } catch {
    return {
      caption: `🌙 ${topic.label}\n\nLink in bio for the full 7-Night Deep Sleep Reset — $5.\n\n#insomnia #sleepbetter #deepsleepreset`,
      imagePrompt: `Instagram ${postType} for Deep Sleep Reset. Dark navy background, crescent moon, amber text overlay: "${topic.label}". Premium wellness brand aesthetic.`,
    };
  }
}

// Generate image and return CDN URL
async function generatePostImage(imagePrompt: string): Promise<string> {
  const result = await generateImage({ prompt: imagePrompt });
  return result.url ?? "";
}

// Publish a scheduled post to Instagram via MCP CLI
async function publishToInstagram(
  post: typeof igScheduledPosts.$inferSelect
): Promise<{ igPostId: string; igPermalink: string }> {
  const result = await execMcpTool("instagram", "create_instagram", {
    type: post.type,
    caption: post.type === "post" ? post.caption : undefined,
    media: [{ type: "image", media_url: post.imageUrl, alt_text: post.topic }],
  });

  const permalinkMatch = result.match(/Permalink:\s*(https:\/\/[^\s\n]+)/);
  const permalink = permalinkMatch ? permalinkMatch[1]!.trim() : "";
  const postIdMatch = permalink.match(/\/p\/([^/]+)\//);
  const storyIdMatch = permalink.match(/\/stories\/[^/]+\/(\d+)/);
  const igPostId = postIdMatch?.[1] || storyIdMatch?.[1] || "";

  return { igPostId, igPermalink: permalink };
}

export const igAutopilotRouter = router({
  // Get autopilot settings
  getSettings: adminProcedure.query(async () => {
    const db = await requireDb();
    const settings = await db.select().from(igAutopilotSettings).limit(1);
    if (settings.length === 0) {
      await db.insert(igAutopilotSettings).values({
        enabled: 1,
        postTimeUtc: "09:00",
        storyTimeUtc: "17:00",
        contentTone: "mixed",
        topicRotation: JSON.stringify(SLEEP_TOPICS.map(t => t.id)),
        autoPublish: 1,
      });
      const newSettings = await db.select().from(igAutopilotSettings).limit(1);
      return newSettings[0]!;
    }
    return settings[0]!;
  }),

  // Update autopilot settings
  updateSettings: adminProcedure
    .input(z.object({
      enabled: z.number().optional(),
      postTimeUtc: z.string().optional(),
      storyTimeUtc: z.string().optional(),
      contentTone: z.enum(["educational", "emotional", "promotional", "mixed"]).optional(),
      autoPublish: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const settings = await db.select().from(igAutopilotSettings).limit(1);
      if (settings.length === 0) {
        await db.insert(igAutopilotSettings).values({
          enabled: input.enabled ?? 1,
          postTimeUtc: input.postTimeUtc ?? "09:00",
          storyTimeUtc: input.storyTimeUtc ?? "17:00",
          contentTone: input.contentTone ?? "mixed",
          autoPublish: input.autoPublish ?? 1,
        });
      } else {
        await db.update(igAutopilotSettings)
          .set(input)
          .where(eq(igAutopilotSettings.id, settings[0]!.id));
      }
      return { success: true };
    }),

  // Get scheduled posts (content calendar)
  getScheduledPosts: adminProcedure
    .input(z.object({
      limit: z.number().default(20),
      status: z.enum(["pending", "published", "failed", "cancelled"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = input.status
        ? [eq(igScheduledPosts.status, input.status)]
        : [];
      return db.select()
        .from(igScheduledPosts)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(igScheduledPosts.scheduledAt))
        .limit(input.limit);
    }),

  // Get analytics (learning data)
  getAnalytics: adminProcedure
    .input(z.object({ limit: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      return db.select()
        .from(igPostAnalytics)
        .orderBy(desc(igPostAnalytics.fetchedAt))
        .limit(input.limit);
    }),

  // Get top performing topics
  getTopTopics: adminProcedure.query(async () => {
    const db = await requireDb();
    const analytics = await db.select().from(igPostAnalytics).limit(100);
    const topicScores: Record<string, { totalEngagement: number; count: number; label: string }> = {};
    for (const a of analytics) {
      if (!a.topic) continue;
      const topicMeta = SLEEP_TOPICS.find(t => t.id === a.topic);
      if (!topicScores[a.topic]) {
        topicScores[a.topic] = { totalEngagement: 0, count: 0, label: topicMeta?.label || a.topic };
      }
      topicScores[a.topic]!.totalEngagement += a.engagementRate;
      topicScores[a.topic]!.count++;
    }
    return Object.entries(topicScores)
      .map(([id, data]) => ({
        id,
        label: data.label,
        avgEngagement: Math.round(data.totalEngagement / data.count),
        count: data.count,
      }))
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10);
  }),

  // Manually generate and schedule a post
  generateAndSchedule: adminProcedure
    .input(z.object({
      type: z.enum(["post", "story"]),
      topicId: z.string().optional(),
      scheduledAt: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const recentAnalytics = await db.select().from(igPostAnalytics).orderBy(desc(igPostAnalytics.fetchedAt)).limit(50);
      const topicId = input.topicId || await pickBestTopic(recentAnalytics);
      const topic = SLEEP_TOPICS.find(t => t.id === topicId) || SLEEP_TOPICS[0]!;

      const { caption, imagePrompt } = await generateContentForTopic(topicId, input.type);
      const imageUrl = await generatePostImage(imagePrompt);

      await db.insert(igScheduledPosts).values({
        type: input.type,
        topic: topic.label,
        caption,
        imagePrompt,
        imageUrl,
        scheduledAt: new Date(input.scheduledAt),
        status: "pending",
      });

      return { success: true, topicId, topic: topic.label };
    }),

  // Generate a full week of content (7 posts + 7 stories)
  generateWeek: adminProcedure
    .input(z.object({
      startDate: z.string(),
      postHourUtc: z.number().default(9),
      storyHourUtc: z.number().default(17),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const recentAnalytics = await db.select().from(igPostAnalytics).orderBy(desc(igPostAnalytics.fetchedAt)).limit(50);
      const results: { day: number; type: string; topic: string; status: string }[] = [];

      for (let day = 0; day < 7; day++) {
        const baseDate = new Date(input.startDate);
        baseDate.setDate(baseDate.getDate() + day);

        // Post
        const postDate = new Date(baseDate);
        postDate.setUTCHours(input.postHourUtc, 0, 0, 0);
        const postTopicId = await pickBestTopic(recentAnalytics);
        const postTopic = SLEEP_TOPICS.find(t => t.id === postTopicId) || SLEEP_TOPICS[day % SLEEP_TOPICS.length]!;

        try {
          const { caption, imagePrompt } = await generateContentForTopic(postTopicId, "post");
          const imageUrl = await generatePostImage(imagePrompt);
          await db.insert(igScheduledPosts).values({
            type: "post", topic: postTopic.label, caption, imagePrompt, imageUrl,
            scheduledAt: postDate, status: "pending",
          });
          results.push({ day: day + 1, type: "post", topic: postTopic.label, status: "scheduled" });
        } catch {
          results.push({ day: day + 1, type: "post", topic: postTopic.label, status: "error" });
        }

        // Story
        const storyDate = new Date(baseDate);
        storyDate.setUTCHours(input.storyHourUtc, 0, 0, 0);
        const storyTopicId = await pickBestTopic(recentAnalytics);
        const storyTopic = SLEEP_TOPICS.find(t => t.id === storyTopicId) || SLEEP_TOPICS[(day + 7) % SLEEP_TOPICS.length]!;

        try {
          const { caption, imagePrompt } = await generateContentForTopic(storyTopicId, "story");
          const imageUrl = await generatePostImage(imagePrompt);
          await db.insert(igScheduledPosts).values({
            type: "story", topic: storyTopic.label, caption, imagePrompt, imageUrl,
            scheduledAt: storyDate, status: "pending",
          });
          results.push({ day: day + 1, type: "story", topic: storyTopic.label, status: "scheduled" });
        } catch {
          results.push({ day: day + 1, type: "story", topic: storyTopic.label, status: "error" });
        }
      }

      return { success: true, results };
    }),

  // Publish all pending posts that are due now
  publishDue: adminProcedure.mutation(async () => {
    const db = await requireDb();
    const now = new Date();
    const duePosts = await db.select()
      .from(igScheduledPosts)
      .where(and(
        eq(igScheduledPosts.status, "pending"),
        lte(igScheduledPosts.scheduledAt, now)
      ))
      .limit(10);

    const results: { id: number; status: string; permalink?: string; error?: string }[] = [];

    for (const post of duePosts) {
      try {
        const { igPostId, igPermalink } = await publishToInstagram(post);
        await db.update(igScheduledPosts)
          .set({ status: "published", igPostId, igPermalink })
          .where(eq(igScheduledPosts.id, post.id));
        results.push({ id: post.id, status: "published", permalink: igPermalink });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        await db.update(igScheduledPosts)
          .set({ status: "failed", errorMessage: msg })
          .where(eq(igScheduledPosts.id, post.id));
        results.push({ id: post.id, status: "failed", error: msg });
      }
    }

    return { published: results.filter(r => r.status === "published").length, results };
  }),

  // Fetch analytics for published posts and update learning data
  syncAnalytics: adminProcedure.mutation(async () => {
    const db = await requireDb();
    const publishedPosts = await db.select()
      .from(igScheduledPosts)
      .where(and(
        eq(igScheduledPosts.status, "published"),
        sql`${igScheduledPosts.igPostId} IS NOT NULL`
      ))
      .limit(20);

    let synced = 0;
    for (const post of publishedPosts) {
      if (!post.igPostId) continue;
      try {
        const result = await execMcpTool("instagram", "get_post_insights", {
          post_id: post.igPostId,
        });

        const likes = parseInt(result.match(/likes[:\s]+(\d+)/i)?.[1] || "0");
        const comments = parseInt(result.match(/comments[:\s]+(\d+)/i)?.[1] || "0");
        const reach = parseInt(result.match(/reach[:\s]+(\d+)/i)?.[1] || "0");
        const impressions = parseInt(result.match(/impressions[:\s]+(\d+)/i)?.[1] || "0");
        const saves = parseInt(result.match(/saves[:\s]+(\d+)/i)?.[1] || "0");
        const shares = parseInt(result.match(/shares[:\s]+(\d+)/i)?.[1] || "0");
        const profileVisits = parseInt(result.match(/profile.?visits[:\s]+(\d+)/i)?.[1] || "0");
        const websiteClicks = parseInt(result.match(/website.?clicks[:\s]+(\d+)/i)?.[1] || "0");
        const engagementRate = reach > 0 ? Math.round(((likes + comments + saves) / reach) * 100) : 0;

        await db.insert(igPostAnalytics).values({
          scheduledPostId: post.id,
          igPostId: post.igPostId,
          likes, comments, reach, impressions, saves, shares,
          profileVisits, websiteClicks, engagementRate,
          topic: post.topic,
          postType: post.type,
        });

        await db.update(igScheduledPosts)
          .set({ performanceScore: engagementRate })
          .where(eq(igScheduledPosts.id, post.id));

        synced++;
      } catch {
        // Skip if insights not available yet
      }
    }

    return { synced };
  }),

  // Cancel a scheduled post
  cancelPost: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.update(igScheduledPosts)
        .set({ status: "cancelled" })
        .where(eq(igScheduledPosts.id, input.id));
      return { success: true };
    }),

  // Get available topics list
  getTopics: adminProcedure.query(() => SLEEP_TOPICS),

  // ─── A/B CAPTION TESTING ─────────────────────────────────────────────────────

  // Create an A/B test: generate 2 caption variants for the same topic and schedule both
  createAbTest: adminProcedure
    .input(z.object({
      topicId: z.string().optional(),
      scheduledAt: z.string(), // when to post variant A
      offsetMinutes: z.number().default(60), // how many minutes later to post variant B
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const recentAnalytics = await db.select().from(igPostAnalytics).orderBy(desc(igPostAnalytics.fetchedAt)).limit(50);
      const topicId = input.topicId || await pickBestTopic(recentAnalytics);
      const topic = SLEEP_TOPICS.find(t => t.id === topicId) || SLEEP_TOPICS[0]!;

      // Generate two different captions for the same topic
      const [contentA, contentB] = await Promise.all([
        generateContentForTopic(topicId, "post"),
        generateContentForTopic(topicId, "post"),
      ]);

      // Generate one shared image (same visual, different captions)
      const imageUrl = await generatePostImage(contentA.imagePrompt);

      const scheduledAtA = new Date(input.scheduledAt);
      const scheduledAtB = new Date(scheduledAtA.getTime() + input.offsetMinutes * 60 * 1000);

      // Insert both posts
      const [insertA] = await db.insert(igScheduledPosts).values({
        type: "post", topic: topic.label, caption: contentA.caption,
        imagePrompt: contentA.imagePrompt, imageUrl, scheduledAt: scheduledAtA, status: "pending",
      });
      const postAId = (insertA as any).insertId as number;

      const [insertB] = await db.insert(igScheduledPosts).values({
        type: "post", topic: `${topic.label} (B)`, caption: contentB.caption,
        imagePrompt: contentB.imagePrompt, imageUrl, scheduledAt: scheduledAtB, status: "pending",
      });
      const postBId = (insertB as any).insertId as number;

      // Evaluate 48h after the second post
      const evaluateAt = new Date(scheduledAtB.getTime() + 48 * 60 * 60 * 1000);

      await db.insert(igAbTests).values({
        postAId, postBId, topic: topic.label, status: "running", evaluateAt,
      });

      return { success: true, topic: topic.label, postAId, postBId };
    }),

  // Get all A/B tests
  getAbTests: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(igAbTests).orderBy(desc(igAbTests.createdAt)).limit(20);
  }),

  // Evaluate completed A/B tests (check analytics and pick winner)
  evaluateAbTests: adminProcedure.mutation(async () => {
    const db = await requireDb();
    const now = new Date();
    const runningTests = await db.select().from(igAbTests)
      .where(and(eq(igAbTests.status, "running"), lte(igAbTests.evaluateAt, now)))
      .limit(10);

    let evaluated = 0;
    for (const test of runningTests) {
      const [analyticsA] = await db.select().from(igPostAnalytics)
        .where(eq(igPostAnalytics.scheduledPostId, test.postAId)).limit(1);
      const [analyticsB] = await db.select().from(igPostAnalytics)
        .where(eq(igPostAnalytics.scheduledPostId, test.postBId)).limit(1);

      if (!analyticsA || !analyticsB) continue; // Not published yet

      const engA = analyticsA.engagementRate;
      const engB = analyticsB.engagementRate;
      const diff = Math.abs(engA - engB);
      const winner = diff < 2 ? "tie" : engA > engB ? "a" : "b";

      await db.update(igAbTests)
        .set({ status: "completed", winner, engagementA: engA, engagementB: engB })
        .where(eq(igAbTests.id, test.id));

      evaluated++;
    }
    return { evaluated };
  }),

  // ─── HASHTAG OPTIMIZER ───────────────────────────────────────────────────────

  // Get hashtag performance stats
  getHashtagStats: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(igHashtagStats)
      .orderBy(desc(igHashtagStats.avgEngagementRate))
      .limit(50);
  }),

  // Get AI-optimized hashtag set for a new post
  getOptimizedHashtags: adminProcedure
    .input(z.object({ topicId: z.string().optional(), count: z.number().default(20) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const topic = SLEEP_TOPICS.find(t => t.id === input.topicId) || SLEEP_TOPICS[0]!;

      // Get top performing hashtags from DB
      const topHashtags = await db.select().from(igHashtagStats)
        .orderBy(desc(igHashtagStats.avgEngagementRate))
        .limit(30);

      // Ask AI to select and supplement with new ones
      const existingList = topHashtags.map(h => `${h.hashtag} (avg reach: ${h.avgReach}, engagement: ${h.avgEngagementRate}%)`).join(", ");

      const result = await invokeLLM({
        messages: [
          { role: "system", content: "You are an Instagram hashtag strategist for a sleep wellness brand." },
          {
            role: "user",
            content: `Topic: "${topic.label}". Best performing hashtags so far: ${existingList || "none yet"}.

Generate exactly ${input.count} hashtags for this post. Mix: 5 high-volume (#insomnia, #sleep), 10 mid-volume (#sleepbetter, #cbti), 5 niche (#deepsleepreset, #sleepscience). Return JSON array of strings only.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "hashtags",
            strict: true,
            schema: { type: "object", properties: { hashtags: { type: "array", items: { type: "string" } } }, required: ["hashtags"], additionalProperties: false },
          },
        },
      });

      try {
        const parsed = JSON.parse(result.choices[0]?.message?.content as string);
        return { hashtags: (parsed.hashtags as string[]).slice(0, input.count) };
      } catch {
        return { hashtags: ["#insomnia", "#sleepbetter", "#deepsleepreset", "#cbti", "#sleepscience"] };
      }
    }),

  // Update hashtag stats after a post's analytics are synced
  updateHashtagStats: adminProcedure
    .input(z.object({
      hashtags: z.array(z.string()),
      reach: z.number(),
      engagementRate: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      for (const tag of input.hashtags) {
        const existing = await db.select().from(igHashtagStats)
          .where(eq(igHashtagStats.hashtag, tag)).limit(1);

        if (existing.length === 0) {
          await db.insert(igHashtagStats).values({
            hashtag: tag,
            timesUsed: 1,
            avgReach: input.reach,
            avgEngagementRate: input.engagementRate,
            totalReach: input.reach,
            lastUsedAt: new Date(),
          });
        } else {
          const h = existing[0]!;
          const newTimesUsed = h.timesUsed + 1;
          const newTotalReach = h.totalReach + input.reach;
          const newAvgReach = Math.round(newTotalReach / newTimesUsed);
          const newAvgEngagement = Math.round((h.avgEngagementRate * h.timesUsed + input.engagementRate) / newTimesUsed);
          await db.update(igHashtagStats)
            .set({ timesUsed: newTimesUsed, totalReach: newTotalReach, avgReach: newAvgReach, avgEngagementRate: newAvgEngagement, lastUsedAt: new Date() })
            .where(eq(igHashtagStats.id, h.id));
        }
      }
      return { updated: input.hashtags.length };
    }),

  // ─── AUTO-REPOST TOP PERFORMERS ──────────────────────────────────────────────

  // Get repost queue
  getRepostQueue: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(igRepostQueue).orderBy(desc(igRepostQueue.scheduledAt)).limit(20);
  }),

  // Scan published posts and queue top performers for reposting (>10% engagement, >30 days old)
  scanForReposts: adminProcedure.mutation(async () => {
    const db = await requireDb();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get posts with high engagement that are older than 30 days
    const topPosts = await db.select()
      .from(igPostAnalytics)
      .where(sql`${igPostAnalytics.engagementRate} >= 10 AND ${igPostAnalytics.fetchedAt} <= ${thirtyDaysAgo}`)
      .orderBy(desc(igPostAnalytics.engagementRate))
      .limit(10);

    let queued = 0;
    for (const analytics of topPosts) {
      // Check if already queued
      const existing = await db.select().from(igRepostQueue)
        .where(eq(igRepostQueue.originalPostId, analytics.scheduledPostId)).limit(1);
      if (existing.length > 0) continue;

      // Schedule repost 30 days from now
      const repostDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await db.insert(igRepostQueue).values({
        originalPostId: analytics.scheduledPostId,
        qualifyingEngagementRate: analytics.engagementRate,
        scheduledAt: repostDate,
        status: "pending",
      });
      queued++;
    }

    return { queued };
  }),

  // Execute due reposts
  publishDueReposts: adminProcedure.mutation(async () => {
    const db = await requireDb();
    const now = new Date();
    const dueReposts = await db.select().from(igRepostQueue)
      .where(and(eq(igRepostQueue.status, "pending"), lte(igRepostQueue.scheduledAt, now)))
      .limit(5);

    let published = 0;
    for (const repost of dueReposts) {
      const [originalPost] = await db.select().from(igScheduledPosts)
        .where(eq(igScheduledPosts.id, repost.originalPostId)).limit(1);
      if (!originalPost) continue;

      try {
        // Create a new scheduled post entry for the repost
        const [insertResult] = await db.insert(igScheduledPosts).values({
          type: originalPost.type,
          topic: originalPost.topic,
          caption: originalPost.caption,
          imagePrompt: originalPost.imagePrompt,
          imageUrl: originalPost.imageUrl,
          scheduledAt: now,
          status: "pending",
        });
        const newPostId = (insertResult as any).insertId as number;

        // Publish it
        const { igPostId, igPermalink } = await publishToInstagram({ ...originalPost, id: newPostId });
        await db.update(igScheduledPosts)
          .set({ status: "published", igPostId, igPermalink })
          .where(eq(igScheduledPosts.id, newPostId));

        await db.update(igRepostQueue)
          .set({ status: "published", repostId: newPostId })
          .where(eq(igRepostQueue.id, repost.id));

        published++;
      } catch {
        await db.update(igRepostQueue)
          .set({ status: "cancelled" })
          .where(eq(igRepostQueue.id, repost.id));
      }
    }
    return { published };
  }),
});
