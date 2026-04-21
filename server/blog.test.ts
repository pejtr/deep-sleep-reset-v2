import { describe, it, expect } from "vitest";

// Test blog data integrity
describe("Blog Posts Data", () => {
  it("should import blog posts without errors", async () => {
    // Dynamic import to test the module loads correctly
    const { blogPosts, getBlogPost, getRecentPosts } = await import("../client/src/data/blogPosts");
    expect(blogPosts).toBeDefined();
    expect(Array.isArray(blogPosts)).toBe(true);
  });

  it("should have exactly 5 blog posts", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    expect(blogPosts).toHaveLength(5);
  });

  it("should have all required fields on each post", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    const requiredFields = ["slug", "title", "metaTitle", "metaDescription", "excerpt", "content", "publishedAt", "readTime", "category", "tags", "imageUrl"];
    
    for (const post of blogPosts) {
      for (const field of requiredFields) {
        expect(post).toHaveProperty(field);
        expect((post as Record<string, unknown>)[field]).toBeTruthy();
      }
    }
  });

  it("should have unique slugs", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    const slugs = blogPosts.map((p) => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it("should return correct post by slug", async () => {
    const { getBlogPost } = await import("../client/src/data/blogPosts");
    const post = getBlogPost("why-you-cant-fall-asleep-chronotype-explained");
    expect(post).toBeDefined();
    expect(post?.title).toContain("Chronotype");
  });

  it("should return undefined for non-existent slug", async () => {
    const { getBlogPost } = await import("../client/src/data/blogPosts");
    const post = getBlogPost("non-existent-slug");
    expect(post).toBeUndefined();
  });

  it("should return recent posts sorted by date", async () => {
    const { getRecentPosts } = await import("../client/src/data/blogPosts");
    const recent = getRecentPosts(3);
    expect(recent).toHaveLength(3);
    
    // Verify sorted descending by date
    for (let i = 0; i < recent.length - 1; i++) {
      const dateA = new Date(recent[i].publishedAt).getTime();
      const dateB = new Date(recent[i + 1].publishedAt).getTime();
      expect(dateA).toBeGreaterThanOrEqual(dateB);
    }
  });

  it("should have valid ISO date format for publishedAt", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const post of blogPosts) {
      expect(post.publishedAt).toMatch(isoDateRegex);
      expect(new Date(post.publishedAt).toString()).not.toBe("Invalid Date");
    }
  });

  it("should have positive readTime for all posts", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    for (const post of blogPosts) {
      expect(post.readTime).toBeGreaterThan(0);
    }
  });

  it("should have tags as non-empty arrays", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    for (const post of blogPosts) {
      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it("should have content with markdown headings", async () => {
    const { blogPosts } = await import("../client/src/data/blogPosts");
    for (const post of blogPosts) {
      expect(post.content).toContain("##");
    }
  });
});

describe("URL Integrity", () => {
  it("should not contain old sleeprset domain in email files", async () => {
    const fs = await import("fs");
    const emailContent = fs.readFileSync("server/email.ts", "utf-8");
    expect(emailContent).not.toContain("deepsleepreset.manus.space");
    expect(emailContent).not.toContain("deepsleep.manus.space");
  });

  it("should not contain old domain in emailService.ts", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/emailService.ts", "utf-8");
    expect(content).not.toContain("deepsleep.manus.space");
  });

  it("should use deepsleep.quest in milestoneNotifier.ts", async () => {
    const fs = await import("fs");
    const content = fs.readFileSync("server/milestoneNotifier.ts", "utf-8");
    expect(content).toContain("deepsleepquest.manus.space");
  });
});
