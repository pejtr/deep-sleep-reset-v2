import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { createCheckoutSession, createBundleCheckoutSession, PRODUCTS, type ProductKey } from "./stripe/index";
import { invokeLLM } from "./_core/llm";
import { saveLead, saveChatInsight, saveChatSurvey, getOrdersByEmail, getAdminStats, getFunnelStats, getRecentOrders, getRecentLeads, getRecentChatInsights, getRecentChatSurveys, getDailyRevenue, getLeadSourceStats, saveAbEvent, getAbStats, saveQuizAttempt, getQuizHistory, updateQuizAttemptNote, submitTestimonialMedia, getApprovedTestimonialMedia, getPendingTestimonialMedia, moderateTestimonialMedia, recordAbandonedCheckout, getAbandonedCheckoutStats, markAbandonedCheckoutRecovered, getEmailAbStats } from "./db";
import { igAutopilotRouter } from "./routers/igAutopilot";
import { igDmAutoResponderRouter } from "./routers/igDmAutoResponder";
import { emailSequenceRouter } from "./routers/emailSequence";
import { testimonialsRouter } from "./routers/testimonials";
import { blogRouter } from "./routers/blog";
import { lunaTrackerRouter } from "./routers/lunaTracker";
import { fireMetaLead, fireMetaInitiateCheckout } from "./meta-capi";

const productKeySchema = z.enum(["frontEnd", "frontEnd7", "exitDiscount", "upsell1", "upsell2", "upsell3", "chronotypeReport"]);

