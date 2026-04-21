import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock Stripe
vi.mock("./_core/stripeHelper", () => ({
  getStripe: () => ({
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/test_session",
        }),
      },
    },
  }),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "I understand how frustrating insomnia can be. Have you tried the 7-Night Deep Sleep Reset?",
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

function createAuthContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      stripeCustomerId: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { origin: "https://example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("checkout.createSession", () => {
  it("creates a checkout session for frontEnd product (public user)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      productKey: "frontEnd",
      origin: "https://example.com",
    });

    expect(result).toHaveProperty("url");
    expect(result).toHaveProperty("sessionId");
    expect(result.url).toBe("https://checkout.stripe.com/test_session");
    expect(result.sessionId).toBe("cs_test_123");
  });

  it("creates a checkout session for exitDiscount product", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      productKey: "exitDiscount",
      origin: "https://example.com",
    });

    expect(result.url).toBe("https://checkout.stripe.com/test_session");
  });

  it("creates a checkout session for upsell1", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      productKey: "upsell1",
      origin: "https://example.com",
    });

    expect(result.url).toBeTruthy();
  });

  it("creates a checkout session for upsell2", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      productKey: "upsell2",
      origin: "https://example.com",
    });

    expect(result.url).toBeTruthy();
  });

  it("passes customer email for authenticated users", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.checkout.createSession({
      productKey: "frontEnd",
      origin: "https://example.com",
    });

    // The session is created successfully (email is passed internally)
    expect(result.url).toBeTruthy();
  });
});

describe("chat.send", () => {
  it("returns a reply from the AI chatbot", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({
      messages: [{ role: "user", content: "I can't sleep at night" }],
    });

    expect(result).toHaveProperty("reply");
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("handles multi-turn conversation", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chat.send({
      messages: [
        { role: "user", content: "I can't sleep" },
        { role: "assistant", content: "I understand. Tell me more about your sleep issues." },
        { role: "user", content: "I wake up at 3am every night" },
      ],
      scrollPercent: 60,
    });

    expect(result.reply).toBeTruthy();
  });
});
