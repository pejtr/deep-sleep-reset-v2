import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { blogPosts } from "../../drizzle/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { TRPCError } from "@trpc/server";

// ─── helpers ────────────────────────────────────────────────────────────────

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });
  return db;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ─── AI article generator ────────────────────────────────────────────────────

async function generateArticle(topic: {
  title: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  category: string;
}) {
  const prompt = `You are an expert sleep health writer. Write a comprehensive, SEO-optimized blog article for the website "Deep Sleep Reset" (deep-sleep-reset.com) which sells a $5 CBT-I based 7-night sleep protocol.

Article brief:
- Title: ${topic.title}
- Focus keyword: "${topic.focusKeyword}" (use naturally 8-12 times)
- Secondary keywords: ${topic.secondaryKeywords.join(", ")} (use each 2-4 times)
- Category: ${topic.category}
- Target audience: English-speaking adults (25-55) suffering from insomnia, anxiety-related sleep issues, or poor sleep quality
- Tone: Empathetic, science-backed, conversational — like a knowledgeable friend, not a textbook

Requirements:
1. Length: 1200-1800 words
2. Structure: H2 and H3 headings, short paragraphs (2-4 sentences), bullet lists where appropriate
3. Include: 2-3 internal CTAs linking to the product (use markdown link: [The 7-Night Deep Sleep Reset](https://deep-sleep-reset.com))
4. Include: 1 FAQ section at the end with 4-5 questions (H2 "Frequently Asked Questions")
5. Include: Scientific references where appropriate (cite studies naturally in text)
6. First paragraph: Hook that speaks directly to the reader's pain
7. Last paragraph: Strong CTA to try the protocol

Return ONLY the article body in Markdown format (no frontmatter, no title — just the body starting from the first paragraph).`;

  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You are an expert SEO content writer specializing in sleep health and CBT-I therapy." },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

async function generateMetaDescription(title: string, focusKeyword: string, body: string): Promise<string> {
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "You write concise, compelling SEO meta descriptions." },
      {
        role: "user",
        content: `Write a meta description (120-155 characters) for this article.
Title: "${title}"
Focus keyword: "${focusKeyword}"
Article excerpt: "${body.slice(0, 300)}"

Requirements:
- Include the focus keyword naturally
- Include a benefit or emotional hook
- End with a soft CTA if space allows
- EXACTLY 120-155 characters
Return ONLY the meta description text, nothing else.`,
      },
    ],
  });
  const raw = response.choices[0]?.message?.content;
  const str = typeof raw === "string" ? raw : "";
  return str.trim().slice(0, 155);
}

