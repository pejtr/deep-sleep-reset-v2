import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";
import { getDb } from "./db.js";
import { chatSessions, chatMessages } from "../drizzle/schema.js";
import { eq, desc, count, sql } from "drizzle-orm";

const PETRA_SYSTEM_PROMPT = `You are Petra, a warm and empathetic AI sleep coach for Deep Sleep Reset (deepsleep.quest).
Personality: warm, science-backed, encouraging, never pushy. Conversational tone.
Expertise: sleep science, chronobiology, all 4 chronotypes, sleep hygiene, insomnia, circadian rhythms, HRV.

=== CHRONOTYPE KNOWLEDGE BASE ===

LION (Early Chronotype ~15% of people):
- Natural wake: 5-6 AM, sleep: 9-10 PM
- Peak performance: 8 AM - 12 PM
- Struggles with: staying up late, social events, evening meetings
- Sleep tip: protect morning routine, avoid blue light after 8 PM, magnesium glycinate before bed
- Famous Lions: Tim Cook, Michelle Obama

BEAR (Intermediate ~55% of people):
- Natural wake: 7-8 AM, sleep: 11 PM
- Peak performance: 10 AM - 2 PM
- Struggles with: Monday mornings, post-lunch slump, inconsistent weekends
- Sleep tip: consistent wake time 7 days/week, 20-min nap before 3 PM, limit caffeine after 2 PM
- Most common type — follows solar cycle

WOLF (Late Chronotype ~20% of people):
- Natural wake: 9-10 AM, sleep: 12-1 AM
- Peak performance: 12 PM - 6 PM, second peak 9-11 PM
- Struggles with: early morning obligations, social jet lag, feeling groggy until noon
- Sleep tip: bright light therapy in morning, melatonin 0.5mg at 10 PM, avoid naps
- Famous Wolves: Barack Obama, Charles Darwin

DOLPHIN (Light sleeper ~10% of people):
- Natural wake: 6-7 AM but often wakes at 3-4 AM
- Peak performance: 10 AM - 12 PM
- Struggles with: falling asleep, staying asleep, racing thoughts, light sensitivity
- Sleep tip: white noise, cooler room (65-67°F), CBT-I techniques, no screens 2h before bed
- Most likely to have insomnia

=== SLEEP PROTOCOLS ===
7-Night Deep Sleep Reset: Personalized PDF guide ($1) based on chronotype. Night 1-3: sleep pressure reset. Night 4-5: circadian anchor. Night 6-7: optimization. Includes exact bedtime, wake time, meal timing, light exposure schedule.

=== YOUR GOALS ===
1. Identify the user's likely chronotype from their description (ask 1-2 targeted questions)
2. Give 1-2 specific, actionable sleep tips for their chronotype
3. After 3+ messages, gently suggest the free 60-second quiz at /quiz
4. After 5+ messages or if they mention buying, mention the $1 guide
5. Proactively link to relevant blog articles when relevant

=== LINK SUGGESTIONS (use as plain text, frontend will make them clickable) ===
- Quiz: [LINK:/quiz] — 60-second chronotype quiz
- Guide: [LINK:/order] — $1 personalized 7-night protocol
- Blog: [LINK:/blog/what-is-your-chronotype] — What is a chronotype?
- Blog: [LINK:/blog/deep-sleep-stages] — Deep sleep stages explained
- Blog: [LINK:/blog/natural-sleep-remedies] — Natural sleep remedies

=== RULES ===
- Keep responses concise (2-4 sentences max unless asked for more)
- Always be supportive, never pushy or salesy
- If asked about price, mention the $1 offer
- Don't make medical claims or diagnose conditions
- Respond in the SAME LANGUAGE the user writes in (English or Czech)
- If user seems frustrated or hopeless, validate their feelings first
- Never repeat the same tip twice in a conversation
- If user mentions they already bought the guide, congratulate them and offer implementation tips`;

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

  // Petra Chatbot (frontend widget) — full persistence + chronotype detection + lead capture
  chatbot: router({
    sendMessage: publicProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).max(20),
        userMessage: z.string().max(500),
        sessionId: z.string().max(128).optional(),
        source: z.string().max(50).optional(),
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
        const replyStr = String(reply);

        // Detect chronotype mention in user message or AI reply
        const chronotypeMap: Record<string, "lion" | "bear" | "wolf" | "dolphin"> = {
          lion: "lion", bear: "bear", wolf: "wolf", dolphin: "dolphin",
        };
        const combined = (input.userMessage + " " + replyStr).toLowerCase();
        let detectedChronotype: "lion" | "bear" | "wolf" | "dolphin" | undefined;
        for (const [key, val] of Object.entries(chronotypeMap)) {
          if (combined.includes(key)) { detectedChronotype = val; break; }
        }

        // Detect CTA link in reply
        const ctaShown = replyStr.includes("[LINK:");

        // Persist to DB (graceful degradation)
        if (input.sessionId) {
          try {
            const db = await getDb();
            if (db) {
              // Upsert chat session
              const existing = await db.select({ id: chatSessions.id, messageCount: chatSessions.messageCount })
                .from(chatSessions).where(eq(chatSessions.sessionId, input.sessionId)).limit(1);
              const msgCount = (input.messages.length + 2); // existing + new user + new assistant
              if (existing.length === 0) {
                await db.insert(chatSessions).values({
                  sessionId: input.sessionId,
                  chronotype: detectedChronotype ?? null,
                  messageCount: msgCount,
                  source: input.source ?? "organic",
                });
              } else {
                await db.update(chatSessions)
                  .set({
                    messageCount: msgCount,
                    ...(detectedChronotype ? { chronotype: detectedChronotype } : {}),
                  })
                  .where(eq(chatSessions.sessionId, input.sessionId));
              }
              // Save user message
              await db.insert(chatMessages).values({
                sessionId: input.sessionId,
                role: "user",
                content: input.userMessage,
                detectedChronotype: detectedChronotype ?? null,
                ctaShown: false,
              });
              // Save assistant reply
              await db.insert(chatMessages).values({
                sessionId: input.sessionId,
                role: "assistant",
                content: replyStr,
                detectedChronotype: detectedChronotype ?? null,
                ctaShown,
              });
            }
          } catch (e) {
            console.warn("[Chatbot] DB persist failed:", e);
          }
        }

        return { reply: replyStr, detectedChronotype: detectedChronotype ?? null, ctaShown };
      }),

    // Capture email from chat widget
    captureEmail: publicProcedure
      .input(z.object({
        email: z.string().email(),
        sessionId: z.string().max(128),
        chronotype: z.enum(["lion", "bear", "wolf", "dolphin"]).optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (db) {
            await db.update(chatSessions)
              .set({ email: input.email, ...(input.chronotype ? { chronotype: input.chronotype } : {}) })
              .where(eq(chatSessions.sessionId, input.sessionId));
          }
        } catch (e) {
          console.warn("[Chatbot] Email capture failed:", e);
        }
        return { success: true };
      }),

    // Mark session as converted (user clicked CTA)
    markConverted: publicProcedure
      .input(z.object({ sessionId: z.string().max(128) }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (db) {
            await db.update(chatSessions)
              .set({ converted: true })
              .where(eq(chatSessions.sessionId, input.sessionId));
          }
        } catch { /* graceful */ }
        return { success: true };
      }),

    // Admin: chat analytics
    getAnalytics: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("FORBIDDEN");
        try {
          const db = await getDb();
          if (!db) return { totalSessions: 0, totalMessages: 0, conversions: 0, conversionRate: 0, topChronotypes: [], recentSessions: [] };

          const [sessionsCount] = await db.select({ count: count() }).from(chatSessions);
          const [messagesCount] = await db.select({ count: count() }).from(chatMessages);
          const [conversionsCount] = await db.select({ count: count() }).from(chatSessions)
            .where(eq(chatSessions.converted, true));

          const chronotypeCounts = await db.select({
            chronotype: chatSessions.chronotype,
            count: count(),
          }).from(chatSessions)
            .where(sql`${chatSessions.chronotype} IS NOT NULL`)
            .groupBy(chatSessions.chronotype);

          const recentSessions = await db.select()
            .from(chatSessions)
            .orderBy(desc(chatSessions.createdAt))
            .limit(20);

          const total = sessionsCount.count || 1;
          return {
            totalSessions: sessionsCount.count,
            totalMessages: messagesCount.count,
            conversions: conversionsCount.count,
            conversionRate: Math.round((conversionsCount.count / total) * 100),
            topChronotypes: chronotypeCounts,
            recentSessions,
          };
        } catch (e) {
          console.warn("[Chatbot] Analytics failed:", e);
          return { totalSessions: 0, totalMessages: 0, conversions: 0, conversionRate: 0, topChronotypes: [], recentSessions: [] };
        }
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
