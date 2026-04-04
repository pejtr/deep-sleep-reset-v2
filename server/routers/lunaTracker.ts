/**
 * Luna Content Performance Tracker — tRPC Router
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { lunaPostTracker, lunaFollowerSnapshots } from "../../drizzle/schema";
import { eq, desc, asc, and, gte, lte, sql, like } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return db;
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

const formatEnum = z.enum(["reel", "carousel", "post", "story", "live"]);
const pillarEnum = z.enum(["education", "emotion", "promotion", "social_proof", "entertainment"]);
const ctaTypeEnum = z.enum(["dm_keyword", "link_in_bio", "comment", "save", "share", "none"]);

const postInputSchema = z.object({
  scheduledPostId: z.number().optional(),
  igPostId: z.string().max(128).optional(),
  igPermalink: z.string().url().optional(),
  format: formatEnum,
  topic: z.string().min(1).max(255),
  caption: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  publishedAt: z.string(),
  pillar: pillarEnum.default("education"),
  ctaType: ctaTypeEnum.default("link_in_bio"),
  ctaKeyword: z.string().max(64).optional(),
  reach: z.number().int().min(0).default(0),
  impressions: z.number().int().min(0).default(0),
  plays: z.number().int().min(0).optional(),
  avgWatchTimeSec: z.number().int().min(0).optional(),
  watchThroughRate: z.number().int().min(0).max(100).default(0),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  saves: z.number().int().min(0).default(0),
  shares: z.number().int().min(0).default(0),
  profileVisits: z.number().int().min(0).default(0),
  linkClicks: z.number().int().min(0).default(0),
  dmsReceived: z.number().int().min(0).default(0),
  dmConversions: z.number().int().min(0).default(0),
  attributedRevenueCents: z.number().int().min(0).default(0),
  newFollowers: z.number().int().min(0).default(0),
  unfollows: z.number().int().min(0).default(0),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeEngagementBp(likes: number, comments: number, saves: number, shares: number, reach: number): number {
  if (reach === 0) return 0;
  return Math.round(((likes + comments + saves + shares) / reach) * 10000);
}

function computeViralityScore(row: {
  reach: number; impressions: number; likes: number; comments: number;
  saves: number; shares: number; profileVisits: number; linkClicks: number;
  dmsReceived: number; newFollowers: number; watchThroughRate: number;
}): number {
  const engRate = row.reach > 0 ? (row.likes + row.comments + row.saves + row.shares) / row.reach : 0;
  const saveRate = row.reach > 0 ? row.saves / row.reach : 0;
  const shareRate = row.reach > 0 ? row.shares / row.reach : 0;
  const convRate = row.reach > 0 ? (row.linkClicks + row.dmsReceived) / row.reach : 0;
  const followerRate = row.reach > 0 ? row.newFollowers / row.reach : 0;

  const score =
    Math.min(engRate * 1000, 30) +
    Math.min(saveRate * 2000, 25) +
    Math.min(shareRate * 3000, 20) +
    Math.min(convRate * 2000, 15) +
    Math.min(followerRate * 2000, 10);

  return Math.min(Math.round(score), 100);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const lunaTrackerRouter = router({
  tracker: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(100).default(50),
        offset: z.number().int().min(0).default(0),
        format: formatEnum.optional(),
        pillar: pillarEnum.optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        search: z.string().optional(),
        sortBy: z.enum(["publishedAt", "reach", "engagementRateBp", "linkClicks", "dmsReceived", "viralityScore", "attributedRevenueCents"]).default("publishedAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
      }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const conditions = [];
        if (input.format) conditions.push(eq(lunaPostTracker.format, input.format));
        if (input.pillar) conditions.push(eq(lunaPostTracker.pillar, input.pillar));
        if (input.dateFrom) conditions.push(gte(lunaPostTracker.publishedAt, new Date(input.dateFrom)));
        if (input.dateTo) conditions.push(lte(lunaPostTracker.publishedAt, new Date(input.dateTo)));
        if (input.search) conditions.push(like(lunaPostTracker.topic, `%${input.search}%`));

        const orderCol = lunaPostTracker[input.sortBy as keyof typeof lunaPostTracker] as any;
        const orderFn = input.sortDir === "asc" ? asc : desc;

        const [posts, countResult] = await Promise.all([
          db.select().from(lunaPostTracker)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(orderFn(orderCol))
            .limit(input.limit)
            .offset(input.offset),
          db.select({ count: sql<number>`count(*)` }).from(lunaPostTracker)
            .where(conditions.length ? and(...conditions) : undefined),
        ]);

        return { posts, total: countResult[0]?.count ?? 0 };
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const [post] = await db.select().from(lunaPostTracker).where(eq(lunaPostTracker.id, input.id)).limit(1);
        return post ?? null;
      }),

    create: protectedProcedure
      .input(postInputSchema)
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const engBp = computeEngagementBp(input.likes, input.comments, input.saves, input.shares, input.reach);
        const viralityScore = computeViralityScore({
          reach: input.reach, impressions: input.impressions,
          likes: input.likes, comments: input.comments,
          saves: input.saves, shares: input.shares,
          profileVisits: input.profileVisits, linkClicks: input.linkClicks,
          dmsReceived: input.dmsReceived, newFollowers: input.newFollowers,
          watchThroughRate: input.watchThroughRate,
        });

        const publishedDate = new Date(input.publishedAt);
        const weekNumber = Math.ceil((publishedDate.getTime() - new Date(publishedDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

        const [result] = await db.insert(lunaPostTracker).values({
          ...input,
          publishedAt: publishedDate,
          weekNumber,
          engagementRateBp: engBp,
          viralityScore,
          repostCandidate: viralityScore >= 70 ? 1 : 0,
          dataSource: "manual",
        });

        return { id: (result as any).insertId, viralityScore, engagementRateBp: engBp };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number().int() }).merge(postInputSchema.partial()))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const { id, ...data } = input;

        const existing = await db.select().from(lunaPostTracker).where(eq(lunaPostTracker.id, id)).limit(1);
        if (!existing[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

        const merged = { ...existing[0], ...data };
        const engBp = computeEngagementBp(merged.likes, merged.comments, merged.saves, merged.shares, merged.reach);
        const viralityScore = computeViralityScore({
          reach: merged.reach, impressions: merged.impressions,
          likes: merged.likes, comments: merged.comments,
          saves: merged.saves, shares: merged.shares,
          profileVisits: merged.profileVisits, linkClicks: merged.linkClicks,
          dmsReceived: merged.dmsReceived, newFollowers: merged.newFollowers,
          watchThroughRate: merged.watchThroughRate ?? 0,
        });

        await db.update(lunaPostTracker).set({
          ...data,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
          engagementRateBp: engBp,
          viralityScore,
          repostCandidate: viralityScore >= 70 ? 1 : 0,
        }).where(eq(lunaPostTracker.id, id));

        return { success: true, viralityScore, engagementRateBp: engBp };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        await db.delete(lunaPostTracker).where(eq(lunaPostTracker.id, input.id));
        return { success: true };
      }),

    kpis: protectedProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const conditions = [];
        if (input.dateFrom) conditions.push(gte(lunaPostTracker.publishedAt, new Date(input.dateFrom)));
        if (input.dateTo) conditions.push(lte(lunaPostTracker.publishedAt, new Date(input.dateTo)));

        const where = conditions.length ? and(...conditions) : undefined;

        const [agg] = await db.select({
          totalPosts: sql<number>`count(*)`,
          totalReach: sql<number>`sum(reach)`,
          totalImpressions: sql<number>`sum(impressions)`,
          totalLikes: sql<number>`sum(likes)`,
          totalComments: sql<number>`sum(comments)`,
          totalSaves: sql<number>`sum(saves)`,
          totalShares: sql<number>`sum(shares)`,
          totalLinkClicks: sql<number>`sum(link_clicks)`,
          totalDmsReceived: sql<number>`sum(dms_received)`,
          totalDmConversions: sql<number>`sum(dm_conversions)`,
          totalRevenueCents: sql<number>`sum(attributed_revenue_cents)`,
          totalNewFollowers: sql<number>`sum(new_followers)`,
          avgEngagementBp: sql<number>`avg(engagement_rate_bp)`,
          avgViralityScore: sql<number>`avg(virality_score)`,
          repostCandidates: sql<number>`sum(repost_candidate)`,
        }).from(lunaPostTracker).where(where);

        return {
          totalPosts: agg?.totalPosts ?? 0,
          totalReach: agg?.totalReach ?? 0,
          totalImpressions: agg?.totalImpressions ?? 0,
          totalEngagements: (agg?.totalLikes ?? 0) + (agg?.totalComments ?? 0) + (agg?.totalSaves ?? 0) + (agg?.totalShares ?? 0),
          totalLinkClicks: agg?.totalLinkClicks ?? 0,
          totalDmsReceived: agg?.totalDmsReceived ?? 0,
          totalDmConversions: agg?.totalDmConversions ?? 0,
          totalRevenueCents: agg?.totalRevenueCents ?? 0,
          totalNewFollowers: agg?.totalNewFollowers ?? 0,
          avgEngagementRate: ((agg?.avgEngagementBp ?? 0) / 100).toFixed(2),
          avgViralityScore: Math.round(agg?.avgViralityScore ?? 0),
          repostCandidates: agg?.repostCandidates ?? 0,
          dmConversionRate: agg?.totalDmsReceived
            ? ((agg.totalDmConversions / agg.totalDmsReceived) * 100).toFixed(1)
            : "0.0",
        };
      }),

    trends: protectedProcedure
      .input(z.object({ weeks: z.number().int().min(1).max(52).default(12) }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const since = new Date();
        since.setDate(since.getDate() - input.weeks * 7);

        return db.select({
          week: sql<string>`DATE_FORMAT(published_at, '%Y-%u')`,
          reach: sql<number>`sum(reach)`,
          engagements: sql<number>`sum(likes + comments + saves + shares)`,
          linkClicks: sql<number>`sum(link_clicks)`,
          dmsReceived: sql<number>`sum(dms_received)`,
          newFollowers: sql<number>`sum(new_followers)`,
          revenueCents: sql<number>`sum(attributed_revenue_cents)`,
          posts: sql<number>`count(*)`,
          avgVirality: sql<number>`avg(virality_score)`,
        }).from(lunaPostTracker)
          .where(gte(lunaPostTracker.publishedAt, since))
          .groupBy(sql`DATE_FORMAT(published_at, '%Y-%u')`)
          .orderBy(sql`DATE_FORMAT(published_at, '%Y-%u')`);
      }),

    topPosts: protectedProcedure
      .input(z.object({
        metric: z.enum(["reach", "engagementRateBp", "linkClicks", "dmsReceived", "viralityScore", "saves", "shares"]).default("viralityScore"),
        limit: z.number().int().min(1).max(20).default(5),
      }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const col = lunaPostTracker[input.metric as keyof typeof lunaPostTracker] as any;
        return db.select().from(lunaPostTracker)
          .orderBy(desc(col))
          .limit(input.limit);
      }),

    formatBreakdown: protectedProcedure.query(async () => {
      const db = await requireDb();
      return db.select({
        format: lunaPostTracker.format,
        posts: sql<number>`count(*)`,
        avgReach: sql<number>`avg(reach)`,
        avgEngagementBp: sql<number>`avg(engagement_rate_bp)`,
        avgLinkClicks: sql<number>`avg(link_clicks)`,
        avgDmsReceived: sql<number>`avg(dms_received)`,
        avgViralityScore: sql<number>`avg(virality_score)`,
        totalRevenueCents: sql<number>`sum(attributed_revenue_cents)`,
      }).from(lunaPostTracker)
        .groupBy(lunaPostTracker.format)
        .orderBy(desc(sql`avg(virality_score)`));
    }),

    pillarBreakdown: protectedProcedure.query(async () => {
      const db = await requireDb();
      return db.select({
        pillar: lunaPostTracker.pillar,
        posts: sql<number>`count(*)`,
        avgReach: sql<number>`avg(reach)`,
        avgEngagementBp: sql<number>`avg(engagement_rate_bp)`,
        avgLinkClicks: sql<number>`avg(link_clicks)`,
        avgViralityScore: sql<number>`avg(virality_score)`,
        totalRevenueCents: sql<number>`sum(attributed_revenue_cents)`,
      }).from(lunaPostTracker)
        .groupBy(lunaPostTracker.pillar)
        .orderBy(desc(sql`avg(virality_score)`));
    }),

    scorePost: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        const [post] = await db.select().from(lunaPostTracker).where(eq(lunaPostTracker.id, input.id)).limit(1);
        if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });

        const engRate = post.reach > 0 ? ((post.likes + post.comments + post.saves + post.shares) / post.reach * 100).toFixed(2) : "0";

        const prompt = `You are a social media performance analyst for an Instagram wellness account (@luna.sleep.reset) selling a $5 sleep program.

Analyze this post and provide a concise 2-sentence insight:

Post: "${post.topic}"
Format: ${post.format} | Pillar: ${post.pillar} | CTA: ${post.ctaType}
Reach: ${post.reach} | Impressions: ${post.impressions}
Engagement rate: ${engRate}% | Saves: ${post.saves} | Shares: ${post.shares}
Link clicks: ${post.linkClicks} | DMs received: ${post.dmsReceived} | DM conversions: ${post.dmConversions}
New followers: ${post.newFollowers} | Virality score: ${post.viralityScore}/100

Provide: 1) What worked or didn't work, 2) One specific actionable recommendation to improve next time. Be direct and specific. Max 60 words total.`;

        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
        });

        const aiInsight = (typeof response.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content
          : null) ?? "Analysis unavailable.";

        await db.update(lunaPostTracker)
          .set({ aiInsight })
          .where(eq(lunaPostTracker.id, input.id));

        return { aiInsight };
      }),

    csvExport: protectedProcedure
      .input(z.object({
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const conditions = [];
        if (input.dateFrom) conditions.push(gte(lunaPostTracker.publishedAt, new Date(input.dateFrom)));
        if (input.dateTo) conditions.push(lte(lunaPostTracker.publishedAt, new Date(input.dateTo)));

        const posts = await db.select().from(lunaPostTracker)
          .where(conditions.length ? and(...conditions) : undefined)
          .orderBy(desc(lunaPostTracker.publishedAt));

        const headers = [
          "ID", "Published At", "Format", "Pillar", "CTA Type", "CTA Keyword", "Topic",
          "Reach", "Impressions", "Plays", "Watch Through %", "Avg Watch Sec",
          "Likes", "Comments", "Saves", "Shares", "Engagement Rate %",
          "Profile Visits", "Link Clicks", "DMs Received", "DM Conversions",
          "Revenue ($)", "New Followers", "Unfollows", "Virality Score", "Repost Candidate",
          "Data Source", "IG Post ID", "IG Permalink", "AI Insight",
        ];

        const rows = posts.map(p => [
          p.id,
          new Date(p.publishedAt).toISOString().split("T")[0],
          p.format,
          p.pillar,
          p.ctaType,
          p.ctaKeyword ?? "",
          `"${(p.topic ?? "").replace(/"/g, '""')}"`,
          p.reach,
          p.impressions,
          p.plays ?? 0,
          p.watchThroughRate,
          p.avgWatchTimeSec ?? 0,
          p.likes,
          p.comments,
          p.saves,
          p.shares,
          (p.engagementRateBp / 100).toFixed(2),
          p.profileVisits,
          p.linkClicks,
          p.dmsReceived,
          p.dmConversions,
          (p.attributedRevenueCents / 100).toFixed(2),
          p.newFollowers,
          p.unfollows ?? 0,
          p.viralityScore ?? 0,
          p.repostCandidate ? "Yes" : "No",
          p.dataSource,
          p.igPostId ?? "",
          p.igPermalink ?? "",
          `"${(p.aiInsight ?? "").replace(/"/g, '""')}"`,
        ]);

        const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        return { csv, count: posts.length };
      }),
  }),

  follower: router({
    addSnapshot: protectedProcedure
      .input(z.object({
        followerCount: z.number().int().min(0),
        followingCount: z.number().int().min(0).default(0),
        totalPosts: z.number().int().min(0).default(0),
        snapshotDate: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await requireDb();
        await db.insert(lunaFollowerSnapshots).values({
          ...input,
          snapshotDate: new Date(input.snapshotDate),
        });
        return { success: true };
      }),

    history: protectedProcedure
      .input(z.object({ days: z.number().int().min(7).max(365).default(90) }))
      .query(async ({ input }) => {
        const db = await requireDb();
        const since = new Date();
        since.setDate(since.getDate() - input.days);
        return db.select().from(lunaFollowerSnapshots)
          .where(gte(lunaFollowerSnapshots.snapshotDate, since))
          .orderBy(asc(lunaFollowerSnapshots.snapshotDate));
      }),
  }),
});
