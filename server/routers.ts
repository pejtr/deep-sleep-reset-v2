import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

const PETRA_SYSTEM_PROMPT = `You are Petra, a friendly and empathetic AI sleep coach for Deep Sleep Reset.
Your personality: warm, knowledgeable, encouraging. You speak in a conversational, supportive tone.
Your expertise: sleep science, chronotypes (Lion/Bear/Wolf/Dolphin), sleep hygiene, insomnia, circadian rhythms.

Your goals:
1. Help users understand their sleep problems
2. Give practical, actionable sleep tips
3. Gently guide them toward the 7-Night Deep Sleep Reset program ($1)
4. Answer questions about the quiz, chronotypes, and sleep science

Key product info:
- The 7-Night Deep Sleep Reset is a personalized PDF guide for $1
- It's based on the user's chronotype (Lion, Bear, Wolf, or Dolphin)
- The quiz takes 60 seconds and reveals their chronotype
- Over 12,000 satisfied users

Rules:
- Keep responses concise (2-4 sentences max unless asked for more)
- Always be supportive, never pushy
- If asked about price, mention the $1 offer
- Suggest taking the free quiz if they haven't yet
- Don't make medical claims or diagnose conditions
- Respond in the same language the user writes in (English or Czech)`;

// Product catalog for Stripe checkout
const PRODUCTS: Record<string, { name: string; priceUsd: number; description: string }> = {
  frontEnd: { name: "7-Night Deep Sleep Reset", priceUsd: 100, description: "Personalized 7-night sleep protocol for your chronotype" },
  exitDiscount: { name: "7-Night Deep Sleep Reset (Exit Offer)", priceUsd: 97, description: "Special exit offer — personalized 7-night sleep protocol" },
  oto1: { name: "30-Day Sleep Transformation", priceUsd: 700, description: "Complete month-long system for permanent sleep change" },
  upsell1: { name: "30-Day Sleep Transformation", priceUsd: 700, description: "Complete month-long system for permanent sleep change" },
  oto2: { name: "Chronotype Audio Mastery Pack", priceUsd: 1700, description: "4 audio sessions designed for your chronotype" },
  upsell2: { name: "Chronotype Audio Mastery Pack", priceUsd: 1700, description: "4 audio sessions designed for your chronotype" },
  oto3: { name: "Complete Sleep Transformation Toolkit", priceUsd: 2700, description: "Everything you need for perfect sleep in one place" },
};

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
        productKey: z.string(),
        origin: z.string().url(),
        chronotype: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = PRODUCTS[input.productKey];
        if (!product) throw new Error(`Unknown product: ${input.productKey}`);

        // Dynamic import to allow mocking in tests
        const { getStripe } = await import("./_core/stripeHelper.js");
        const stripe = getStripe();

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: { name: product.name, description: product.description },
              unit_amount: product.priceUsd,
            },
            quantity: 1,
          }],
          success_url: `${input.origin}/upsell/1?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/order`,
          customer_email: ctx.user?.email ?? undefined,
        });

        return { url: session.url ?? "", sessionId: session.id };
      }),
  }),

  // AI Chat (Petra)
  chat: router({
    send: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20),
        scrollPercent: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: PETRA_SYSTEM_PROMPT },
            ...input.messages,
          ],
        });
        const reply = response.choices?.[0]?.message?.content ?? "I'm having trouble connecting right now. Please try again.";
        return { reply: String(reply) };
      }),
  }),

  // Petra Chatbot (frontend widget)
  chatbot: router({
    sendMessage: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20),
        userMessage: z.string().max(500),
      }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: PETRA_SYSTEM_PROMPT },
            ...input.messages,
            { role: "user", content: input.userMessage },
          ],
        });
        const reply = response.choices?.[0]?.message?.content ?? "I'm having trouble connecting right now. Please try again.";
        return { reply: String(reply) };
      }),
  }),

  // Admin procedures
  admin: router({
    leadSources: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("FORBIDDEN");
        return [];
      }),
  }),

  // Lead capture
  leads: router({
    capture: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string(),
        abVariant: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        // Store lead (graceful failure if DB unavailable)
        try {
          const { db } = await import("./db.js" as string);
          await db.insertLead?.({ email: input.email, source: input.source });
        } catch {
          // Graceful degradation
        }
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
