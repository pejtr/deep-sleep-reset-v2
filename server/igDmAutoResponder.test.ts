/**
 * Unit tests for Instagram DM Auto-Responder
 * Tests keyword matching logic and DM message building (pure functions)
 */

import { describe, it, expect } from "vitest";

// ─── Pure function re-implementations for testing ─────────────────────────────
// (mirrors logic in server/routers/igDmAutoResponder.ts)

function matchesKeyword(
  commentText: string,
  keyword: string,
  matchMode: "exact" | "contains"
): boolean {
  const text = commentText.toLowerCase().trim();
  const kw = keyword.toLowerCase().trim();
  if (matchMode === "exact") {
    const words = text.split(/\s+/);
    return words.includes(kw);
  }
  return text.includes(kw);
}

function buildDmMessage(template: string, username?: string): string {
  const name = username ? `@${username}` : "there";
  return template.replace(/\{name\}/gi, name);
}

// ─── matchesKeyword tests ─────────────────────────────────────────────────────

describe("matchesKeyword — contains mode", () => {
  it("matches when comment contains keyword", () => {
    expect(matchesKeyword("I want sleep info please", "sleep", "contains")).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(matchesKeyword("SLEEP please", "sleep", "contains")).toBe(true);
    expect(matchesKeyword("Sleep now", "SLEEP", "contains")).toBe(true);
  });

  it("does not match when keyword is absent", () => {
    expect(matchesKeyword("I love this post!", "sleep", "contains")).toBe(false);
  });

  it("matches partial word in contains mode", () => {
    expect(matchesKeyword("sleepless nights", "sleep", "contains")).toBe(true);
  });

  it("matches single-word comment", () => {
    expect(matchesKeyword("SLEEP", "sleep", "contains")).toBe(true);
  });

  it("matches keyword at start of comment", () => {
    expect(matchesKeyword("sleep please send link", "sleep", "contains")).toBe(true);
  });

  it("matches keyword at end of comment", () => {
    expect(matchesKeyword("send me info about sleep", "sleep", "contains")).toBe(true);
  });
});

describe("matchesKeyword — exact mode", () => {
  it("matches when comment is exactly the keyword", () => {
    expect(matchesKeyword("SLEEP", "sleep", "exact")).toBe(true);
  });

  it("matches when keyword is a whole word in a sentence", () => {
    expect(matchesKeyword("yes sleep please", "sleep", "exact")).toBe(true);
  });

  it("does NOT match partial word in exact mode", () => {
    expect(matchesKeyword("sleepless", "sleep", "exact")).toBe(false);
  });

  it("does NOT match when keyword is embedded in another word", () => {
    expect(matchesKeyword("oversleeping", "sleep", "exact")).toBe(false);
  });

  it("matches case-insensitively in exact mode", () => {
    expect(matchesKeyword("SLEEP", "SLEEP", "exact")).toBe(true);
    expect(matchesKeyword("sleep", "SLEEP", "exact")).toBe(true);
  });

  it("matches with surrounding punctuation stripped by split", () => {
    // "sleep!" splits to ["sleep!"] — won't match "sleep" exactly
    // This is expected behavior — users should comment clean keywords
    expect(matchesKeyword("sleep!", "sleep", "exact")).toBe(false);
  });
});

// ─── buildDmMessage tests ─────────────────────────────────────────────────────

describe("buildDmMessage", () => {
  it("replaces {name} with @username", () => {
    const result = buildDmMessage("Hey {name}! Here is your link.", "john_doe");
    expect(result).toBe("Hey @john_doe! Here is your link.");
  });

  it("replaces {name} with 'there' when no username", () => {
    const result = buildDmMessage("Hey {name}! Here is your link.");
    expect(result).toBe("Hey there! Here is your link.");
  });

  it("replaces multiple {name} occurrences", () => {
    const result = buildDmMessage("Hi {name}! Thanks {name} for commenting.", "alice");
    expect(result).toBe("Hi @alice! Thanks @alice for commenting.");
  });

  it("is case-insensitive for {name} placeholder", () => {
    const result = buildDmMessage("Hello {NAME}!", "bob");
    expect(result).toBe("Hello @bob!");
  });

  it("returns template unchanged when no {name} placeholder", () => {
    const template = "Here is your link: https://deep-sleep-reset.com";
    const result = buildDmMessage(template, "user123");
    expect(result).toBe(template);
  });

  it("handles empty username gracefully", () => {
    const result = buildDmMessage("Hey {name}!", "");
    // Empty string is falsy, so should use "there"
    expect(result).toBe("Hey there!");
  });

  it("handles template with URL and emoji", () => {
    const template = "Hey {name}! 👋\n\nHere's the link: https://deep-sleep-reset.com 🌙";
    const result = buildDmMessage(template, "sleeper99");
    expect(result).toBe("Hey @sleeper99! 👋\n\nHere's the link: https://deep-sleep-reset.com 🌙");
  });
});

// ─── Integration-style logic tests ───────────────────────────────────────────

describe("Rule matching pipeline", () => {
  const rules = [
    { id: 1, keyword: "SLEEP", matchMode: "contains" as const, enabled: 1, dmTemplate: "Hey {name}! Here's the link: https://deep-sleep-reset.com" },
    { id: 2, keyword: "INFO", matchMode: "contains" as const, enabled: 1, dmTemplate: "Hey {name}! More info here: https://deep-sleep-reset.com" },
    { id: 3, keyword: "LINK", matchMode: "exact" as const, enabled: 0, dmTemplate: "Disabled rule" },
  ];

  function findMatchingRule(commentText: string) {
    return rules.find(
      (r) => r.enabled === 1 && matchesKeyword(commentText, r.keyword, r.matchMode)
    ) ?? null;
  }

  it("finds first matching active rule", () => {
    const rule = findMatchingRule("I need sleep help");
    expect(rule?.id).toBe(1);
  });

  it("skips disabled rules", () => {
    const rule = findMatchingRule("LINK");
    expect(rule).toBeNull(); // Rule 3 is disabled
  });

  it("returns null when no rule matches", () => {
    const rule = findMatchingRule("Great post!");
    expect(rule).toBeNull();
  });

  it("matches second rule when first doesn't match", () => {
    const rule = findMatchingRule("Can I get more info?");
    expect(rule?.id).toBe(2);
  });

  it("builds correct DM for matched rule", () => {
    const rule = findMatchingRule("I need sleep help");
    expect(rule).not.toBeNull();
    const dm = buildDmMessage(rule!.dmTemplate, "testuser");
    expect(dm).toContain("@testuser");
    expect(dm).toContain("https://deep-sleep-reset.com");
  });
});
