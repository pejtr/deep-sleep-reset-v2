/**
 * External Marketing API v1
 * REST endpoints for Zapier, Make.com, n8n, and custom dashboards
 * Authentication: Bearer API key in Authorization header
 * Base URL: /api/v1
 */
import { Router, Request, Response, NextFunction } from "express";
import { createHash, randomBytes } from "crypto";
import { getDb } from "./db";
import {
  apiKeys,
  orders,
  emailLeads,
  abTestEvents,
  quizResults,
} from "../drizzle/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import { sendSaleNotificationEmail } from "./email";
import axios from "axios";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

function generateApiKey(): string {
  return "dsr_" + randomBytes(32).toString("hex");
}

// ─── Auth Middleware ───────────────────────────────────────────────────────────

async function requireApiKey(
  req: Request & { apiKeyRecord?: typeof apiKeys.$inferSelect },
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing API key. Use: Authorization: Bearer dsr_..." });
  }
  const rawKey = authHeader.slice(7);
  const keyHash = hashKey(rawKey);

  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    const [record] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, true)))
      .limit(1);

    if (!record) {
      return res.status(401).json({ error: "Invalid or revoked API key" });
    }

    // Update last_used_at
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, record.id));

    req.apiKeyRecord = record;
    next();
  } catch (err) {
    console.error("[API] Auth error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
}

function requirePermission(level: "read" | "write" | "admin") {
  const hierarchy = { read: 0, write: 1, admin: 2 };
  return (
    req: Request & { apiKeyRecord?: typeof apiKeys.$inferSelect },
    res: Response,
    next: NextFunction
  ) => {
    const perm = req.apiKeyRecord?.permissions ?? "read";
    if (hierarchy[perm] >= hierarchy[level]) {
      next();
    } else {
      res.status(403).json({ error: `Requires '${level}' permission, got '${perm}'` });
    }
  };
}

// ─── Key Management ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/keys
 * Create a new API key (requires OWNER_OPEN_ID check via admin secret header)
 */
router.post("/keys", async (req: Request, res: Response) => {
  // Simple admin secret check — use X-Admin-Secret header
  const adminSecret = process.env.JWT_SECRET;
  if (req.headers["x-admin-secret"] !== adminSecret) {
    return res.status(401).json({ error: "Invalid admin secret" });
  }

  const { name, permissions = "read" } = req.body as {
    name?: string;
    permissions?: "read" | "write" | "admin";
  };

  if (!name) return res.status(400).json({ error: "name is required" });
  if (!["read", "write", "admin"].includes(permissions)) {
    return res.status(400).json({ error: "permissions must be read|write|admin" });
  }

  const rawKey = generateApiKey();
  const keyHash = hashKey(rawKey);

  const db2 = await getDb();
  if (!db2) return res.status(500).json({ error: "Database unavailable" });
  await db2.insert(apiKeys).values({ keyHash, name, permissions });

  res.json({
    success: true,
    key: rawKey, // shown ONCE — store securely
    name,
    permissions,
    note: "Store this key securely — it will not be shown again.",
  });
});

/**
 * GET /api/v1/keys
 * List all API keys (hashes only, no raw keys)
 */
router.get("/keys", requireApiKey, requirePermission("admin"), async (_req: Request, res: Response) => {
  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      permissions: apiKeys.permissions,
      isActive: apiKeys.isActive,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .orderBy(desc(apiKeys.createdAt));

  res.json({ keys });
});

/**
 * DELETE /api/v1/keys/:id
 * Revoke an API key
 */
router.delete("/keys/:id", requireApiKey, requirePermission("admin"), async (req: Request, res: Response) => {
  const db = await getDb();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  const id = parseInt(req.params.id);
  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, id));
  res.json({ success: true, message: `Key ${id} revoked` });
});

// ─── Analytics Endpoints ───────────────────────────────────────────────────────

/**
 * GET /api/v1/stats
 * Overall analytics: revenue, orders, leads, conversion rates
 */
