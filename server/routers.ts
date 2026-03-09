import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCheckoutSession, createBundleCheckoutSession, PRODUCTS, type ProductKey } from "./stripe";
import { invokeLLM } from "./_core/llm";

const productKeySchema = z.enum(["frontEnd", "exitDiscount", "upsell1", "upsell2"]);

export const appRouter = router({
  system: systemRouter,
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
