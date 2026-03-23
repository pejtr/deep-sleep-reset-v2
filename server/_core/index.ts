import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import multer from "multer";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe/webhook";
import { igCronTick } from "../igCronJob";
import { storagePut } from "../storage";
import { runLeadOSDailyCron } from "../leadosDailyCron";

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

  // Stripe webhook MUST be registered BEFORE express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Dynamic sitemap.xml for SEO
  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const db = await (await import("../db")).getDb();
      let blogSlugs: { slug: string; updatedAt: Date }[] = [];
      if (db) {
        const { blogPosts } = await import("../../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        blogSlugs = await db
          .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
          .from(blogPosts)
          .where(eq(blogPosts.status, "published"));
      }
      const base = "https://deep-sleep-reset.com";
      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "weekly" },
        { url: "/blog", priority: "0.9", changefreq: "daily" },
        { url: "/order", priority: "0.8", changefreq: "monthly" },
      ];
      const now = new Date().toISOString().split("T")[0];
      const urls = [
        ...staticPages.map(p => `<url><loc>${base}${p.url}</loc><lastmod>${now}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`),
        ...blogSlugs.map(b => `<url><loc>${base}/blog/${b.slug}</loc><lastmod>${b.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`),
      ];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;
      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (err) {
      console.error("[Sitemap] Error:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // robots.txt
  app.get("/robots.txt", (_req, res) => {
    res.set("Content-Type", "text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: https://deep-sleep-reset.com/sitemap.xml`);
  });

  // Testimonial media upload endpoint
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 16 * 1024 * 1024 } });
  app.post("/api/upload/testimonial", upload.single("file"), async (req: express.Request & { file?: Express.Multer.File }, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }
      const ext = req.file.originalname.split(".").pop() ?? "bin";
      const key = `testimonials/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { url } = await storagePut(key, req.file.buffer, req.file.mimetype);
      res.json({ url });
    } catch (err) {
      console.error("[Upload] Testimonial upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
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
  });
}

startServer().catch(console.error);

// Instagram Autopilot cron — runs every 5 minutes
setInterval(() => {
  igCronTick().catch(e => console.error("[IG Cron] Uncaught error:", e));
}, 5 * 60 * 1000);

// Also run once on startup after a short delay
setTimeout(() => {
  igCronTick().catch(e => console.error("[IG Cron] Startup error:", e));
}, 30 * 1000);

// LeadOS Daily Summary — runs every hour, fires actual report at midnight UTC
setInterval(() => {
  runLeadOSDailyCron().catch(e => console.error("[LeadOS Cron] Uncaught error:", e));
}, 60 * 60 * 1000);

// Also run once on startup after 60 seconds (to catch any missed midnight reports)
setTimeout(() => {
  runLeadOSDailyCron().catch(e => console.error("[LeadOS Cron] Startup error:", e));
}, 60 * 1000);
