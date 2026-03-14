import { useEffect } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Moon, Clock, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";

const CATEGORY_COLORS: Record<string, string> = {
  insomnia: "bg-red-500/15 text-red-300 border-red-500/20",
  "cbt-i": "bg-amber/15 text-amber border-amber/20",
  anxiety: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  "sleep-science": "bg-blue-500/15 text-blue-300 border-blue-500/20",
  lifestyle: "bg-green-500/15 text-green-300 border-green-500/20",
};

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: post, isLoading, error } = trpc.blog.bySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  // Update document meta tags for SEO
  useEffect(() => {
    if (!post) return;

    document.title = `${post.title} | Deep Sleep Reset`;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", post.metaDescription || post.excerpt || "");

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `https://deep-sleep-reset.com/blog/${post.slug}`);

    // OG tags
    const ogTags: Record<string, string> = {
      "og:title": post.title,
      "og:description": post.metaDescription || post.excerpt || "",
      "og:url": `https://deep-sleep-reset.com/blog/${post.slug}`,
      "og:type": "article",
      "og:image": post.heroImageUrl || "https://deep-sleep-reset.com/og-image.jpg",
      "twitter:card": "summary_large_image",
      "twitter:title": post.title,
      "twitter:description": post.metaDescription || post.excerpt || "",
    };
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        if (property.startsWith("twitter:")) {
          tag.setAttribute("name", property);
        } else {
          tag.setAttribute("property", property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // JSON-LD Article schema
    const existingSchema = document.getElementById("blog-post-schema");
    if (existingSchema) existingSchema.remove();

    const faqItems = post.faqSchema ? (() => {
      try {
        const parsed = JSON.parse(post.faqSchema);
        return Array.isArray(parsed) ? parsed : [];
      } catch { return []; }
    })() : [];

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.metaDescription || post.excerpt,
      "author": { "@type": "Organization", "name": "Deep Sleep Reset Team" },
      "publisher": {
        "@type": "Organization",
        "name": "Deep Sleep Reset",
        "url": "https://deep-sleep-reset.com",
      },
      "datePublished": post.publishedAt?.toISOString(),
      "dateModified": post.updatedAt?.toISOString(),
      "url": `https://deep-sleep-reset.com/blog/${post.slug}`,
      "image": post.heroImageUrl,
      "keywords": [post.focusKeyword, ...(post.secondaryKeywords ? JSON.parse(post.secondaryKeywords) : [])].filter(Boolean).join(", "),
    };

    const schemas: object[] = [articleSchema];

    if (faqItems.length > 0) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map((faq: { question: string; answer: string }) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
      });
    }

    const script = document.createElement("script");
    script.id = "blog-post-schema";
    script.type = "application/ld+json";
    script.text = JSON.stringify(schemas);
    document.head.appendChild(script);

    return () => {
      document.title = "Deep Sleep Reset — Fix Your Sleep in 7 Nights";
      document.getElementById("blog-post-schema")?.remove();
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Moon className="w-10 h-10 text-amber mx-auto mb-4 animate-pulse" />
          <p className="text-foreground/50">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center px-4">
        <div>
          <Moon className="w-12 h-12 text-amber/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-foreground/50 mb-6">This article may have been moved or removed.</p>
          <Link href="/blog">
            <Button variant="outline">← Back to Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-semibold text-amber tracking-wide">Deep Sleep Reset</span>
          </Link>
          <Link href="/order">
            <Button size="sm" className="bg-amber text-background hover:bg-amber/90 font-semibold">
              Get the Reset — $5
            </Button>
          </Link>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 pt-6 pb-2">
        <nav className="flex items-center gap-1 text-sm text-foreground/40">
          <Link href="/" className="hover:text-foreground/70 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/blog" className="hover:text-foreground/70 transition-colors">Blog</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground/60 truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 pb-24">
        {/* Category + meta */}
        <div className="flex items-center gap-3 mt-4 mb-5">
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[post.category] || "bg-card/50 text-foreground/60 border-border/30"}`}>
            {post.category}
          </span>
          <span className="text-sm text-foreground/40 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {post.readTimeMinutes} min read
          </span>
          {post.publishedAt && (
            <span className="text-sm text-foreground/30">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-foreground/65 leading-relaxed mb-8 border-l-2 border-amber/40 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Hero image */}
        {post.heroImageUrl && (
          <div className="rounded-xl overflow-hidden mb-8">
            <img
              src={post.heroImageUrl}
              alt={post.heroImageAlt || post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Article body */}
        <div className="prose prose-invert prose-amber max-w-none
          prose-headings:font-bold prose-headings:text-foreground
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-foreground/75 prose-p:leading-relaxed prose-p:mb-4
          prose-li:text-foreground/75 prose-li:mb-1
          prose-strong:text-foreground prose-strong:font-semibold
          prose-a:text-amber prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-amber/40 prose-blockquote:text-foreground/60">
          <Streamdown>{post.body}</Streamdown>
        </div>

        {/* Author */}
        <div className="mt-12 pt-8 border-t border-border/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center">
            <Moon className="w-6 h-6 text-amber" />
          </div>
          <div>
            <p className="font-semibold">{post.author}</p>
            <p className="text-sm text-foreground/50">Deep Sleep Reset Team</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-2xl border border-amber/25 bg-gradient-to-r from-amber/8 to-transparent p-8">
          <h2 className="text-xl font-bold mb-2">Ready to Sleep Like This Every Night?</h2>
          <p className="text-foreground/60 mb-5 text-sm leading-relaxed">
            The 7-Night Deep Sleep Reset is the CBT-I protocol described in this article — structured, step-by-step, and available for just $5. 30-day money-back guarantee.
          </p>
          <Link href="/order">
            <Button className="bg-amber text-background hover:bg-amber/90 font-semibold px-6">
              Start Tonight — $5 →
            </Button>
          </Link>
        </div>

        {/* Back to blog */}
        <div className="mt-8">
          <Link href="/blog">
            <button className="flex items-center gap-2 text-foreground/50 hover:text-foreground/80 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 text-center text-foreground/30 text-sm">
        <p>© {new Date().getFullYear()} Deep Sleep Reset. All rights reserved.</p>
      </footer>
    </div>
  );
}
