import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createEmailJob: vi.fn(),
  getAdminOverview: vi.fn(async () => ({
    totals: { subscribers: 0, activeMembers: 0, funnelEvents: 0 },
    recentPurchases: [],
    recentEvents: [],
  })),
  getContentFeed: vi.fn(async () => []),
  getMemberDashboard: vi.fn(async () => ({
    progress: { status: "active", currentDay: 2, completedDays: 1, streakDays: 1 },
    feed: [{ id: 1, title: "Evening Reset", summary: "Wind down.", contentType: "tip", dayNumber: 1 }],
  })),
  getUserPurchases: vi.fn(async () => [{ id: 1, status: "active", productKey: "deepsleepreset-premium" }]),
  listAdminContentItems: vi.fn(async () => [{ id: 1, slug: "evening-reset", title: "Evening Reset" }]),
  listQaChecklist: vi.fn(async () => []),
  recordFunnelEvent: vi.fn(),
  saveDailyCheckIn: vi.fn(async () => ({ currentDay: 3, completedDays: 2, streakDays: 2 })),
  seedQaChecklistIfEmpty: vi.fn(),
  syncAuthenticatedUser: vi.fn(async (user: { openId: string; email?: string | null; name?: string | null; loginMethod?: string | null }) => ({
    id: 7,
    openId: user.openId,
    email: user.email ?? "member@example.com",
    name: user.name ?? "Member",
    loginMethod: user.loginMethod ?? "manus",
    role: "user",
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  })),
  updateQaChecklistItem: vi.fn(),
  upsertContentItem: vi.fn(),
  userHasPremiumAccess: vi.fn(async () => false),
}));

vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn(async () => ({
    id: "cs_test_123",
    url: "https://checkout.stripe.test/session",
  })),
}));

const dbModule = await import("./db");

function createContext(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "user-7",
      email: "member@example.com",
      name: "Member",
      loginMethod: "manus",
      role: "user",
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: { origin: "https://deepsleepreset.test" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

describe("DeepSleepReset routers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs the authenticated Manus user and records a login funnel event", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.auth.me();

    expect(dbModule.syncAuthenticatedUser).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "user-7",
        email: "member@example.com",
      }),
    );
    expect(dbModule.recordFunnelEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "login" }),
    );
    expect(result).toMatchObject({ openId: "user-7", email: "member@example.com" });
  });

  it("creates a checkout session for authenticated users and queues a checkout email", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.checkout.createSession();

    expect(result.checkoutUrl).toBe("https://checkout.stripe.test/session");
    expect(result.sessionId).toBe("cs_test_123");
    expect(dbModule.createEmailJob).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "member@example.com",
        eventType: "funnel",
      }),
    );
  });

  it("returns locked member dashboard data when premium access is missing", async () => {
    vi.mocked(dbModule.userHasPremiumAccess).mockResolvedValue(false);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.member.dashboard();

    expect(result.hasPremium).toBe(false);
    expect(result.progress).toBeNull();
    expect(result.feed).toEqual([]);
  });

  it("returns member dashboard data when premium access exists", async () => {
    vi.mocked(dbModule.userHasPremiumAccess).mockResolvedValue(true);

    const caller = appRouter.createCaller(createContext());
    const result = await caller.member.dashboard();

    expect(result.hasPremium).toBe(true);
    expect(result.progress).toMatchObject({ status: "active" });
    expect(result.feed).toHaveLength(1);
  });

  it("returns payment history for authenticated members", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.member.payments();

    expect(dbModule.getUserPurchases).toHaveBeenCalledWith(7);
    expect(result).toHaveLength(1);
  });

  it("tracks public landing page views", async () => {
    const caller = appRouter.createCaller(createContext({ user: null }));
    const result = await caller.public.trackLandingView();

    expect(result).toEqual({ success: true });
    expect(dbModule.recordFunnelEvent).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: "landing_view" }),
    );
  });

  it("allows admin users to upsert premium content items", async () => {
    const caller = appRouter.createCaller(
      createContext({
        user: {
          ...createContext().user!,
          role: "admin",
        },
      }),
    );

    const result = await caller.admin.upsertContent({
      slug: "new-sleep-note",
      title: "New Sleep Note",
      summary: "A premium content summary.",
      body: "A calm and practical DeepSleepReset content block.",
      contentType: "tip",
      dayNumber: 4,
      isPremium: 1,
      isPublished: 1,
    });

    expect(result).toEqual({ success: true });
    expect(dbModule.upsertContentItem).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "new-sleep-note", contentType: "tip" }),
    );
  });
});