async function extractFaqSchema(body: string): Promise<string> {
  // Extract FAQ section from article body
  const faqMatch = body.match(/##\s*Frequently Asked Questions[\s\S]*$/i);
  if (!faqMatch) return "[]";

  const faqSection = faqMatch[0];
  const response = await invokeLLM({
    messages: [
      { role: "system", content: "Extract FAQ pairs from markdown text and return JSON." },
      {
        role: "user",
        content: `Extract all FAQ question-answer pairs from this markdown section and return a JSON array.
Format: [{"question": "...", "answer": "..."}]
Return ONLY valid JSON, nothing else.

${faqSection}`,
      },
    ],
    response_format: { type: "json_schema", json_schema: { name: "faq_list", strict: true, schema: { type: "object", properties: { faqs: { type: "array", items: { type: "object", properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"], additionalProperties: false } } }, required: ["faqs"], additionalProperties: false } } } as const,
  });

  try {
    const raw = response.choices[0]?.message?.content;
    const rawStr = typeof raw === "string" ? raw : "{}";
    const parsed = JSON.parse(rawStr);
    return JSON.stringify(parsed.faqs || parsed || []);
  } catch {
    return "[]";
  }
}

// ─── router ─────────────────────────────────────────────────────────────────

export const blogRouter = router({
  // Public: list published posts
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().min(1).max(50).default(12),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const conditions = [eq(blogPosts.status, "published")];
      if (input.category) conditions.push(eq(blogPosts.category, input.category));

      const posts = await db
        .select({
          id: blogPosts.id,
          slug: blogPosts.slug,
          title: blogPosts.title,
          metaDescription: blogPosts.metaDescription,
          excerpt: blogPosts.excerpt,
          heroImageUrl: blogPosts.heroImageUrl,
          heroImageAlt: blogPosts.heroImageAlt,
          author: blogPosts.author,
          category: blogPosts.category,
          readTimeMinutes: blogPosts.readTimeMinutes,
          featured: blogPosts.featured,
          focusKeyword: blogPosts.focusKeyword,
          publishedAt: blogPosts.publishedAt,
        })
        .from(blogPosts)
        .where(and(...conditions))
        .orderBy(desc(blogPosts.featured), desc(blogPosts.publishedAt))
        .limit(input.limit)
        .offset(input.offset);

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(blogPosts)
        .where(and(...conditions));

      return { posts, total: Number(count) };
    }),

  // Public: get single post by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await requireDb();
      const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, input.slug), eq(blogPosts.status, "published")))
        .limit(1);

      if (!post) throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      return post;
    }),

  // Public: get all slugs for sitemap
  allSlugs: publicProcedure.query(async () => {
    const db = await requireDb();
    return db
      .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"));
  }),

  // Admin: list all posts (any status)
  adminList: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await requireDb();
    return db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));
  }),

  // Admin: AI-generate a new article
  generate: protectedProcedure
    .input(z.object({
      title: z.string(),
      focusKeyword: z.string(),
      secondaryKeywords: z.array(z.string()).default([]),
      category: z.string().default("sleep-science"),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await requireDb();

      const body = await generateArticle(input);
      const metaDescription = await generateMetaDescription(input.title, input.focusKeyword, body);
      const faqSchema = await extractFaqSchema(body);
      const slug = slugify(input.title);
      const readTimeMinutes = Math.ceil(body.split(/\s+/).length / 200);

      // Excerpt: first 200 chars of body
      const excerpt = body.replace(/^#+.*\n/gm, "").replace(/\*\*/g, "").trim().slice(0, 200) + "...";

      const [result] = await db.insert(blogPosts).values([{
        slug,
        title: input.title,
        metaDescription,
        focusKeyword: input.focusKeyword,
        secondaryKeywords: JSON.stringify(input.secondaryKeywords),
        body,
        excerpt,
        author: "Deep Sleep Reset Team",
        category: input.category,
        readTimeMinutes,
        status: "draft" as const,
        faqSchema,
      }]);

      return { id: (result as any).insertId, slug, title: input.title };
    }),

  // Admin: publish / unpublish / archive
  setStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "published", "archived"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await requireDb();
      await db.update(blogPosts)
        .set({
          status: input.status,
          publishedAt: input.status === "published" ? new Date() : undefined,
        })
        .where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Admin: toggle featured
  setFeatured: protectedProcedure
    .input(z.object({ id: z.number(), featured: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await requireDb();
      await db.update(blogPosts)
        .set({ featured: input.featured ? 1 : 0 })
        .where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Admin: update post fields
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      body: z.string().optional(),
      metaDescription: z.string().optional(),
      heroImageUrl: z.string().optional(),
      heroImageAlt: z.string().optional(),
      excerpt: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await requireDb();
      const { id, ...fields } = input;
      await db.update(blogPosts).set(fields).where(eq(blogPosts.id, id));
      return { success: true };
    }),

  // Admin: delete post
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await requireDb();
      await db.delete(blogPosts).where(eq(blogPosts.id, input.id));
      return { success: true };
    }),

  // Admin: bulk generate 10 articles from predefined topics
  bulkGenerate: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.openId !== process.env.OWNER_OPEN_ID) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const topics = [
      {
        title: "How to Fall Asleep Fast: 12 Science-Backed Techniques",
        focusKeyword: "how to fall asleep fast",
        secondaryKeywords: ["fall asleep quickly", "sleep faster", "insomnia tips", "sleep techniques"],
        category: "insomnia",
      },
      {
        title: "CBT-I: The Gold Standard Insomnia Treatment You Haven't Tried",
        focusKeyword: "CBT-I insomnia treatment",
        secondaryKeywords: ["cognitive behavioral therapy insomnia", "CBT for sleep", "insomnia therapy", "sleep restriction therapy"],
        category: "cbt-i",
      },
      {
        title: "Why You Can't Sleep at Night: 9 Surprising Causes",
        focusKeyword: "can't sleep at night",
        secondaryKeywords: ["insomnia causes", "why can't I sleep", "sleep problems", "sleepless nights"],
        category: "insomnia",
      },
      {
        title: "Sleep Anxiety: How to Stop Racing Thoughts at Bedtime",
        focusKeyword: "sleep anxiety",
        secondaryKeywords: ["anxiety at night", "racing thoughts bedtime", "nighttime anxiety", "anxious before sleep"],
        category: "anxiety",
      },
      {
        title: "The 4-7-8 Breathing Technique for Sleep: Does It Really Work?",
        focusKeyword: "4-7-8 breathing for sleep",
        secondaryKeywords: ["breathing exercises sleep", "deep breathing insomnia", "relaxation breathing", "sleep breathing technique"],
        category: "sleep-science",
      },
      {
        title: "Natural Sleep Remedies That Actually Work (No Melatonin Needed)",
        focusKeyword: "natural sleep remedies",
        secondaryKeywords: ["natural insomnia cure", "sleep without medication", "drug-free sleep", "herbal sleep remedies"],
        category: "lifestyle",
      },
      {
        title: "Sleep Restriction Therapy: The Counterintuitive Fix for Insomnia",
        focusKeyword: "sleep restriction therapy",
        secondaryKeywords: ["sleep consolidation", "sleep efficiency", "insomnia treatment", "CBT-I techniques"],
        category: "cbt-i",
      },
      {
        title: "How Cortisol Destroys Your Sleep (And How to Fix It)",
        focusKeyword: "cortisol and sleep",
        secondaryKeywords: ["stress and sleep", "cortisol insomnia", "stress hormones sleep", "reduce cortisol"],
        category: "sleep-science",
      },
      {
        title: "Waking Up at 3am Every Night? Here's What Your Body Is Telling You",
        focusKeyword: "waking up at 3am",
        secondaryKeywords: ["wake up middle of night", "can't stay asleep", "sleep maintenance insomnia", "3am wake up"],
        category: "insomnia",
      },
      {
        title: "Sleep Hygiene: The Complete Guide to Better Sleep Habits",
        focusKeyword: "sleep hygiene",
        secondaryKeywords: ["good sleep habits", "sleep routine", "bedtime routine", "sleep environment"],
        category: "lifestyle",
      },
    ];

    // Return topics list so admin can generate one by one (avoid timeout)
    return { topics, message: "Use the generate endpoint for each topic individually to avoid timeouts." };
  }),
});
