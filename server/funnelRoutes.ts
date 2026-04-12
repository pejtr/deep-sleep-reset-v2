import express, { Router, Request, Response } from "express";
import { getDb } from "./db";
import { quizResults, emailLeads, orders, abTestEvents, abTestWeights, optimizationHistoryTable } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import Stripe from "stripe";
import { FUNNEL_PRODUCTS, ProductKey } from "./products";
import { PRODUCT_DOWNLOADS } from "../shared/products";
import { sendPurchaseConfirmation, addBrevoContact } from "./emailService";
import { scheduleEmailSequence } from "./emailScheduler";

const router = Router();

// ─── Stripe Setup ─────────────────────────────────────────────────────────────
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

// Dynamic base URL — uses origin from request or falls back to env
function getBaseUrl(req: Request): string {
  const origin = req.headers.origin;
  if (origin) return origin;
  const appId = process.env.VITE_APP_ID;
  if (appId) return `https://${appId}.manus.space`;
  return "http://localhost:3000";
}

// ─── Quiz Submit ─────────────────────────────────────────────────────────────
router.post("/quiz/submit", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ success: true });
    const { result, answers, sessionId } = req.body;
    if (!result) return res.status(400).json({ error: "Missing result" });

    const referer = req.headers.referer || "";
    const source = referer.includes("facebook") ? "fb"
      : referer.includes("instagram") ? "ig"
      : "organic";

    await db.insert(quizResults).values({
      chronotype: result,
      answers: JSON.stringify(answers || []),
      sessionId: sessionId || null,
      source,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Quiz submit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Email Capture ────────────────────────────────────────────────────────────
router.post("/quiz/email", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ success: true });
    const { email, chronotype } = req.body;
    if (!email) return res.status(400).json({ error: "Missing email" });

    await db.insert(emailLeads).values({
      email,
      chronotype: chronotype || null,
      source: "quiz_result",
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Email capture error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Create Stripe Checkout Session ──────────────────────────────────────────
router.post("/orders/create", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { product = "tripwire", chronotype, email } = req.body;
    const productKey = product as ProductKey;
    const productInfo = FUNNEL_PRODUCTS[productKey];

    if (!productInfo) {
      return res.status(400).json({ error: "Invalid product" });
    }

    const baseUrl = getBaseUrl(req);

    // Dev/no-Stripe mode — skip payment, go straight to upsell
    if (!stripe) {
      if (db) {
        await db.insert(orders).values({
          product: productKey,
          amount: String(productInfo.price / 100),
          status: "paid",
          chronotype: chronotype || null,
          email: email || null,
        });
      }
      return res.json({ url: `${baseUrl}${productInfo.successRedirect}` });
    }

    // Create pending order record
    let orderId: number | null = null;
    if (db) {
      const result = await db.insert(orders).values({
        product: productKey,
        amount: String(productInfo.price / 100),
        status: "pending",
        chronotype: chronotype || null,
        email: email || null,
      });
      orderId = result[0].insertId;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: productInfo.name,
            description: productInfo.description,
          },
          unit_amount: productInfo.price,
        },
        quantity: 1,
      }],
      mode: "payment",
      allow_promotion_codes: true,
      customer_email: email || undefined,
      success_url: `${baseUrl}${productInfo.successRedirect}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${productInfo.cancelRedirect}`,
      client_reference_id: orderId ? String(orderId) : undefined,
      metadata: {
        orderId: orderId ? String(orderId) : "",
        product: productKey,
        chronotype: chronotype || "",
      },
    });

    // Update order with Stripe session ID
    if (db && orderId) {
      await db.update(orders)
        .set({ stripeSessionId: session.id })
        .where(eq(orders.id, orderId));
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Upsell Checkout ──────────────────────────────────────────────────────────
router.post("/orders/upsell", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { upsell, email } = req.body;
    const productKey = upsell as ProductKey;
    const productInfo = FUNNEL_PRODUCTS[productKey];

    if (!productInfo) {
      return res.status(400).json({ error: "Invalid product" });
    }

    const baseUrl = getBaseUrl(req);

    // Dev/no-Stripe mode
    if (!stripe) {
      if (db) {
        await db.insert(orders).values({
          product: productKey,
          amount: String(productInfo.price / 100),
          status: "paid",
          email: email || null,
        });
      }
      return res.json({ url: null, redirect: productInfo.successRedirect });
    }

    // Create Stripe session for upsell
    let orderId: number | null = null;
    if (db) {
      const result = await db.insert(orders).values({
        product: productKey,
        amount: String(productInfo.price / 100),
        status: "pending",
        email: email || null,
      });
      orderId = result[0].insertId;
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: productInfo.name,
            description: productInfo.description,
          },
          unit_amount: productInfo.price,
        },
        quantity: 1,
      }],
      mode: "payment",
      allow_promotion_codes: true,
      customer_email: email || undefined,
      success_url: `${baseUrl}${productInfo.successRedirect}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}${productInfo.cancelRedirect}`,
      client_reference_id: orderId ? String(orderId) : undefined,
      metadata: {
        orderId: orderId ? String(orderId) : "",
        product: productKey,
      },
    });

    if (db && orderId) {
      await db.update(orders)
        .set({ stripeSessionId: session.id })
        .where(eq(orders.id, orderId));
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error("Upsell error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/// ─── Stripe Webhook ─────────────────────────────────────────────────────
// Raw body is applied in index.ts via app.use("/api/stripe/webhook", express.raw(...))
// BEFORE express.json() middleware - this ensures Buffer is preserved for signature verification
router.post(
  "/stripe/webhook",
  async (req: Request, res: Response) => {
    if (!stripe) return res.json({ received: true });

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;
    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        event = JSON.parse(req.body.toString()) as Stripe.Event;
      }
    } catch (err) {
      console.error("[Webhook] Signature verification failed:", err);
      return res.status(400).json({ error: "Webhook signature verification failed" });
    }

    // ⚠️ CRITICAL: Handle test events for webhook verification
    if (event.id.startsWith("evt_test_")) {
      console.log("[Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId || session.client_reference_id;

      const db = await getDb();
      const customerEmail = session.customer_details?.email || null;
      const productKey = session.metadata?.product || "tripwire";
      const chronotype = session.metadata?.chronotype || "bear";
      const customerName = session.customer_details?.name || undefined;

      if (orderId && db) {
        await db.update(orders)
          .set({
            status: "paid",
            stripePaymentIntentId: session.payment_intent as string,
            email: customerEmail,
          })
          .where(eq(orders.id, parseInt(orderId)));
      }

      // Send purchase confirmation email with download link
      if (customerEmail) {
        const amount = (session.amount_total || 100) / 100;
        await sendPurchaseConfirmation({
          email: customerEmail,
          name: customerName,
          product: productKey,
          chronotype,
          amount,
        });

        // Add to Brevo contact list for follow-up sequence
        await addBrevoContact({
          email: customerEmail,
          name: customerName,
          chronotype,
          product: productKey,
        });

        // Schedule 7-day autonomous email sequence
        await scheduleEmailSequence({
          email: customerEmail,
          name: customerName,
          chronotype,
          purchasedAt: new Date(),
        });

        console.log(`[Email] Confirmation sent to ${customerEmail} for ${productKey}`);
      }
    }

    res.json({ received: true });
  }
);

// ─── A/B Test Tracking ────────────────────────────────────────────────────────
router.post("/ab-test/track", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ success: true });
    const { testName, variant, type: eventType, sessionId } = req.body;
    if (!testName || !variant || !eventType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await db.insert(abTestEvents).values({
      testName,
      variant,
      eventType,
      sessionId: sessionId || null,
    });

    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

// ─── Admin Stats ──────────────────────────────────────────────────────────────
router.get("/admin/stats", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.json({
        totalRevenue: 0, totalOrders: 0, quizCompletions: 0, emailLeads: 0,
        conversionRate: 0, upsell1Rate: 0, upsell2Rate: 0, upsell3Rate: 0,
        abTests: [], recentOrders: [], dailyRevenue: [],
      });
    }

    const exec = async (query: ReturnType<typeof sql>) => {
      const result = await db.execute(query);
      return (result[0] as unknown as any[]) || [];
    };

    const [
      revenueRows, ordersRows, quizRows, leadsRows,
      tripwireRows, oto1Rows, oto2Rows, oto3Rows,
      abTestRows, recentOrderRows, dailyRows,
    ] = await Promise.all([
      exec(sql`SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as total FROM orders WHERE status = 'paid'`),
      exec(sql`SELECT COUNT(*) as count FROM orders WHERE status = 'paid'`),
      exec(sql`SELECT COUNT(*) as count FROM quiz_results`),
      exec(sql`SELECT COUNT(*) as count FROM email_leads`),
      exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'tripwire' AND status = 'paid'`),
      exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto1' AND status = 'paid'`),
      exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto2' AND status = 'paid'`),
      exec(sql`SELECT COUNT(*) as count FROM orders WHERE product = 'oto3' AND status = 'paid'`),
      exec(sql`SELECT testName, variant,
        SUM(CASE WHEN eventType = 'impression' THEN 1 ELSE 0 END) as impressions,
        SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as clicks
        FROM ab_test_events GROUP BY testName, variant ORDER BY testName, variant`),
      exec(sql`SELECT id, product, CAST(amount AS DECIMAL(10,2)) as amount, chronotype, createdAt
        FROM orders WHERE status = 'paid' ORDER BY createdAt DESC LIMIT 20`),
      exec(sql`SELECT DATE(createdAt) as date,
        COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as revenue, COUNT(*) as orders
        FROM orders WHERE status = 'paid' AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(createdAt) ORDER BY date DESC`),
    ]);

    const totalRevenue = parseFloat(revenueRows[0]?.total || "0");
    const totalOrders = parseInt(ordersRows[0]?.count || "0");
    const quizCompletions = parseInt(quizRows[0]?.count || "0");
    const emailLeadsCount = parseInt(leadsRows[0]?.count || "0");
    const tripwireTotal = parseInt(tripwireRows[0]?.count || "0");
    const upsell1Count = parseInt(oto1Rows[0]?.count || "0");
    const upsell2Count = parseInt(oto2Rows[0]?.count || "0");
    const upsell3Count = parseInt(oto3Rows[0]?.count || "0");

    res.json({
      totalRevenue,
      totalOrders,
      quizCompletions,
      emailLeads: emailLeadsCount,
      conversionRate: quizCompletions > 0 ? (tripwireTotal / quizCompletions) * 100 : 0,
      upsell1Rate: tripwireTotal > 0 ? (upsell1Count / tripwireTotal) * 100 : 0,
      upsell2Rate: upsell1Count > 0 ? (upsell2Count / upsell1Count) * 100 : 0,
      upsell3Rate: upsell2Count > 0 ? (upsell3Count / upsell2Count) * 100 : 0,
      abTests: abTestRows.map((row: any) => ({
        testName: row.testName,
        variant: row.variant,
        impressions: parseInt(row.impressions || "0"),
        clicks: parseInt(row.clicks || "0"),
        ctr: row.impressions > 0 ? (row.clicks / row.impressions) * 100 : 0,
      })),
      recentOrders: recentOrderRows,
      dailyRevenue: dailyRows.map((row: any) => ({
        date: new Date(row.date).toLocaleDateString("cs-CZ"),
        revenue: parseFloat(row.revenue || "0"),
        orders: parseInt(row.orders || "0"),
      })),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Downloads ────────────────────────────────────────────────────────────────
router.get("/downloads/:product", async (req: Request, res: Response) => {
  const productKey = req.params.product as keyof typeof PRODUCT_DOWNLOADS;
  const download = PRODUCT_DOWNLOADS[productKey];

  if (!download) {
    return res.status(404).json({ error: "Product not found" });
  }

  // Redirect to CDN URL for direct download
  res.redirect(302, download.url);
});

// ─── Get download links for purchased products ────────────────────────────────
router.get("/downloads", async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || !stripe) {
    // Return all downloads in dev mode
    return res.json({
      downloads: Object.entries(PRODUCT_DOWNLOADS).map(([key, val]) => ({
        key,
        name: val.name,
        url: `/api/downloads/${key}`,
        filename: val.filename,
      })),
    });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    const productKey = session.metadata?.product as keyof typeof PRODUCT_DOWNLOADS;
    const download = productKey ? PRODUCT_DOWNLOADS[productKey] : PRODUCT_DOWNLOADS.tripwire;

    res.json({
      downloads: [{
        key: productKey || "tripwire",
        name: download.name,
        url: `/api/downloads/${productKey || "tripwire"}`,
        filename: download.filename,
      }],
    });
  } catch {
    res.status(400).json({ error: "Invalid session" });
  }
});

