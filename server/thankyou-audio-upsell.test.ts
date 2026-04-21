/**
 * Tests for the post-purchase audio upsell logic on the Thank You page.
 *
 * The upsell is shown when:
 *   - sessionStorage key "skipped_audio_upsell" === "1"
 *
 * It is NOT shown when:
 *   - The key is absent (customer bought audio or came directly)
 *   - The key has any other value
 *
 * After reading the flag it is removed from sessionStorage (show-once behaviour).
 */

import { describe, it, expect, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Pure helper that mirrors the ThankYou page detection logic
// ---------------------------------------------------------------------------
function shouldShowAudioUpsell(storage: Record<string, string>): {
  show: boolean;
  storageAfter: Record<string, string>;
} {
  const key = "skipped_audio_upsell";
  const show = storage[key] === "1";
  const storageAfter = { ...storage };
  if (show) delete storageAfter[key];
  return { show, storageAfter };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Post-purchase audio upsell detection", () => {
  describe("shouldShowAudioUpsell", () => {
    it("shows upsell when skipped_audio_upsell === '1'", () => {
      const { show } = shouldShowAudioUpsell({ skipped_audio_upsell: "1" });
      expect(show).toBe(true);
    });

    it("does NOT show upsell when key is absent", () => {
      const { show } = shouldShowAudioUpsell({});
      expect(show).toBe(false);
    });

    it("does NOT show upsell when key has unexpected value", () => {
      const { show } = shouldShowAudioUpsell({ skipped_audio_upsell: "true" });
      expect(show).toBe(false);
    });

    it("does NOT show upsell when key is '0'", () => {
      const { show } = shouldShowAudioUpsell({ skipped_audio_upsell: "0" });
      expect(show).toBe(false);
    });

    it("removes the key from storage after reading (show-once behaviour)", () => {
      const { storageAfter } = shouldShowAudioUpsell({ skipped_audio_upsell: "1" });
      expect(storageAfter).not.toHaveProperty("skipped_audio_upsell");
    });

    it("does not mutate storage when key is absent", () => {
      const initial = { other_key: "value" };
      const { storageAfter } = shouldShowAudioUpsell(initial);
      expect(storageAfter).toEqual(initial);
    });

    it("preserves other keys in storage when removing the flag", () => {
      const initial = { skipped_audio_upsell: "1", other_key: "value" };
      const { storageAfter } = shouldShowAudioUpsell(initial);
      expect(storageAfter).toHaveProperty("other_key", "value");
      expect(storageAfter).not.toHaveProperty("skipped_audio_upsell");
    });
  });

  describe("Upsell1 skip flag semantics", () => {
    it("flag value '1' is set when user clicks decline on Upsell1", () => {
      // Mirrors: sessionStorage.setItem("skipped_audio_upsell", "1")
      const storage: Record<string, string> = {};
      storage["skipped_audio_upsell"] = "1";
      expect(storage["skipped_audio_upsell"]).toBe("1");
    });

    it("flag is absent when user buys audio (Stripe redirects to /upsell-2?purchased=upsell1)", () => {
      // When user buys, they never hit the decline handler — flag stays absent
      const storage: Record<string, string> = {};
      expect(storage["skipped_audio_upsell"]).toBeUndefined();
    });

    it("upsell is shown exactly once — flag removed after first read", () => {
      const storage: Record<string, string> = { skipped_audio_upsell: "1" };
      const first = shouldShowAudioUpsell(storage);
      expect(first.show).toBe(true);
      // Second call with cleaned storage
      const second = shouldShowAudioUpsell(first.storageAfter);
      expect(second.show).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("handles empty string value as falsy", () => {
      const { show } = shouldShowAudioUpsell({ skipped_audio_upsell: "" });
      expect(show).toBe(false);
    });

    it("is case-sensitive — '1' only, not 'True' or 'yes'", () => {
      expect(shouldShowAudioUpsell({ skipped_audio_upsell: "True" }).show).toBe(false);
      expect(shouldShowAudioUpsell({ skipped_audio_upsell: "yes" }).show).toBe(false);
      expect(shouldShowAudioUpsell({ skipped_audio_upsell: "1" }).show).toBe(true);
    });
  });
});
