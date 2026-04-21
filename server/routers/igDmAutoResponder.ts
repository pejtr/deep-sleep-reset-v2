/**
 * Instagram DM Auto-Responder Router
 *
 * Handles:
 * - Keyword rule CRUD (create, read, update, delete)
 * - Meta webhook verification endpoint
 * - Comment processing: keyword matching → DM sending via Graph API
 * - Comment event log and DM log queries
 * - Webhook config management
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  igDmRules,
  igCommentEvents,
  igDmLog,
  igWebhookConfig,
} from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

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

// ─── Graph API helpers ────────────────────────────────────────────────────────

async function sendInstagramDM(
  recipientId: string,
  message: string,
  pageAccessToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pageAccessToken}`,
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          messaging_type: "RESPONSE",
        }),
      }
    );
    const data = await res.json() as any;
    if (!res.ok || data.error) {
      return { success: false, error: data.error?.message ?? "Unknown Graph API error" };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function getPostComments(
  igPostId: string,
  pageAccessToken: string
): Promise<Array<{ id: string; text: string; from: { id: string; username?: string } }>> {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${igPostId}/comments?fields=id,text,from&limit=50&access_token=${pageAccessToken}`
    );
    const data = await res.json() as any;
    return data.data ?? [];
  } catch {
    return [];
  }
}

// ─── Keyword matching ─────────────────────────────────────────────────────────

function matchesKeyword(
  commentText: string,
  keyword: string,
  matchMode: "exact" | "contains"
): boolean {
  const text = commentText.toLowerCase().trim();
  const kw = keyword.toLowerCase().trim();
  if (matchMode === "exact") {
    // Match whole word
    const words = text.split(/\s+/);
    return words.includes(kw);
  }
  // contains: substring match
  return text.includes(kw);
}

function buildDmMessage(template: string, username?: string): string {
  const name = username ? `@${username}` : "there";
  return template.replace(/\{name\}/gi, name);
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const igDmAutoResponderRouter = router({
  // ── Keyword Rules ──────────────────────────────────────────────────────────

  getRules: adminProcedure.query(async () => {
    const db = await requireDb();
    return db.select().from(igDmRules).orderBy(desc(igDmRules.createdAt));
  }),

  createRule: adminProcedure
    .input(
      z.object({
        keyword: z.string().min(1).max(128),
        dmTemplate: z.string().min(1),
        matchMode: z.enum(["exact", "contains"]).default("contains"),
        postFilter: z.string().optional(),
        enabled: z.number().min(0).max(1).default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const [result] = await db.insert(igDmRules).values({
        keyword: input.keyword.toUpperCase(),
        dmTemplate: input.dmTemplate,
        matchMode: input.matchMode,
        postFilter: input.postFilter ?? null,
        enabled: input.enabled,
      });
      return { id: (result as any).insertId, keyword: input.keyword.toUpperCase() };
    }),

  updateRule: adminProcedure
    .input(
      z.object({
        id: z.number(),
        keyword: z.string().min(1).max(128).optional(),
        dmTemplate: z.string().min(1).optional(),
        matchMode: z.enum(["exact", "contains"]).optional(),
        postFilter: z.string().nullable().optional(),
        enabled: z.number().min(0).max(1).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const updates: Record<string, any> = {};
      if (input.keyword !== undefined) updates.keyword = input.keyword.toUpperCase();
      if (input.dmTemplate !== undefined) updates.dmTemplate = input.dmTemplate;
      if (input.matchMode !== undefined) updates.matchMode = input.matchMode;
      if (input.postFilter !== undefined) updates.postFilter = input.postFilter;
      if (input.enabled !== undefined) updates.enabled = input.enabled;
      await db.update(igDmRules).set(updates).where(eq(igDmRules.id, input.id));
      return { success: true };
    }),

  deleteRule: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();
      await db.delete(igDmRules).where(eq(igDmRules.id, input.id));
      return { success: true };
    }),

  // ── Webhook Config ─────────────────────────────────────────────────────────

  getWebhookConfig: adminProcedure.query(async () => {
    const db = await requireDb();
    const rows = await db.select().from(igWebhookConfig).limit(1);
    if (rows.length === 0) return null;
    const cfg = rows[0]!;
    // Mask secrets in response
    return {
      ...cfg,
      metaAppSecret: cfg.metaAppSecret ? "••••••••" : null,
      pageAccessToken: cfg.pageAccessToken ? "••••••••" : null,
    };
  }),

  saveWebhookConfig: adminProcedure
    .input(
      z.object({
        metaAppId: z.string().optional(),
        metaAppSecret: z.string().optional(),
        pageAccessToken: z.string().optional(),
        verifyToken: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();
      const existing = await db.select().from(igWebhookConfig).limit(1);
      if (existing.length === 0) {
        await db.insert(igWebhookConfig).values({
          metaAppId: input.metaAppId ?? null,
          metaAppSecret: input.metaAppSecret ?? null,
          pageAccessToken: input.pageAccessToken ?? null,
          verifyToken: input.verifyToken ?? null,
          webhookActive: 0,
        });
      } else {
        const updates: Record<string, any> = {};
        if (input.metaAppId !== undefined) updates.metaAppId = input.metaAppId;
        if (input.metaAppSecret !== undefined) updates.metaAppSecret = input.metaAppSecret;
        if (input.pageAccessToken !== undefined) updates.pageAccessToken = input.pageAccessToken;
        if (input.verifyToken !== undefined) updates.verifyToken = input.verifyToken;
        await db.update(igWebhookConfig).set(updates).where(eq(igWebhookConfig.id, existing[0]!.id));
      }
      return { success: true };
    }),

  // ── Comment Log & DM Log ───────────────────────────────────────────────────

  getCommentEvents: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      return db
        .select()
        .from(igCommentEvents)
        .orderBy(desc(igCommentEvents.createdAt))
        .limit(input.limit);
    }),

  getDmLog: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input }) => {
      const db = await requireDb();
      return db
        .select()
        .from(igDmLog)
        .orderBy(desc(igDmLog.sentAt))
        .limit(input.limit);
    }),

  getDmStats: adminProcedure.query(async () => {
    const db = await requireDb();
    const [totalComments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(igCommentEvents);
    const [totalMatched] = await db
      .select({ count: sql<number>`count(*)` })
      .from(igCommentEvents)
      .where(eq(igCommentEvents.status, "matched"));
    const [totalDmsSent] = await db
      .select({ count: sql<number>`count(*)` })
      .from(igDmLog)
      .where(eq(igDmLog.success, 1));
    const [totalDmsFailed] = await db
      .select({ count: sql<number>`count(*)` })
      .from(igDmLog)
      .where(eq(igDmLog.success, 0));
    return {
      totalComments: totalComments?.count ?? 0,
      totalMatched: totalMatched?.count ?? 0,
      totalDmsSent: totalDmsSent?.count ?? 0,
      totalDmsFailed: totalDmsFailed?.count ?? 0,
      conversionRate:
        (totalComments?.count ?? 0) > 0
          ? Math.round(((totalDmsSent?.count ?? 0) / (totalComments?.count ?? 1)) * 100)
          : 0,
    };
  }),

  // ── Manual scan: poll recent post comments and process rules ──────────────

  scanComments: adminProcedure
    .input(z.object({ igPostId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await requireDb();

      // Get webhook config for access token
      const cfgRows = await db.select().from(igWebhookConfig).limit(1);
      const cfg = cfgRows[0];
      if (!cfg?.pageAccessToken) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Page Access Token not configured. Add it in Webhook Settings.",
        });
      }

      // Get active rules
      const rules = await db
        .select()
        .from(igDmRules)
        .where(eq(igDmRules.enabled, 1));

      if (rules.length === 0) {
        return { scanned: 0, matched: 0, dmsSent: 0, message: "No active rules" };
      }

      // If no specific post, get recent posts from MCP (we'll use a placeholder approach)
      // In production this would call the Graph API directly
      const postIds = input.igPostId ? [input.igPostId] : [];

      let scanned = 0;
      let matched = 0;
      let dmsSent = 0;

      for (const postId of postIds) {
        const comments = await getPostComments(postId, cfg.pageAccessToken);

        for (const comment of comments) {
          scanned++;

          // Check if already processed
          const existing = await db
            .select()
            .from(igCommentEvents)
            .where(eq(igCommentEvents.igCommentId, comment.id))
            .limit(1);

          if (existing.length > 0) continue; // Already processed

          // Find matching rule
          let matchedRule = null;
          let matchedKeyword = null;
          for (const rule of rules) {
            if (matchesKeyword(comment.text, rule.keyword, rule.matchMode)) {
              matchedRule = rule;
              matchedKeyword = rule.keyword;
              break;
            }
          }

          const status = matchedRule ? "matched" : "scanned";

          // Insert comment event
          const [commentInsert] = await db.insert(igCommentEvents).values({
            igCommentId: comment.id,
            igPostId: postId,
            igUserId: comment.from.id,
            igUsername: comment.from.username ?? null,
            commentText: comment.text,
            keywordMatched: matchedKeyword,
            ruleId: matchedRule?.id ?? null,
            status,
          });
          const commentEventId = (commentInsert as any).insertId;

          if (matchedRule) {
            matched++;

            // Build and send DM
            const message = buildDmMessage(matchedRule.dmTemplate, comment.from.username);
            const result = await sendInstagramDM(comment.from.id, message, cfg.pageAccessToken);

            // Log the DM
            await db.insert(igDmLog).values({
              ruleId: matchedRule.id,
              commentEventId,
              igUserId: comment.from.id,
              igUsername: comment.from.username ?? null,
              message,
              success: result.success ? 1 : 0,
              errorMessage: result.error ?? null,
            });

            // Update comment event status
            await db
              .update(igCommentEvents)
              .set({ status: result.success ? "dm_sent" : "dm_failed", errorMessage: result.error ?? null })
              .where(eq(igCommentEvents.igCommentId, comment.id));

            // Update rule stats
            await db
              .update(igDmRules)
              .set({
                triggerCount: sql`${igDmRules.triggerCount} + 1`,
                dmsSent: result.success ? sql`${igDmRules.dmsSent} + 1` : sql`${igDmRules.dmsSent}`,
              })
              .where(eq(igDmRules.id, matchedRule.id));

            if (result.success) dmsSent++;
          }
        }
      }

      // Update webhook config stats
      if (cfg) {
        await db
          .update(igWebhookConfig)
          .set({
            totalEventsReceived: sql`${igWebhookConfig.totalEventsReceived} + ${scanned}`,
            lastEventAt: new Date(),
          })
          .where(eq(igWebhookConfig.id, cfg.id));
      }

      return { scanned, matched, dmsSent };
    }),

  // ── Process a single comment (called from webhook handler) ────────────────

  processWebhookComment: publicProcedure
    .input(
      z.object({
        webhookSecret: z.string(),
        igCommentId: z.string(),
        igPostId: z.string(),
        igUserId: z.string(),
        igUsername: z.string().optional(),
        commentText: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();

      // Verify webhook secret matches stored verify token
      const cfgRows = await db.select().from(igWebhookConfig).limit(1);
      const cfg = cfgRows[0];
      if (!cfg?.verifyToken || cfg.verifyToken !== input.webhookSecret) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid webhook secret" });
      }
      if (!cfg.pageAccessToken) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No page access token" });
      }

      // Deduplication check
      const existing = await db
        .select()
        .from(igCommentEvents)
        .where(eq(igCommentEvents.igCommentId, input.igCommentId))
        .limit(1);
      if (existing.length > 0) return { duplicate: true };

      // Get active rules
      const rules = await db
        .select()
        .from(igDmRules)
        .where(eq(igDmRules.enabled, 1));

      let matchedRule = null;
      let matchedKeyword = null;
      for (const rule of rules) {
        // Check post filter
        if (rule.postFilter) {
          const allowed: string[] = JSON.parse(rule.postFilter);
          if (!allowed.includes(input.igPostId)) continue;
        }
        if (matchesKeyword(input.commentText, rule.keyword, rule.matchMode)) {
          matchedRule = rule;
          matchedKeyword = rule.keyword;
          break;
        }
      }

      const status = matchedRule ? "matched" : "scanned";

      const [commentInsert] = await db.insert(igCommentEvents).values({
        igCommentId: input.igCommentId,
        igPostId: input.igPostId,
        igUserId: input.igUserId,
        igUsername: input.igUsername ?? null,
        commentText: input.commentText,
        keywordMatched: matchedKeyword,
        ruleId: matchedRule?.id ?? null,
        status,
      });
      const commentEventId = (commentInsert as any).insertId;

      if (!matchedRule) return { matched: false };

      const message = buildDmMessage(matchedRule.dmTemplate, input.igUsername);
      const result = await sendInstagramDM(input.igUserId, message, cfg.pageAccessToken);

      await db.insert(igDmLog).values({
        ruleId: matchedRule.id,
        commentEventId,
        igUserId: input.igUserId,
        igUsername: input.igUsername ?? null,
        message,
        success: result.success ? 1 : 0,
        errorMessage: result.error ?? null,
      });

      await db
        .update(igCommentEvents)
        .set({ status: result.success ? "dm_sent" : "dm_failed", errorMessage: result.error ?? null })
        .where(eq(igCommentEvents.igCommentId, input.igCommentId));

      await db
        .update(igDmRules)
        .set({
        triggerCount: sql`${igDmRules.triggerCount} + 1`,
        dmsSent: result.success ? sql`${igDmRules.dmsSent} + 1` : sql`${igDmRules.dmsSent}`,
      })
      .where(eq(igDmRules.id, matchedRule.id));

      // Update webhook stats
      await db
        .update(igWebhookConfig)
        .set({
          totalEventsReceived: sql`${igWebhookConfig.totalEventsReceived} + 1`,
          lastEventAt: new Date(),
        })
        .where(eq(igWebhookConfig.id, cfg.id));

      return { matched: true, dmSent: result.success, error: result.error };
    }),
});
