/**
 * Daily Content Cron — runs at 6am every day
 * Generates 3 social media posts (Instagram, Facebook, TikTok Reel script)
 * using Hormozi principles and chronotype personalization.
 * Saves to content_history DB table.
 */

import { getDb } from "./db";
import { contentHistory } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

const DAILY_CONTENT_PROMPTS = [
  {
    type: "instagram" as const,
    prompt: `Create a high-converting Instagram post for Deep Sleep Reset.
Topic: Why your chronotype determines your sleep quality.
Requirements:
- Hook in first line (pattern interrupt)
- 3-5 short paragraphs with line breaks
- Hormozi-style value: specific numbers and results
- CTA: "Take the free chronotype quiz (link in bio)"
- 10-15 relevant hashtags
- Tone: authoritative but relatable
Format: Post text + hashtags`,
  },
  {
    type: "facebook" as const,
    prompt: `Create a Facebook post for Deep Sleep Reset targeting 30-55 year olds who struggle with sleep.
Requirements:
- Storytelling hook (relatable problem)
- Loss aversion: what bad sleep costs them (productivity, health, relationships)
- Social proof: "12,847 people discovered their chronotype this month"
- CTA: "Take the free 60-second quiz"
- Length: 150-200 words
- No hashtags (Facebook organic)`,
  },
  {
    type: "reel_script" as const,
    prompt: `Create a TikTok/Reel script for Deep Sleep Reset (60 seconds).
Format:
[0-3s] HOOK: Shocking statement or question
[3-15s] PROBLEM: Why most sleep advice fails
[15-40s] SOLUTION: Chronotype-based sleep (Lion/Bear/Wolf/Dolphin)
[40-55s] PROOF: Specific result ("fell asleep in 8 min on night 1")
[55-60s] CTA: "Link in bio for free quiz"

Include:
- Text overlays (in brackets)
- Voiceover script
- Background music suggestion
- Timing markers`,
  },
];

export async function generateDailyContent(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.error("[Content Cron] No DB connection");
    return;
  }

  const results: string[] = [];

  for (const item of DAILY_CONTENT_PROMPTS) {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `You are a world-class sleep optimization content creator and direct-response copywriter.
You specialize in creating viral, high-converting content for the Deep Sleep Reset brand.
Always use: Hormozi value stacking, loss aversion, specific numbers, pattern interrupts, and chronotype personalization.`,
          },
          { role: "user", content: item.prompt },
        ],
      });

      const content = response.choices?.[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : JSON.stringify(content);

      if (contentStr) {
        await db.insert(contentHistory).values({
          contentType: item.type,
          prompt: item.prompt.substring(0, 500),
          content: contentStr.substring(0, 10000),
          generatedBy: "cron",
        });
        results.push(`✓ ${item.type}`);
        console.log(`[Content Cron] Generated ${item.type}`);
      }
    } catch (err) {
      console.error(`[Content Cron] Failed to generate ${item.type}:`, err);
      results.push(`✗ ${item.type} (failed)`);
    }
  }

  // Notify owner
  try {
    await notifyOwner({
      title: "📱 Daily Content Generated",
      content: `Your 3 daily posts are ready:\n${results.join("\n")}\n\nCheck the Admin → AI Content tab to review and post.`,
    });
  } catch (err) {
    console.error("[Content Cron] Notification failed:", err);
  }
}
