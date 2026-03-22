import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

// Per-route OG tag overrides for Facebook/Twitter link previews
const OG_BASE_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/og-image-deep-sleep-reset-iuqNLSiYwD4GE7vign5amW.png";

interface OgMeta { title: string; description: string; url: string; image: string; }

function getOgMeta(pathname: string): OgMeta {
  const base = "https://deep-sleep-reset.com";
  if (pathname.startsWith("/order")) {
    return {
      title: "Get the 7-Night Deep Sleep Reset — Just $5",
      description: "Science-backed CBT-I protocol. Fix insomnia in 7 nights. No pills, no apps. Trusted by 10,000+ people.",
      url: `${base}/order`,
      image: OG_BASE_IMAGE,
    };
  }
  if (pathname.startsWith("/thank-you")) {
    return {
      title: "Thank You — Your Deep Sleep Reset is Ready",
      description: "Check your email for access. Your 7-night sleep transformation starts tonight.",
      url: `${base}/thank-you`,
      image: OG_BASE_IMAGE,
    };
  }
  // Default — homepage
  return {
    title: "Deep Sleep Reset — Fix Insomnia in 7 Nights",
    description: "Science-backed 7-night protocol to fix your broken sleep cycle. CBT-I based. No pills. No apps. Just sleep.",
    url: `${base}/`,
    image: OG_BASE_IMAGE,
  };
}

function injectOgTags(html: string, og: OgMeta): string {
  const replacements: [RegExp, string][] = [
    [/<meta property="og:title" content="[^"]*" \/>/,         `<meta property="og:title" content="${og.title}" />`],
    [/<meta property="og:description" content="[^"]*" \/>/,   `<meta property="og:description" content="${og.description}" />`],
    [/<meta property="og:url" content="[^"]*" \/>/,           `<meta property="og:url" content="${og.url}" />`],
    [/<meta name="twitter:title" content="[^"]*" \/>/,        `<meta name="twitter:title" content="${og.title}" />`],
    [/<meta name="twitter:description" content="[^"]*" \/>/,  `<meta name="twitter:description" content="${og.description}" />`],
  ];
  let result = html;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      // Inject per-route OG tags before Vite transforms the HTML
      const og = getOgMeta(req.path);
      template = injectOgTags(template, og);
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html — inject per-route OG tags for social crawlers
  app.use("*", (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    fs.readFile(indexPath, "utf-8", (err, html) => {
      if (err) return res.status(500).send("Internal Server Error");
      const og = getOgMeta(req.path);
      const injected = injectOgTags(html, og);
      res.status(200).set({ "Content-Type": "text/html" }).end(injected);
    });
  });
}
