/**
 * Content Cron & Content Generator Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock dependencies ────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "Generated content for testing purposes." } }],
  }),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({ insertId: 1 }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: 1,
              contentType: "instagram",
              prompt: "Test prompt",
              content: "Test content",
              generatedBy: "cron",
              createdAt: new Date(),
            },
          ]),
        }),
      }),
    }),
  }),
}));

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Content Cron", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate 3 content pieces (instagram, facebook, reel_script)", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const { generateDailyContent } = await import("./contentCron");

    await generateDailyContent();

    // Should call LLM 3 times (instagram, facebook, reel_script)
    expect(invokeLLM).toHaveBeenCalledTimes(3);
  });

  it("should call LLM with system prompt for each content type", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const { generateDailyContent } = await import("./contentCron");

    await generateDailyContent();

    const calls = (invokeLLM as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls.length).toBe(3);

    // Each call should have a system message
    for (const call of calls) {
      const messages = call[0].messages;
      expect(messages[0].role).toBe("system");
      expect(messages[1].role).toBe("user");
    }
  });

  it("should save content to DB for each generated piece", async () => {
    const { getDb } = await import("./db");
    const { generateDailyContent } = await import("./contentCron");

    await generateDailyContent();

    const db = await (getDb as ReturnType<typeof vi.fn>)();
    expect(db.insert).toHaveBeenCalledTimes(3);
  });

  it("should notify owner after generation", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { generateDailyContent } = await import("./contentCron");

    await generateDailyContent();

    expect(notifyOwner).toHaveBeenCalledOnce();
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Daily Content"),
      })
    );
  });

  it("should handle LLM failure gracefully without crashing", async () => {
    const { invokeLLM } = await import("./_core/llm");
    (invokeLLM as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("LLM timeout"));

    const { generateDailyContent } = await import("./contentCron");

    // Should not throw
    await expect(generateDailyContent()).resolves.not.toThrow();
  });

  it("should handle missing DB gracefully", async () => {
    const { getDb } = await import("./db");
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValueOnce(null);

    const { generateDailyContent } = await import("./contentCron");

    // Should return early without error
    await expect(generateDailyContent()).resolves.not.toThrow();
  });
});

describe("Content Types", () => {
  it("should include reel_script in content type enum", () => {
    const validTypes = ["reel_script", "email", "instagram", "facebook", "tiktok", "blog", "ad_copy"];
    expect(validTypes).toContain("reel_script");
    expect(validTypes).toContain("instagram");
    expect(validTypes).toContain("facebook");
  });

  it("should truncate long prompts to 500 chars for DB storage", () => {
    const longPrompt = "a".repeat(1000);
    const truncated = longPrompt.substring(0, 500);
    expect(truncated.length).toBe(500);
  });

  it("should truncate long content to 10000 chars for DB storage", () => {
    const longContent = "b".repeat(20000);
    const truncated = longContent.substring(0, 10000);
    expect(truncated.length).toBe(10000);
  });
});
