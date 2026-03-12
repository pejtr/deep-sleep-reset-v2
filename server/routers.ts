import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCheckoutSession, createBundleCheckoutSession, PRODUCTS, type ProductKey } from "./stripe/index";
import { invokeLLM } from "./_core/llm";
import { saveLead, saveChatInsight, saveChatSurvey, getOrdersByEmail, getAdminStats, getFunnelStats, getRecentOrders, getRecentLeads, getRecentChatInsights, getRecentChatSurveys, getDailyRevenue } from "./db";
import { igAutopilotRouter } from "./routers/igAutopilot";
import { igDmAutoResponderRouter } from "./routers/igDmAutoResponder";
import { emailSequenceRouter } from "./routers/emailSequence";

const productKeySchema = z.enum(["frontEnd", "exitDiscount", "upsell1", "upsell2"]);

export const appRouter = router({
  system: systemRouter,
  igAutopilot: igAutopilotRouter,
  igDmAutoResponder: igDmAutoResponderRouter,
  emailSequence: emailSequenceRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Stripe checkout
  checkout: router({
    createSession: publicProcedure
      .input(z.object({
        productKey: productKeySchema,
        origin: z.string().url(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createCheckoutSession({
          productKey: input.productKey,
          origin: input.origin,
          customerEmail: ctx.user?.email || undefined,
          metadata: ctx.user ? { userId: String(ctx.user.id) } : undefined,
        });
        return result;
      }),

    // Order bump: create a checkout with multiple products (base + optional bumps)
    createBundleSession: publicProcedure
      .input(z.object({
        productKeys: z.array(productKeySchema).min(1),
        origin: z.string().url(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await createBundleCheckoutSession({
          productKeys: input.productKeys,
          origin: input.origin,
          customerEmail: ctx.user?.email || undefined,
          metadata: ctx.user ? { userId: String(ctx.user.id) } : undefined,
        });
        return result;
      }),
  }),

  // Returning customer check — detect prior purchases by email
  customers: router({
    checkReturning: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        const existingOrders = await getOrdersByEmail(input.email);
        const hasPurchased = existingOrders.some(o => o.status === "completed");
        const purchasedProducts = existingOrders
          .filter(o => o.status === "completed")
          .map(o => o.productKey);
        return {
          isReturning: hasPurchased,
          purchasedProducts,
          orderCount: existingOrders.length,
        };
      }),
  }),

  // Lead capture — email collected via chatbot or opt-in forms
  leads: router({
    capture: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string().default("chatbot"),
        abVariant: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveLead({
          email: input.email,
          source: input.source,
          abVariant: input.abVariant,
        });
        return { success: true };
      }),
  }),

  // Chat insights — AI-extracted key info from conversations
  chatInsights: router({
    save: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        email: z.string().email().optional(),
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Use LLM to extract key info from the conversation
        const extractPrompt = `Analyze this chatbot conversation and extract key information. Return JSON only.

Conversation:
${input.messages.map(m => `${m.role}: ${m.content}`).join("\n")}

Extract:
- sleepIssue: main sleep problem mentioned (e.g. "can't fall asleep", "wakes up at night", "racing mind", "early waking", "general insomnia", or null)
- objection: main reason they haven't bought yet (e.g. "price", "skeptical", "tried before", "not sure it works", or null)
- intentLevel: purchase intent level ("low", "medium", or "high" based on their interest)
- tags: comma-separated keywords from their messages`;

        try {
          const result = await invokeLLM({
            messages: [{ role: "user", content: extractPrompt }],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "chat_insight",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    sleepIssue: { type: ["string", "null"] },
                    objection: { type: ["string", "null"] },
                    intentLevel: { type: "string", enum: ["low", "medium", "high"] },
                    tags: { type: ["string", "null"] },
                  },
                  required: ["sleepIssue", "objection", "intentLevel", "tags"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = result.choices[0]?.message?.content;
          const parsed = typeof content === "string" ? JSON.parse(content) : {};

          await saveChatInsight({
            sessionId: input.sessionId,
            email: input.email,
            sleepIssue: parsed.sleepIssue || null,
            objection: parsed.objection || null,
            intentLevel: parsed.intentLevel || "low",
            tags: parsed.tags || null,
          });
        } catch (err) {
          console.error("[ChatInsights] Failed to extract insights:", err);
        }

        return { success: true };
      }),
  }),

  // Chat surveys — satisfaction feedback at end of conversation
  chatSurveys: router({
    submit: publicProcedure
      .input(z.object({
        sessionId: z.string(),
        email: z.string().email().optional(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        await saveChatSurvey({
          sessionId: input.sessionId,
          email: input.email,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true };
      }),
  }),

  // Admin analytics — owner-only access
  admin: router({
    stats: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getAdminStats();
      }),

    funnel: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getFunnelStats();
      }),

    orders: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).optional())
      .query(async ({ input }) => {
        return getRecentOrders(input?.limit ?? 50);
      }),

    leads: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .input(z.object({ limit: z.number().int().min(1).max(200).default(100) }).optional())
      .query(async ({ input }) => {
        return getRecentLeads(input?.limit ?? 100);
      }),

    chatInsights: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getRecentChatInsights(100);
      }),

    chatSurveys: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getRecentChatSurveys(100);
      }),

    dailyRevenue: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getDailyRevenue();
      }),
  }),

  // AI Sales Chatbot
  chat: router({
    send: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })),
        scrollPercent: z.number().min(0).max(100).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Lucie, a warm, empathetic sleep expert and sales advisor for the "7-Night Deep Sleep Reset" program. Your personality is inspired by Leila Hormozi — confident, direct, value-focused, but genuinely caring.

PRODUCT INFO:
- The 7-Night Deep Sleep Reset: A structured, interactive 7-day program based on CBT-I (Cognitive Behavioral Therapy for Insomnia) — the gold standard treatment.
- Price: Only $5 (regular $47) — limited time offer
- 30-day money-back guarantee
- Includes: 7 nightly modules, guided audio sessions, printable sleep journal
- Each night has one specific technique: Sleep Pressure Reset, Racing Mind Shutdown, Body Scan Meltdown, 4-7-8 Breathing, Light & Dark Protocol, Stimulus Control, Sleep Confidence Lock-In

YOUR GOALS:
1. Empathize with the visitor's sleep struggles
2. Educate them about WHY they can't sleep (anxiety, broken sleep pressure, wrong habits)
3. Position the $5 program as the obvious, risk-free solution
4. Overcome objections naturally (it's only $5, money-back guarantee, science-backed)
5. Guide them to purchase when they're ready

RULES:
- Be conversational, warm, and human — NOT robotic or salesy
- Use short paragraphs, max 2-3 sentences each
- Ask questions to understand their specific sleep issues
- Share relevant tips from the program to build trust
- When they seem interested, suggest they try it for just $5
- Never be pushy — if they say no, respect it and offer a free tip instead
- Keep responses under 150 words
- Write in English`;

        const llmMessages = [
          { role: "system" as const, content: systemPrompt },
          ...input.messages.map(m => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ];

        const result = await invokeLLM({ messages: llmMessages });
        const reply = typeof result.choices[0]?.message?.content === "string"
          ? result.choices[0].message.content
          : "";

        return { reply };
      }),
  }),
});

export type AppRouter = typeof appRouter;
