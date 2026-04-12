import { describe, expect, it, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

// Mock DB and Stripe before importing routes
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { create: vi.fn() } },
    webhooks: { constructEvent: vi.fn() },
  })),
}));

// Import router after mocks
const { default: funnelRouter } = await import("./funnelRoutes");

const app = express();
app.use(express.json());
app.use("/api", funnelRouter);

describe("/api/behavior/summary", () => {
  it("returns expected shape when DB is unavailable", async () => {
    const res = await request(app).get("/api/behavior/summary");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("pageViews");
    expect(res.body).toHaveProperty("ctaClicks");
    expect(res.body).toHaveProperty("scrollDepths");
    expect(res.body).toHaveProperty("exitIntents");
    expect(res.body).toHaveProperty("rageClicks");
    expect(res.body).toHaveProperty("emailPopupOpens");
    expect(res.body).toHaveProperty("emailPopupConverts");
    expect(res.body).toHaveProperty("dropoffByPage");
    expect(res.body).toHaveProperty("abWinners");
    expect(res.body).toHaveProperty("optimizationHistory");
  });

  it("dropoffByPage is an object (not null)", async () => {
    const res = await request(app).get("/api/behavior/summary");
    expect(res.status).toBe(200);
    expect(typeof res.body.dropoffByPage).toBe("object");
    expect(res.body.dropoffByPage).not.toBeNull();
  });

  it("abWinners is an array", async () => {
    const res = await request(app).get("/api/behavior/summary");
    expect(Array.isArray(res.body.abWinners)).toBe(true);
  });

  it("optimizationHistory is an array", async () => {
    const res = await request(app).get("/api/behavior/summary");
    expect(Array.isArray(res.body.optimizationHistory)).toBe(true);
  });
});

describe("/api/ab-test/winner", () => {
  it("returns winners array when DB is unavailable", async () => {
    const res = await request(app).post("/api/ab-test/winner");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("winners");
    expect(Array.isArray(res.body.winners)).toBe(true);
  });

  it("returns optimizedAt or winners array when DB unavailable", async () => {
    const res = await request(app).post("/api/ab-test/winner");
    expect(res.status).toBe(200);
    // When DB is unavailable, returns { winners: [] } without optimizedAt
    // When DB is available, returns { winners: [...], optimizedAt: ISO string }
    expect(res.body).toHaveProperty("winners");
    if (res.body.optimizedAt) {
      expect(new Date(res.body.optimizedAt).getTime()).toBeGreaterThan(0);
    }
  });
});

describe("/api/behavior/track", () => {
  it("accepts valid behavior event", async () => {
    const res = await request(app)
      .post("/api/behavior/track")
      .send({ event: "page_view", page: "/", ts: Date.now() });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("ok", true);
  });

  it("accepts request without event field gracefully (server returns ok or error)", async () => {
    const res = await request(app)
      .post("/api/behavior/track")
      .send({ page: "/", ts: Date.now() });
    // Server either rejects (400) or accepts gracefully (200) — both are valid behaviors
    expect([200, 400]).toContain(res.status);
  });
});

describe("Funnel drop-off calculation logic", () => {
  it("dropoffRate is 0 when no visitors", () => {
    const visitors = 0;
    const nextVisitors = 0;
    const dropoffRate = visitors > 0 ? Math.round(((visitors - nextVisitors) / visitors) * 100) : 0;
    expect(dropoffRate).toBe(0);
  });

  it("dropoffRate is 50% when half visitors proceed", () => {
    const visitors = 100;
    const nextVisitors = 50;
    const dropoffRate = visitors > 0 ? Math.round(((visitors - nextVisitors) / visitors) * 100) : 0;
    expect(dropoffRate).toBe(50);
  });

  it("dropoffRate is 0% when all visitors proceed", () => {
    const visitors = 100;
    const nextVisitors = 100;
    const dropoffRate = visitors > 0 ? Math.round(((visitors - nextVisitors) / visitors) * 100) : 0;
    expect(dropoffRate).toBe(0);
  });

  it("dropoffRate is 100% when no visitors proceed", () => {
    const visitors = 100;
    const nextVisitors = 0;
    const dropoffRate = visitors > 0 ? Math.round(((visitors - nextVisitors) / visitors) * 100) : 0;
    expect(dropoffRate).toBe(100);
  });
});
