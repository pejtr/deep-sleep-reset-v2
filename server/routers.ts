import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createEmailJob,
  getAdminOverview,
  getContentFeed,
  getMemberDashboard,
  getUserPurchases,
  listAdminContentItems,
  listQaChecklist,
  recordFunnelEvent,
  saveDailyCheckIn,
  seedQaChecklistIfEmpty,
  syncAuthenticatedUser,
  updateQaChecklistItem,
  upsertContentItem,
  userHasPremiumAccess,
} from "./db";
import { createCheckoutSession } from "./stripe";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) {
        return null;
      }

      const syncedUser = await syncAuthenticatedUser({
        openId: opts.ctx.user.openId,
        name: opts.ctx.user.name,
        email: opts.ctx.user.email,
        loginMethod: opts.ctx.user.loginMethod,
      });

      if (syncedUser) {
        await recordFunnelEvent({
          userId: syncedUser.id,
          email: syncedUser.email,
          eventType: "login",
          detail: "Authenticated session resolved",
        });
      }

      return syncedUser ?? opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  public: router({
    trackLandingView: publicProcedure.mutation(async ({ ctx }) => {
      await recordFunnelEvent({
        userId: ctx.user?.id,
        email: ctx.user?.email,
        eventType: "landing_view",
        detail: "Public landing page viewed",
      });
      return { success: true } as const;
    }),
    trackQuizCompletion: publicProcedure
      .input(
        z.object({
          chronotype: z.string().min(2),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await recordFunnelEvent({
          userId: ctx.user?.id,
          email: ctx.user?.email,
          eventType: "content_view",
          detail: `Chronotype quiz completed: ${input.chronotype}`,
        });
        return { success: true } as const;
      }),
  }),
  checkout: router({
    createSession: protectedProcedure.mutation(async ({ ctx }) => {
      const session = await createCheckoutSession({
        user: {
          id: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
        },
        origin: ctx.req.headers.origin ?? "http://localhost:3000",
      });

      if (ctx.user.email) {
        await createEmailJob({
          userId: ctx.user.id,
          email: ctx.user.email,
          eventType: "funnel",
          subject: "DeepSleepReset checkout started",
          body: "A DeepSleepReset checkout session was initiated for your account.",
        });
      }

      return {
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    }),
  }),
  member: router({
    access: protectedProcedure.query(async ({ ctx }) => {
      const hasPremium = await userHasPremiumAccess(ctx.user.id);
      return { hasPremium };
    }),
    payments: protectedProcedure.query(async ({ ctx }) => getUserPurchases(ctx.user.id)),
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const hasPremium = await userHasPremiumAccess(ctx.user.id);
      if (!hasPremium) {
        return {
          hasPremium,
          progress: null,
          feed: [],
        };
      }
      const dashboard = await getMemberDashboard(ctx.user.id);
      return {
        hasPremium,
        progress: dashboard?.progress ?? null,
        feed: dashboard?.feed ?? [],
      };
    }),
    feed: protectedProcedure.query(async ({ ctx }) => {
      const hasPremium = await userHasPremiumAccess(ctx.user.id);
      if (!hasPremium) return [];
      return getContentFeed(ctx.user.id);
    }),
    checkIn: protectedProcedure.mutation(async ({ ctx }) => {
      const hasPremium = await userHasPremiumAccess(ctx.user.id);
      if (!hasPremium) {
        throw new Error("Premium access required");
      }

      const progress = await saveDailyCheckIn(ctx.user.id);
      if (ctx.user.email) {
        await createEmailJob({
          userId: ctx.user.id,
          email: ctx.user.email,
          eventType: "checkin",
          subject: "DeepSleepReset daily check-in logged",
          body: "Your latest DeepSleepReset check-in has been saved. Keep the rhythm calm and steady.",
        });
      }
      return progress;
    }),
  }),
  petra: router({
    chat: protectedProcedure
      .input(
        z.object({
          messages: z.array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1),
            }),
          ).max(20),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const hasPremium = await userHasPremiumAccess(ctx.user.id);
        if (!hasPremium) {
          throw new Error("Petra is available only to DeepSleepReset Premium members.");
        }

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are Petra, the Gentle Support companion inside DeepSleepReset. Speak in a calm, warm, premium wellness tone. Offer practical, soothing sleep support, not medical diagnosis. If the user mentions severe symptoms, self-harm, or emergency risk, advise contacting a qualified clinician or emergency services immediately.",
            },
            ...input.messages,
          ],
        });

        const content = response.choices[0]?.message?.content ?? "Let us take the next gentle sleep step together.";
        await recordFunnelEvent({
          userId: ctx.user.id,
          email: ctx.user.email,
          eventType: "content_view",
          detail: "Petra conversation completed",
        });

        return { content };
      }),
  }),
  admin: router({
    overview: adminProcedure.query(async () => getAdminOverview()),
    contentList: adminProcedure.query(async () => listAdminContentItems()),
    upsertContent: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive().optional(),
          slug: z.string().min(2),
          title: z.string().min(2),
          summary: z.string().min(2),
          body: z.string().min(2),
          contentType: z.enum(["tip", "audio", "video", "checkin"]),
          dayNumber: z.number().int().positive(),
          mediaUrl: z.string().optional(),
          isPremium: z.number().int().min(0).max(1),
          isPublished: z.number().int().min(0).max(1),
        }),
      )
      .mutation(async ({ input }) => {
        await upsertContentItem({
          ...input,
          mediaUrl: input.mediaUrl ?? null,
        });
        return { success: true } as const;
      }),
    qaList: adminProcedure.query(async () => {
      await seedQaChecklistIfEmpty();
      return listQaChecklist();
    }),
    updateQaItem: adminProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["pending", "pass", "fail"]),
          notes: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await updateQaChecklistItem({
          id: input.id,
          status: input.status,
          notes: input.notes,
          updatedByUserId: ctx.user.id,
        });
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
