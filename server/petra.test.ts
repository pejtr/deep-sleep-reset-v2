import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock LLM to avoid real API calls
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "I understand how frustrating insomnia can be. Based on your description, you might be a Wolf chronotype. Have you tried the 7-Night Deep Sleep Reset?",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Petra AI Chatbot", () => {
  describe("chatbot.sendMessage", () => {
    it("returns a reply for a simple sleep question", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chatbot.sendMessage({
        messages: [],
        userMessage: "I can't fall asleep at night",
      });

      expect(result).toHaveProperty("reply");
      expect(typeof result.reply).toBe("string");
      expect(result.reply.length).toBeGreaterThan(0);
    });

    it("handles multi-turn conversation", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chatbot.sendMessage({
        messages: [
          { role: "user", content: "I can't sleep" },
          { role: "assistant", content: "Tell me more about your sleep issues." },
        ],
        userMessage: "I wake up at 3am every night",
      });

      expect(result.reply).toBeTruthy();
      expect(typeof result.reply).toBe("string");
    });

    it("rejects messages that are too long", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.chatbot.sendMessage({
          messages: [],
          userMessage: "a".repeat(501), // exceeds 500 char limit
        })
      ).rejects.toThrow();
    });

    it("rejects too many messages in history", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const tooManyMessages = Array.from({ length: 21 }, (_, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: `Message ${i}`,
      }));

      await expect(
        caller.chatbot.sendMessage({
          messages: tooManyMessages,
          userMessage: "Hello",
        })
      ).rejects.toThrow();
    });

    it("is publicly accessible (no auth required)", async () => {
      const ctx = createPublicContext(); // null user
      const caller = appRouter.createCaller(ctx);

      // Should not throw for unauthenticated users
      const result = await caller.chatbot.sendMessage({
        messages: [],
        userMessage: "What is a chronotype?",
      });

      expect(result.reply).toBeTruthy();
    });
  });

  describe("chat.send (legacy endpoint)", () => {
    it("returns a reply from the AI chatbot", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.send({
        messages: [{ role: "user", content: "I can't sleep at night" }],
      });

      expect(result).toHaveProperty("reply");
      expect(typeof result.reply).toBe("string");
    });

    it("handles scroll percent tracking", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.chat.send({
        messages: [{ role: "user", content: "Help me sleep" }],
        scrollPercent: 75,
      });

      expect(result.reply).toBeTruthy();
    });
  });
});
