/**
 * Instagram Autopilot Cron Job
 * Runs every 5 minutes to:
 * 1. Publish any pending posts that are due
 * 2. Auto-generate new content if the queue is running low
 */
import { getDb } from "./db";
import {
  igScheduledPosts,
  igAutopilotSettings,
  igPostAnalytics,
} from "../drizzle/schema";
import { eq, and, lte, count, gte, desc } from "drizzle-orm";
import { execMcpTool } from "./_core/mcp";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";

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

async function pickBestTopic(recentAnalytics: typeof igPostAnalytics.$inferSelect[]): Promise<string> {
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
    return `${t.id}: "${t.label}" (avg engagement: ${avgEngagement}%)`;
  }).join("\n");

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are an Instagram content strategist for Deep Sleep Reset. Pick the best next topic ID." },
        { role: "user", content: `Topics:\n${topicSummary}\n\nRespond with ONLY the topic ID.` },
      ],
    });
    const topicId = (result.choices[0]?.message?.content as string || "").trim();
    const found = SLEEP_TOPICS.find(t => t.id === topicId);
    return found ? found.id : SLEEP_TOPICS[Math.floor(Math.random() * SLEEP_TOPICS.length)]!.id;
  } catch {
    return SLEEP_TOPICS[Math.floor(Math.random() * SLEEP_TOPICS.length)]!.id;
  }
}

async function generateContent(topicId: string, postType: "post" | "story") {
  const topic = SLEEP_TOPICS.find(t => t.id === topicId) || SLEEP_TOPICS[0]!;
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a world-class Instagram copywriter for "Deep Sleep Reset" — a $5 CBT-I sleep program. Brand: dark navy, amber/gold, crescent moon, premium wellness.`,
        },
        {
          role: "user",
          content: `Create ${postType} content for: "${topic.label}" (tone: ${topic.tone}). Return JSON with "caption" and "imagePrompt" fields only.`,
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
    const parsed = JSON.parse(result.choices[0]?.message?.content as string);
    return { caption: parsed.caption || "", imagePrompt: parsed.imagePrompt || "", topic };
  } catch {
    return {
      caption: `🌙 ${topic.label}\n\nLink in bio — Deep Sleep Reset $5.\n\n#insomnia #sleepbetter`,
      imagePrompt: `Instagram ${postType} for Deep Sleep Reset. Dark navy, crescent moon, amber text: "${topic.label}".`,
      topic,
    };
  }
}

/**
 * Main cron tick — called every 5 minutes by the server
 */
export async function igCronTick() {
  const db = await getDb();
  if (!db) return;

  try {
    // 1. Get settings
    const settingsRows = await db.select().from(igAutopilotSettings).limit(1);
    const settings = settingsRows[0];
    if (!settings || settings.enabled === 0) return;

    const now = new Date();

    // 2. Publish due posts (if auto-publish is on)
    if (settings.autoPublish === 1) {
      const duePosts = await db.select()
        .from(igScheduledPosts)
        .where(and(
          eq(igScheduledPosts.status, "pending"),
          lte(igScheduledPosts.scheduledAt, now)
        ))
        .limit(5);

      for (const post of duePosts) {
        try {
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

          await db.update(igScheduledPosts)
            .set({ status: "published", igPostId, igPermalink: permalink })
            .where(eq(igScheduledPosts.id, post.id));

          console.log(`[IG Cron] Published ${post.type}: ${post.topic}`);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          await db.update(igScheduledPosts)
            .set({ status: "failed", errorMessage: msg })
            .where(eq(igScheduledPosts.id, post.id));
          console.error(`[IG Cron] Failed to publish post ${post.id}:`, msg);
        }
      }
    }

    // 3. Auto-generate if queue is running low (< 3 pending posts in next 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const [pendingCountRow] = await db.select({ count: count() })
      .from(igScheduledPosts)
      .where(and(
        eq(igScheduledPosts.status, "pending"),
        lte(igScheduledPosts.scheduledAt, threeDaysFromNow)
      ));

    const pendingCount = pendingCountRow?.count ?? 0;

    if (pendingCount < 3) {
      console.log(`[IG Cron] Queue low (${pendingCount} pending), generating new content...`);

      const recentAnalytics = await db.select().from(igPostAnalytics)
        .orderBy(desc(igPostAnalytics.fetchedAt)).limit(50);

      // Generate 1 post and 1 story for tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Post at configured hour
      const postHour = parseInt(settings.postTimeUtc.split(":")[0]!);
      const postDate = new Date(tomorrow);
      postDate.setUTCHours(postHour, 0, 0, 0);

      const postTopicId = await pickBestTopic(recentAnalytics);
      const { caption: postCaption, imagePrompt: postPrompt, topic: postTopic } = await generateContent(postTopicId, "post");
      const postImageResult = await generateImage({ prompt: postPrompt });

      await db.insert(igScheduledPosts).values({
        type: "post",
        topic: postTopic.label,
        caption: postCaption,
        imagePrompt: postPrompt,
        imageUrl: postImageResult.url ?? "",
        scheduledAt: postDate,
        status: "pending",
      });

      // Story at configured hour
      const storyHour = parseInt(settings.storyTimeUtc.split(":")[0]!);
      const storyDate = new Date(tomorrow);
      storyDate.setUTCHours(storyHour, 0, 0, 0);

      const storyTopicId = await pickBestTopic(recentAnalytics);
      const { caption: storyCaption, imagePrompt: storyPrompt, topic: storyTopic } = await generateContent(storyTopicId, "story");
      const storyImageResult = await generateImage({ prompt: storyPrompt });

      await db.insert(igScheduledPosts).values({
        type: "story",
        topic: storyTopic.label,
        caption: storyCaption,
        imagePrompt: storyPrompt,
        imageUrl: storyImageResult.url ?? "",
        scheduledAt: storyDate,
        status: "pending",
      });

      console.log(`[IG Cron] Auto-generated: post "${postTopic.label}" + story "${storyTopic.label}"`);
    }
  } catch (e) {
    console.error("[IG Cron] Error in cron tick:", e);
  }
}