export const appRouter = router({
  system: systemRouter,
  igAutopilot: igAutopilotRouter,
  igDmAutoResponder: igDmAutoResponderRouter,
  emailSequence: emailSequenceRouter,
  testimonials: testimonialsRouter,
  blog: blogRouter,
  luna: lunaTrackerRouter,
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
        // Fire Meta CAPI InitiateCheckout event
        const totalCents = input.productKeys.reduce((sum, key) => sum + (PRODUCTS[key]?.priceInCents ?? 0), 0);
        fireMetaInitiateCheckout({
          email: ctx.user?.email || undefined,
          value: totalCents / 100,
          productName: input.productKeys.join("+"),
        }).catch((err) => console.warn("[Checkout] Meta CAPI InitiateCheckout failed:", err));
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
        // Fire Meta CAPI Lead event
        fireMetaLead({ email: input.email, source: input.source }).catch(
          (err) => console.warn("[Leads] Meta CAPI Lead failed:", err)
        );
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

    leadSources: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getLeadSourceStats();
      }),

    emailAbStats: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getEmailAbStats();
      }),
  }),

  // A/B Hook Variant Tracking
  ab: router({
    trackEvent: publicProcedure
      .input(z.object({
        variant: z.enum(["quiz", "chatbot", "social", "btn_amber", "btn_green", "btn_blue", "price_5", "price_7", "cta_a", "cta_b", "cta_c"]),
        eventType: z.enum(["impression", "conversion"]),
        sessionId: z.string().max(64),
        email: z.string().email().optional(),
        metadata: z.string().max(64).optional(), // e.g. chatbot script variant or button color
      }))
      .mutation(async ({ input }) => {
        await saveAbEvent({
          variant: input.variant,
          eventType: input.eventType,
          sessionId: input.sessionId,
          email: input.email,
          metadata: input.metadata,
        });
        return { success: true };
      }),

    getStats: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getAbStats();
      }),

    /**
     * Returns the winning CTA variant if any variant has reached 200 impressions.
     * The winner is the variant with the highest conversion rate (CVR).
     * Returns null if no variant has reached the threshold yet.
     */
    getCTAWinner: publicProcedure.query(async () => {
      const stats = await getAbStats();
      const ctaStats = stats.filter(s =>
        s.variant === "cta_a" || s.variant === "cta_b" || s.variant === "cta_c"
      );

      const AUTO_LOCK_THRESHOLD = 200;
      const hasEnoughData = ctaStats.some(s => s.impressions >= AUTO_LOCK_THRESHOLD);

      if (!hasEnoughData) return { winner: null, stats: ctaStats, threshold: AUTO_LOCK_THRESHOLD };

      // Find the variant with the highest CVR
      const winner = ctaStats.reduce((best, current) => {
        const bestCvr = parseFloat(best.cvr);
        const currentCvr = parseFloat(current.cvr);
        return currentCvr > bestCvr ? current : best;
      });

      return { winner: winner.variant, stats: ctaStats, threshold: AUTO_LOCK_THRESHOLD };
    }),
  }),

  // Quiz score history
  quiz: router({
    saveAttempt: publicProcedure
      .input(z.object({
        sessionId: z.string().max(64),
        score: z.number().int().min(0).max(100),
        label: z.string().max(32),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        await saveQuizAttempt({
          sessionId: input.sessionId,
          score: input.score,
          label: input.label,
          email: input.email,
        });
        return { success: true };
      }),

    getHistory: publicProcedure
      .input(z.object({ sessionId: z.string().max(64) }))
      .query(async ({ input }) => {
        return getQuizHistory(input.sessionId);
      }),

    updateNote: publicProcedure
      .input(z.object({
        id: z.number().int().positive(),
        sessionId: z.string().max(64), // ownership check
        note: z.string().max(280),
      }))
      .mutation(async ({ input }) => {
        await updateQuizAttemptNote(input.id, input.sessionId, input.note);
        return { success: true };
      }),
  }),

  // Testimonial media (user-submitted photos/videos for Social Proof Wall)
  testimonialMedia: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(128),
        quote: z.string().min(10).max(500),
        rating: z.number().int().min(1).max(5).default(5),
        mediaUrl: z.string().url().optional(),
        mediaType: z.enum(["image", "video"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const id = await submitTestimonialMedia({
          name: input.name,
          quote: input.quote,
          rating: input.rating,
          mediaUrl: input.mediaUrl,
          mediaType: input.mediaType,
        });
        return { success: true, id };
      }),

    listApproved: publicProcedure
      .query(async () => {
        return getApprovedTestimonialMedia(20);
      }),

    listPending: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .query(async () => {
        return getPendingTestimonialMedia();
      }),

    moderate: protectedProcedure
      .use(({ ctx, next }) => {
        if (ctx.user.role !== 'admin') throw new Error('Forbidden');
        return next({ ctx });
      })
      .input(z.object({
        id: z.number().int().positive(),
        status: z.enum(["approved", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await moderateTestimonialMedia(input.id, input.status);
        return { success: true };
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
        persona: z.enum(["lucy", "petra"]).optional().default("lucy"),
      }))
      .mutation(async ({ input }) => {
        const isLucy = (input.persona ?? "lucy") === "lucy";
        const systemPrompt = isLucy
          ? `You are Lucy, a warm, empathetic sleep expert and sales advisor for the "7-Night Deep Sleep Reset" program. Your personality is inspired by Leila Hormozi — confident, direct, value-focused, but genuinely caring.`
          : `You are Petra, a bold, direct, no-nonsense sleep expert and sales advisor for the "7-Night Deep Sleep Reset" program. Your personality is sharp, confident, and slightly provocative — you challenge people's excuses and cut through the BS. You're like a tough-love coach who genuinely wants results for people. You don't sugarcoat things, but you're never mean — just refreshingly honest. You say things like "Let's be real..." and "Here's the truth nobody tells you..."`;
        const systemPromptFull = (isLucy ? systemPrompt : systemPrompt) + `

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
- Be conversational and human — NOT robotic or salesy
- Use short paragraphs, max 2-3 sentences each
- Ask questions to understand their specific sleep issues
- Share relevant tips from the program to build trust
- When they seem interested, suggest they try it for just $5
- Never be pushy — if they say no, respect it and offer a free tip instead
- Keep responses under 150 words
- Write in English`;

        const llmMessages = [
          { role: "system" as const, content: systemPromptFull },
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

  // Abandoned checkout recovery
  abandonedCheckout: router({
    /** Called when a visitor enters their email on the order page but hasn't paid yet */
    record: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        productKey: z.string().default("frontEnd"),
      }))
      .mutation(async ({ input }) => {
        await recordAbandonedCheckout(input.email, input.name, input.productKey);
        return { ok: true };
      }),

    /** Called by Stripe webhook when purchase completes — marks as recovered */
    markRecovered: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        await markAbandonedCheckoutRecovered(input.email);
        return { ok: true };
      }),

    /** Admin: get abandoned checkout stats */
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") throw new Error("Forbidden");
        return getAbandonedCheckoutStats();
      }),
  }),

  // ─── Sleep Chronotype Quiz ────────────────────────────────────────────────────
  chronotype: router({
    /** Submit quiz answers and get AI-generated personalised sleep plan */
    submit: publicProcedure
      .input(z.object({
        sessionId: z.string().max(128),
        email: z.string().email().optional(),
        answers: z.array(z.object({
          questionId: z.string(),
          value: z.number().min(0).max(3),
        })).min(8).max(8),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("DB unavailable");
        const { chronotypeResults } = await import("../drizzle/schema");

        // Score calculation: each answer maps to a chronotype
        // Questions 0-7 map to: lion, bear, wolf, dolphin
        // Each answer value 0-3 maps to chronotype weight
        const scores = { lion: 0, bear: 0, wolf: 0, dolphin: 0 };
        const questionMap: Array<keyof typeof scores> = [
          "lion",    // Q1: Wake up time preference
          "bear",    // Q2: Energy peak time
          "wolf",    // Q3: Bedtime preference
          "dolphin", // Q4: Sleep quality
          "lion",    // Q5: Morning alertness
          "wolf",    // Q6: Night creativity
          "bear",    // Q7: Social energy timing
          "dolphin", // Q8: Anxiety/rumination at night
        ];

        input.answers.forEach((a, i) => {
          const type = questionMap[i];
          scores[type] += a.value;
        });

        // Determine dominant chronotype
        const chronotype = (Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0]) as keyof typeof scores;

        // Sleep windows per chronotype
        const sleepWindows: Record<string, string> = {
          lion: "21:30 – 05:30",
          bear: "23:00 – 07:00",
          wolf: "00:30 – 08:30",
          dolphin: "23:30 – 06:30",
        };

        // Generate personalised plan via LLM
        const chronotypeDescriptions: Record<string, string> = {
          lion: "Lion (early riser, peak energy 8-12 AM, natural leader, disciplined)",
          bear: "Bear (solar schedule, peak energy 10 AM-2 PM, social, consistent)",
          wolf: "Wolf (night owl, peak energy 6-10 PM, creative, impulsive)",
          dolphin: "Dolphin (light sleeper, anxious, peak energy 3-9 PM, intelligent, detail-oriented)",
        };

        let personalPlan: string | null = null;
        try {
          const llmResponse = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are a sleep science expert specializing in chronobiology. Create a concise, actionable personalised sleep plan. Use markdown formatting. Be warm, encouraging and specific. Focus on practical tips the person can implement tonight.`,
              },
              {
                role: "user",
                content: `My sleep chronotype is: ${chronotypeDescriptions[chronotype]}\n\nScores: Lion=${scores.lion}, Bear=${scores.bear}, Wolf=${scores.wolf}, Dolphin=${scores.dolphin}\n\nCreate a personalised 7-night sleep optimisation plan for my chronotype. Include:\n1. My ideal sleep window (${sleepWindows[chronotype]})\n2. 3 specific evening rituals for my type\n3. 2 morning habits to reinforce my natural rhythm\n4. 1 thing I should AVOID that most people with my chronotype do wrong\n5. A motivating closing message\n\nKeep it under 400 words. Use emoji sparingly.`,
              },
            ],
          });
          const rawContent = llmResponse.choices?.[0]?.message?.content;
          personalPlan = typeof rawContent === "string" ? rawContent : null;
        } catch (err) {
          console.warn("[Chronotype] LLM plan generation failed:", err);
        }

        // Save to DB
        await db.insert(chronotypeResults).values({
          sessionId: input.sessionId,
          email: input.email ?? null,
          chronotype,
          scoreData: JSON.stringify(scores),
          personalPlan,
          sleepWindow: sleepWindows[chronotype],
        });

        return {
          chronotype,
          scores,
          sleepWindow: sleepWindows[chronotype],
          personalPlan,
        };
      }),

    /** Get result by sessionId */
    getResult: publicProcedure
      .input(z.object({ sessionId: z.string().max(128) }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return null;
        const { chronotypeResults } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const [result] = await db
          .select()
          .from(chronotypeResults)
          .where(eq(chronotypeResults.sessionId, input.sessionId))
          .orderBy(chronotypeResults.createdAt)
          .limit(1);
        return result ?? null;
      }),
  }),
});

export type AppRouter = typeof appRouter;
