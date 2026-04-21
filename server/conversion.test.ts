/**
 * Tests for Phase 19 Conversion Rate Optimization features:
 * - getLeadSourceStats DB helper
 * - admin.leadSources tRPC procedure
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "oauth",
    stripeCustomerId: null,
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {} as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "oauth",
    stripeCustomerId: null,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {} as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Conversion Analytics", () => {
  describe("admin.leadSources procedure", () => {
    it("should return lead source stats for admin users", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Should not throw for admin users (may return empty array if no DB)
      const result = await caller.admin.leadSources();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.admin.leadSources()).rejects.toThrow();
    });

    it("should reject unauthenticated users", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {} as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      await expect(caller.admin.leadSources()).rejects.toThrow();
    });
  });

  describe("leads.capture procedure", () => {
    it("should capture a quiz lead with sleep-quiz source", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {} as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      // Should succeed (DB may not be available in test, but no crash)
      const result = await caller.leads.capture({
        email: "quiz-tester@example.com",
        source: "sleep-quiz",
        abVariant: "score-45",
      });
      expect(result).toEqual({ success: true });
    });

    it("should accept newsletter source for lead capture", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {} as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.leads.capture({
        email: "newsletter@example.com",
        source: "newsletter",
      });
      expect(result).toEqual({ success: true });
    });

    it("should reject invalid email addresses", async () => {
      const ctx: TrpcContext = {
        user: null,
        req: {} as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.leads.capture({ email: "not-an-email", source: "sleep-quiz" })
      ).rejects.toThrow();
    });
  });
});
