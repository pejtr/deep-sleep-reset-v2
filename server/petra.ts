import type { Express, Request, Response } from "express";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { createContext } from "./_core/context";
import { recordFunnelEvent, userHasPremiumAccess } from "./db";

const requestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string().min(1),
    }),
  ).max(20),
});

const PETRA_SYSTEM_PROMPT = `You are Petra, the Gentle Support companion inside DeepSleepReset.
Speak in a calm, warm, premium wellness tone.
You help premium members with sleep routines, mindset, consistency, and encouragement.
Do not give medical diagnosis, emergency advice, or risky health instructions.
If the user describes severe symptoms, self-harm, or a medical emergency, encourage them to contact a qualified clinician or emergency services immediately.
Keep responses practical, soothing, concise, and emotionally supportive.`;

async function handlePetraChat(req: Request, res: Response) {
  const ctx = await createContext({ req, res, info: {} as never });
  if (!ctx.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const hasPremium = await userHasPremiumAccess(ctx.user.id);
  if (!hasPremium) {
    return res.status(403).json({ message: "Petra is available only to DeepSleepReset Premium members." });
  }

  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid Petra request payload." });
  }

  const normalizedMessages = parsed.data.messages.filter((message) => message.role !== "system");
  const messages = [
    { role: "system" as const, content: PETRA_SYSTEM_PROMPT },
    ...normalizedMessages,
  ];

  try {
    const response = await invokeLLM({ messages });
    const content = response.choices[0]?.message?.content ?? "I am here with you. Let us take the next sleep-support step together.";

    await recordFunnelEvent({
      userId: ctx.user.id,
      email: ctx.user.email,
      eventType: "content_view",
      detail: "Petra conversation completed",
    });

    return res.json({ content });
  } catch (error) {
    console.error("[Petra] chat failed", error);
    return res.status(500).json({ message: "Petra is temporarily unavailable." });
  }
}

export function registerPetraRoute(app: Express) {
  app.post("/api/chat/petra", handlePetraChat);
}