// ─── Behavior Tracking (heat map & funnel analytics) ────────────────────────
router.post("/behavior/track", async (req: Request, res: Response) => {
  try {
    const { event, page, product, element, depth, duration, x, y, ts, sessionId } = req.body;
    const db = await getDb();
    if (db) {
      // Store rich metadata as JSON in result field for heat map analysis
      const meta = JSON.stringify({ element, depth, duration, x, y, ts, sessionId });
      await db.execute(
        sql`INSERT INTO behavior_events (event_type, page, product, result, created_at) VALUES (${event || 'unknown'}, ${page || 'unknown'}, ${product || null}, ${meta}, NOW())`
      ).catch(() => {}); // Table may not exist yet
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true }); // Never fail the client
  }
});

// ─── Behavior Analytics (Admin heat map data) ──────────────────────────────
router.get("/admin/behavior", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ events: [], summary: {} });

    // Get last 7 days of behavior events
    const events = await db.execute(
      sql`SELECT event_type, page, COUNT(*) as count, MAX(created_at) as last_seen
          FROM behavior_events
          WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY event_type, page
          ORDER BY count DESC
          LIMIT 50`
    ).catch(() => ({ rows: [] }));

    // Rage clicks (same element clicked 3+ times in 2 seconds)
    const rageClicks = await db.execute(
      sql`SELECT page, COUNT(*) as count
          FROM behavior_events
          WHERE event_type = 'rage_click'
          AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY page
          ORDER BY count DESC`
    ).catch(() => ({ rows: [] }));

    // Scroll depth distribution
    const scrollDepth = await db.execute(
      sql`SELECT result, COUNT(*) as count
          FROM behavior_events
          WHERE event_type = 'scroll_depth'
          AND created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY result
          ORDER BY result ASC`
    ).catch(() => ({ rows: [] }));

    res.json({
      events: (events as any).rows || [],
      rageClicks: (rageClicks as any).rows || [],
      scrollDepth: (scrollDepth as any).rows || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Auto A/B Optimization (winner gets 70% traffic) ─────────────────────────
router.get("/ab-test/winner", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ headline: 'D', cta: 'C' });

    // Get click-through rates per variant (last 7 days)
    const results = await db.execute(
      sql`SELECT test_name, variant,
              SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) as clicks,
              SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END) as impressions,
              ROUND(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END) * 100.0 /
                NULLIF(SUM(CASE WHEN event_type = 'impression' THEN 1 ELSE 0 END), 0), 2) as ctr
          FROM ab_test_events
          WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
          GROUP BY test_name, variant
          HAVING impressions >= 10
          ORDER BY test_name, ctr DESC`
    ).catch(() => ({ rows: [] }));

    const rows = (results as any).rows || [];
    const winners: Record<string, string> = {};
    for (const row of rows) {
      if (!winners[row.test_name]) {
        winners[row.test_name] = row.variant; // First = highest CTR
      }
    }

    res.json({
      headline: winners['headline'] || null,
      cta: winners['cta_button'] || null,
      data: rows,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Leads Capture (email popup) ─────────────────────────────────────────────
router.post("/leads/capture", async (req: Request, res: Response) => {
  try {
    const { email, source } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }
    const db = await getDb();
    if (db) {
      await db.insert(emailLeads).values({
        email: email.toLowerCase().trim(),
        source: source || "popup",
        chronotype: null,
      }).catch(() => {}); // Ignore duplicate
    }
    // Add to Brevo
    await addBrevoContact({ email, name: undefined, chronotype: undefined, product: undefined }).catch(() => {});
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Behavior Summary (heat map panel) ──────────────────────────────────
router.get("/behavior/summary", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const empty = { pageViews: {}, ctaClicks: {}, scrollDepths: {}, exitIntents: 0, rageClicks: 0, emailPopupOpens: 0, emailPopupConverts: 0, dropoffByPage: {}, abWinners: [], optimizationHistory: [] };
    if (!db) return res.json(empty);

    const pvRows = await (db as any).execute(
      sql`SELECT page, COUNT(*) as cnt FROM behavior_events WHERE event_type = 'page_view' GROUP BY page`
    ).catch(() => ({ rows: [] }));
    const pageViews: Record<string, number> = {};
    for (const r of ((pvRows as any).rows || [])) pageViews[r.page] = Number(r.cnt);

    const clickRows = await (db as any).execute(
      sql`SELECT result, COUNT(*) as cnt FROM behavior_events WHERE event_type IN ('click','cta_click') GROUP BY result`
    ).catch(() => ({ rows: [] }));
    const ctaClicks: Record<string, number> = {};
    for (const r of ((clickRows as any).rows || [])) if (r.result) ctaClicks[r.result] = Number(r.cnt);

    const scrollRows = await (db as any).execute(
      sql`SELECT page, result, COUNT(*) as cnt FROM behavior_events WHERE event_type = 'scroll_depth' GROUP BY page, result`
    ).catch(() => ({ rows: [] }));
    const scrollDepths: Record<string, Record<string, number>> = {};
    for (const r of ((scrollRows as any).rows || [])) {
      if (!scrollDepths[r.page]) scrollDepths[r.page] = {};
      scrollDepths[r.page][r.result] = Number(r.cnt);
    }

    const specialRows = await (db as any).execute(
      sql`SELECT event_type, COUNT(*) as cnt FROM behavior_events WHERE event_type IN ('exit_intent','rage_click','email_popup_open','email_popup_convert') GROUP BY event_type`
    ).catch(() => ({ rows: [] }));
    const specialMap: Record<string, number> = {};
    for (const r of ((specialRows as any).rows || [])) specialMap[r.event_type] = Number(r.cnt);

    // True funnel drop-off: step-to-step attrition rates
    const funnelSteps = ['/', '/quiz', '/result', '/order', '/upsell1', '/upsell2', '/upsell3', '/thank-you'];
    const dropoffByPage: Record<string, { visitors: number; dropoffRate: number; nextStep: string | null }> = {};
    for (let i = 0; i < funnelSteps.length; i++) {
      const step = funnelSteps[i];
      const nextStep = funnelSteps[i + 1] || null;
      const visitors = pageViews[step] || 0;
      const nextVisitors = nextStep ? (pageViews[nextStep] || 0) : visitors;
      const dropoffRate = visitors > 0 ? Math.round(((visitors - nextVisitors) / visitors) * 100) : 0;
      dropoffByPage[step] = { visitors, dropoffRate, nextStep };
    }

    // A/B winners from DB
    const weightRows = await (db as any).execute(
      sql`SELECT testName, variant, weight FROM ab_test_weights WHERE isWinner = 'yes' ORDER BY updatedAt DESC LIMIT 10`
    ).catch(() => ({ rows: [] }));
    const abWinners = ((weightRows as any).rows || []).map((r: any) => ({ testName: r.testName, winner: r.variant, weight: r.weight }));

    // Optimization history from DB
    const histRows = await (db as any).execute(
      sql`SELECT action, testName, winner, confidence, impact, createdAt FROM optimization_history ORDER BY createdAt DESC LIMIT 20`
    ).catch(() => ({ rows: [] }));
    const optimizationHistory = ((histRows as any).rows || []).map((r: any) => ({
      action: r.action, testName: r.testName, winner: r.winner,
      confidence: r.confidence, impact: r.impact, createdAt: r.createdAt
    }));

    res.json({ pageViews, ctaClicks, scrollDepths, exitIntents: specialMap['exit_intent'] || 0, rageClicks: specialMap['rage_click'] || 0, emailPopupOpens: specialMap['email_popup_open'] || 0, emailPopupConverts: specialMap['email_popup_convert'] || 0, dropoffByPage, abWinners, optimizationHistory });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Auto A/B Optimization (promote winner to 70% traffic, persist to DB) ────────
router.post("/ab-test/winner", async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.json({ winners: [] });

    // Query A/B test events for statistical analysis
    const results = await (db as any).execute(
      sql`SELECT testName as test_name, variant,
           COUNT(*) as impressions,
           SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) as clicks,
           (SUM(CASE WHEN eventType = 'click' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0) * 100) as ctr
           FROM ab_test_events GROUP BY testName, variant HAVING COUNT(*) >= 50 ORDER BY testName, ctr DESC`
    ).catch(() => ({ rows: [] }));

    const rows = ((results as any).rows || []) as Array<{ test_name: string; variant: string; impressions: number; clicks: number; ctr: number }>;
    const winners: Array<{ testName: string; winner: string; confidence: number }> = [];
    const seen = new Set<string>();

    for (const row of rows) {
      if (!seen.has(row.test_name)) {
        seen.add(row.test_name);
        const confidence = Math.min(99, Math.round(Number(row.ctr) * 8));
        winners.push({ testName: row.test_name, winner: row.variant, confidence });

        // Persist winner weight to DB (70% for winner)
        try {
          await (db as any).execute(
            sql`INSERT INTO ab_test_weights (testName, variant, weight, isWinner)
                VALUES (${row.test_name}, ${row.variant}, 70, 'yes')
                ON DUPLICATE KEY UPDATE weight = 70, isWinner = 'yes', updatedAt = NOW()`
          );
        } catch (e) {
          console.error(`[AB] Failed to persist winner for ${row.test_name}:`, e);
        }

        // Log to optimization history
        const impact = `+${Number(row.ctr).toFixed(1)}% CTR`;
        try {
          await db.insert(optimizationHistoryTable).values({
            action: `Set ${row.test_name} variant "${row.variant}" as winner — allocated 70% traffic`,
            testName: row.test_name,
            winner: row.variant,
            confidence,
            impact,
          });
        } catch (e) {
          console.error(`[AB] Failed to log optimization history:`, e);
        }
      }
    }

    res.json({ winners, optimizedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Nightly AI Analysis (called by scheduler at midnight) ───────────────────
router.post("/admin/nightly-analysis", async (req: Request, res: Response) => {
  const authHeader = req.headers["x-internal-key"];
  if (authHeader !== process.env.JWT_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    const { runNightlyAnalysis } = await import("./nightlyAnalyzer.js");
    const report = await runNightlyAnalysis();
    res.json({ ok: true, report });
  } catch (err) {
    console.error("[Nightly Analysis] Failed:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;
