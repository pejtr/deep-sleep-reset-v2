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
});
