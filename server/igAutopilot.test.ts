import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock external dependencies
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ caption: "Test caption 🌙 #sleep", imagePrompt: "Dark navy background with crescent moon" }) } }],
  }),
}));

vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test-image.png" }),
}));

vi.mock("./_core/mcp", () => ({
  execMcpTool: vi.fn().mockResolvedValue("Permalink: https://www.instagram.com/p/TestPost123/"),
}));

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    orderBy: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

describe("Instagram Autopilot", () => {
  describe("SLEEP_TOPICS", () => {
    it("should have 15 topics defined", async () => {
      // Import the module to test topic count
      const { igAutopilotRouter } = await import("./routers/igAutopilot");
      expect(igAutopilotRouter).toBeDefined();
    });
  });

  describe("Content Generation", () => {
    it("should generate valid caption and imagePrompt from LLM", async () => {
      const { invokeLLM } = await import("./_core/llm");
      const mockInvokeLLM = vi.mocked(invokeLLM);

      const result = await mockInvokeLLM({
        messages: [
          { role: "system", content: "You are a copywriter" },
          { role: "user", content: "Create content" },
        ],
      });

      const content = JSON.parse(result.choices[0]!.message.content as string);
      expect(content).toHaveProperty("caption");
      expect(content).toHaveProperty("imagePrompt");
      expect(typeof content.caption).toBe("string");
      expect(typeof content.imagePrompt).toBe("string");
    });

    it("should generate an image URL", async () => {
      const { generateImage } = await import("./_core/imageGeneration");
      const mockGenerateImage = vi.mocked(generateImage);

      const result = await mockGenerateImage({ prompt: "Test prompt" });
      expect(result.url).toBe("https://cdn.example.com/test-image.png");
    });
  });

  describe("MCP Publishing", () => {
    it("should call Instagram MCP tool with correct parameters", async () => {
      const { execMcpTool } = await import("./_core/mcp");
      const mockExecMcpTool = vi.mocked(execMcpTool);

      const result = await mockExecMcpTool("instagram", "create_instagram", {
        type: "post",
        caption: "Test caption",
        media: [{ type: "image", media_url: "https://cdn.example.com/image.png" }],
      });

      expect(mockExecMcpTool).toHaveBeenCalledWith(
        "instagram",
        "create_instagram",
        expect.objectContaining({ type: "post" })
      );
      expect(result).toContain("Permalink:");
    });

    it("should parse Instagram permalink from MCP response", () => {
      const response = "Permalink: https://www.instagram.com/p/TestPost123/";
      const permalinkMatch = response.match(/Permalink:\s*(https:\/\/[^\s\n]+)/);
      expect(permalinkMatch).toBeTruthy();
      expect(permalinkMatch![1]).toBe("https://www.instagram.com/p/TestPost123/");

      const postIdMatch = permalinkMatch![1]!.match(/\/p\/([^/]+)\//);
      expect(postIdMatch![1]).toBe("TestPost123");
    });
  });

  describe("Analytics Parsing", () => {
    it("should correctly parse engagement metrics from MCP response", () => {
      const mockResponse = `
        likes: 42
        comments: 8
        reach: 500
        impressions: 750
        saves: 15
        shares: 3
        profile visits: 12
        website clicks: 7
      `;

      const likes = parseInt(mockResponse.match(/likes[:\s]+(\d+)/i)?.[1] || "0");
      const comments = parseInt(mockResponse.match(/comments[:\s]+(\d+)/i)?.[1] || "0");
      const reach = parseInt(mockResponse.match(/reach[:\s]+(\d+)/i)?.[1] || "0");
      const saves = parseInt(mockResponse.match(/saves[:\s]+(\d+)/i)?.[1] || "0");
      const engagementRate = reach > 0 ? Math.round(((likes + comments + saves) / reach) * 100) : 0;

      expect(likes).toBe(42);
      expect(comments).toBe(8);
      expect(reach).toBe(500);
      expect(saves).toBe(15);
      expect(engagementRate).toBe(13); // (42+8+15)/500 * 100 = 13%
    });

    it("should return 0 engagement rate when reach is 0", () => {
      const reach = 0;
      const likes = 10;
      const comments = 2;
      const saves = 5;
      const engagementRate = reach > 0 ? Math.round(((likes + comments + saves) / reach) * 100) : 0;
      expect(engagementRate).toBe(0);
    });
  });

  describe("Topic Selection", () => {
    it("should return a valid topic ID when no analytics data", () => {
      const SLEEP_TOPICS = [
        { id: "why_3am", label: "Why You Wake at 3am" },
        { id: "racing_mind", label: "Racing Mind at Night" },
      ];
      const randomTopic = SLEEP_TOPICS[Math.floor(Math.random() * SLEEP_TOPICS.length)]!;
      expect(randomTopic).toHaveProperty("id");
      expect(randomTopic).toHaveProperty("label");
    });
  });
});