router.get("/stats", requireApiKey, requirePermission("read"), async (_req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const [totalRevenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(orders)
      .where(eq(orders.status, "paid"));

    const [orderCounts] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        paid: sql<number>`SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN status IN ('pending', 'pending_gumroad') THEN 1 ELSE 0 END)`,
      })
      .from(orders);

    const [leadCount] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(emailLeads);

    const [quizCount] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(quizResults);

    const revenueByProduct = await db
      .select({
        product: orders.product,
        revenue: sql<string>`COALESCE(SUM(amount), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(eq(orders.status, "paid"))
      .groupBy(orders.product);

    const conversionRate =
      quizCount.total > 0
        ? ((orderCounts.paid / quizCount.total) * 100).toFixed(2)
        : "0.00";

    res.json({
      revenue: {
        total: parseFloat(totalRevenue.total),
        currency: "USD",
        byProduct: revenueByProduct.map((r: { product: string; revenue: string; count: number }) => ({
        product: r.product,
        revenue: parseFloat(r.revenue),
        orders: r.count,
      })),
      },
      orders: {
        total: orderCounts.total,
        paid: orderCounts.paid,
        pending: orderCounts.pending,
      },
      leads: {
        total: leadCount.total,
      },
      quiz: {
        total: quizCount.total,
      },
      conversion: {
        quizToOrder: `${conversionRate}%`,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[API] Stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * GET /api/v1/orders?status=paid&limit=50&offset=0&since=2026-01-01
 * List orders with filtering
 */
router.get("/orders", requireApiKey, requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;
    const since = req.query.since as string | undefined;

    const conditions: ReturnType<typeof eq>[] = [];
    if (status && ["pending", "pending_gumroad", "paid", "failed", "refunded"].includes(status)) {
      conditions.push(eq(orders.status, status as typeof orders.$inferSelect.status));
    }
    if (since) {
      conditions.push(gte(orders.createdAt, new Date(since)));
    }

    const results = await db
      .select()
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      orders: results,
      pagination: { limit, offset, total: total.count },
    });
  } catch (err) {
    console.error("[API] Orders error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * GET /api/v1/leads?limit=50&offset=0&since=2026-01-01
 * List email leads
 */
router.get("/leads", requireApiKey, requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
    const offset = parseInt(req.query.offset as string) || 0;
    const since = req.query.since as string | undefined;

    const conditions: ReturnType<typeof gte>[] = since ? [gte(emailLeads.createdAt, new Date(since))] : [];

    const results = await db
      .select()
      .from(emailLeads)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(emailLeads.createdAt))
      .limit(limit)
      .offset(offset);

    const [total] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(emailLeads)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json({
      leads: results,
      pagination: { limit, offset, total: total.count },
    });
  } catch (err) {
    console.error("[API] Leads error:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

/**
 * GET /api/v1/events?testName=headline&eventType=conversion&limit=100
 * List A/B test events
 */
router.get("/events", requireApiKey, requirePermission("read"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const results = await db
      .select()
      .from(abTestEvents)
      .orderBy(desc(abTestEvents.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ events: results, pagination: { limit, offset } });
  } catch (err) {
    console.error("[API] Events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// ─── Management Endpoints ──────────────────────────────────────────────────────

/**
 * PATCH /api/v1/orders/:id
 * Update order status (e.g., mark as refunded from external system)
 */
router.patch("/orders/:id", requireApiKey, requirePermission("write"), async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });
    const id = parseInt(req.params.id);
    const { status } = req.body as { status?: string };

    if (!status || !["pending", "paid", "failed", "refunded"].includes(status)) {
      return res.status(400).json({ error: "status must be pending|paid|failed|refunded" });
    }

    await db
      .update(orders)
      .set({ status: status as typeof orders.$inferSelect.status })
      .where(eq(orders.id, id));

    const [updated] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("[API] Update order error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

/**
 * POST /api/v1/email/send
 * Send a custom email to a customer (for external automation)
 */
router.post("/email/send", requireApiKey, requirePermission("write"), async (req: Request, res: Response) => {
  try {
    const { to, subject, html, text: textBody } = req.body as {
      to?: string;
      subject?: string;
      html?: string;
      text?: string;
    };

    if (!to || !subject || (!html && !textBody)) {
      return res.status(400).json({ error: "to, subject, and html or text are required" });
    }

    // Send via Brevo API directly
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) throw new Error("BREVO_API_KEY not configured");
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Deep Sleep Reset", email: "noreply@deepsleep.quest" },
        to: [{ email: to }],
        subject,
        htmlContent: html || `<p>${textBody}</p>`,
      },
      { headers: { "api-key": brevoApiKey, "Content-Type": "application/json" } }
    );

    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    console.error("[API] Send email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// ─── API Documentation ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/docs
 * Returns API documentation as JSON
 */
router.get("/docs", (_req: Request, res: Response) => {
  res.json({
    name: "Deep Sleep Reset — External Marketing API",
    version: "1.0.0",
    baseUrl: "/api/v1",
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer dsr_...",
      note: "Generate keys via POST /api/v1/keys with X-Admin-Secret header",
    },
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/keys",
        description: "Create a new API key",
        auth: "X-Admin-Secret header (JWT_SECRET)",
        body: { name: "string (required)", permissions: "read|write|admin" },
      },
      {
        method: "GET",
        path: "/api/v1/keys",
        description: "List all API keys",
        auth: "Bearer (admin)",
      },
      {
        method: "DELETE",
        path: "/api/v1/keys/:id",
        description: "Revoke an API key",
        auth: "Bearer (admin)",
      },
      {
        method: "GET",
        path: "/api/v1/stats",
        description: "Overall analytics: revenue, orders, leads, conversion",
        auth: "Bearer (read)",
        query: {},
      },
      {
        method: "GET",
        path: "/api/v1/orders",
        description: "List orders with filtering",
        auth: "Bearer (read)",
        query: { status: "paid|pending|failed|refunded", limit: "1-200", offset: "0+", since: "ISO date" },
      },
      {
        method: "GET",
        path: "/api/v1/leads",
        description: "List email leads",
        auth: "Bearer (read)",
        query: { limit: "1-200", offset: "0+", since: "ISO date" },
      },
      {
        method: "GET",
        path: "/api/v1/events",
        description: "List A/B test events",
        auth: "Bearer (read)",
        query: { limit: "1-500", offset: "0+" },
      },
      {
        method: "PATCH",
        path: "/api/v1/orders/:id",
        description: "Update order status",
        auth: "Bearer (write)",
        body: { status: "pending|paid|failed|refunded" },
      },
      {
        method: "POST",
        path: "/api/v1/email/send",
        description: "Send a custom email to a customer",
        auth: "Bearer (write)",
        body: { to: "email", subject: "string", html: "string (optional)", text: "string (optional)" },
      },
    ],
    integrations: {
      zapier: "Use 'Webhooks by Zapier' with Bearer auth",
      make: "Use HTTP module with Authorization header",
      n8n: "Use HTTP Request node with Header Auth",
    },
  });
});

export default router;
