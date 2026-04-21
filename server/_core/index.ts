import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import funnelRoutes from "../funnelRoutes";
import externalApiRouter from "../externalApi";
import { startEmailScheduler } from "../emailScheduler";
import { ENV } from "./env";

function scheduleDailyContentGeneration() {
  const now = new Date();
  // Calculate ms until next 6am
  const next6am = new Date(now);
  next6am.setHours(6, 0, 0, 0);
  if (next6am <= now) next6am.setDate(next6am.getDate() + 1);
  const msUntil6am = next6am.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      console.log("[Content Cron] Generating daily 3 posts...");
      const { generateDailyContent } = await import("../contentCron.js");
      await generateDailyContent();
      console.log("[Content Cron] Daily content generated.");
    } catch (err) {
      console.error("[Content Cron] Failed:", err);
    }
    // Schedule next run in 24 hours
    setInterval(async () => {
      try {
        const { generateDailyContent } = await import("../contentCron.js");
        await generateDailyContent();
      } catch (err) {
        console.error("[Content Cron] Failed:", err);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntil6am);

  console.log(`[Content Cron] Scheduled for 6am (in ${Math.round(msUntil6am / 1000 / 60)} minutes)`);
}

function scheduleNightlyAnalysis() {
  const now = new Date();
  // Calculate ms until next midnight
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const msUntilMidnight = nextMidnight.getTime() - now.getTime();

  setTimeout(async () => {
    try {
      console.log("[Nightly Analysis] Starting autonomous funnel analysis...");
      const { runNightlyAnalysis } = await import("../nightlyAnalyzer.js");
      const report = await runNightlyAnalysis();
      console.log(`[Nightly Analysis] Complete. Revenue: $${report.metrics.totalRevenue.toFixed(2)}, Est. monthly: $${report.estimatedMonthlyRevenue.toFixed(0)}`);
    } catch (err) {
      console.error("[Nightly Analysis] Failed:", err);
    }
    // Schedule next run in 24 hours
    setInterval(async () => {
      try {
        const { runNightlyAnalysis } = await import("../nightlyAnalyzer.js");
        await runNightlyAnalysis();
      } catch (err) {
        console.error("[Nightly Analysis] Failed:", err);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);

  console.log(`[Nightly Analysis] Scheduled for midnight (in ${Math.round(msUntilMidnight / 1000 / 60)} minutes)`);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // ⚠️ Stripe webhook MUST use raw body BEFORE express.json()
  // This ensures Stripe signature verification works correctly
  app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
  // Configure body parser for all other routes
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Funnel API routes (all other /api/* routes)
  app.use("/api", funnelRoutes);
  // External Marketing API v1
  app.use("/api/v1", externalApiRouter);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Start autonomous email scheduler (7-day follow-up sequence)
    startEmailScheduler();
    // Schedule nightly AI analysis at midnight every day
    scheduleNightlyAnalysis();
    // Schedule daily content generation at 6am
    scheduleDailyContentGeneration();
  });
}

startServer().catch(console.error);
