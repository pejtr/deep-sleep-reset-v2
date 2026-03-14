import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Moon, Clock, ArrowLeft, Star, MessageSquare, Send, ChevronRight } from "lucide-react";
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

      {/* Comments Section */}
      <CommentsSection postId={post.id} />
      {/* Footer */}
      <footer className="border-t border-border/20 py-8 text-center text-foreground/30 text-sm">
        <p>© {new Date().getFullYear()} Deep Sleep Reset. All rights reserved.</p>
      </footer>
    </div>
  );
}

// ─── Comments Section Component ─────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hovered || value)
                ? "fill-amber text-amber"
                : "text-foreground/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function CommentsSection({ postId }: { postId: number }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { data: comments = [], refetch } = trpc.blog.listComments.useQuery({ postId });
  const addComment = trpc.blog.addComment.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setName(""); setEmail(""); setBody(""); setRating(0);
      toast.success("Comment submitted! It will appear after moderation.");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const avgRating = comments.length > 0
    ? (comments.filter(c => c.rating).reduce((s, c) => s + (c.rating || 0), 0) / comments.filter(c => c.rating).length)
    : 0;

  return (
    <section className="max-w-2xl mx-auto px-4 mt-16 mb-12">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-amber" />
        <h2 className="text-xl font-bold">Reader Comments</h2>
        {comments.length > 0 && (
          <span className="text-sm text-foreground/40 ml-auto">{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
        )}
      </div>

      {/* Average rating */}
      {avgRating > 0 && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-amber/5 border border-amber/15">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(avgRating) ? "fill-amber text-amber" : "text-foreground/20"}`} />
            ))}
          </div>
          <span className="text-sm font-medium">{avgRating.toFixed(1)} / 5</span>
          <span className="text-sm text-foreground/40">({comments.filter(c => c.rating).length} rating{comments.filter(c => c.rating).length !== 1 ? "s" : ""})</span>
        </div>
      )}

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-border/20 bg-card/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{c.authorName}</span>
                <div className="flex items-center gap-2">
                  {c.rating && (
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= c.rating! ? "fill-amber text-amber" : "text-foreground/20"}`} />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-foreground/30">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-foreground/40 text-sm mb-8">Be the first to leave a comment!</p>
      )}

      {/* Comment form */}
      {!submitted ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !body.trim()) return;
            addComment.mutate({ postId, authorName: name, authorEmail: email || undefined, body, rating: rating || undefined });
          }}
          className="space-y-4 p-6 rounded-2xl border border-border/20 bg-card/20"
        >
          <h3 className="font-semibold text-base">Leave a Comment</h3>
          <div className="space-y-1">
            <label className="text-xs text-foreground/50 uppercase tracking-wider">Your Rating (optional)</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-foreground/50 uppercase tracking-wider">Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-foreground/50 uppercase tracking-wider">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Not shown publicly"
                className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber/50"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-foreground/50 uppercase tracking-wider">Comment *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              required
              rows={4}
              placeholder="Share your experience or thoughts..."
              className="w-full bg-background/50 border border-border/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber/50 resize-none"
            />
          </div>
          <Button
            type="submit"
            disabled={addComment.isPending || !name.trim() || !body.trim()}
            className="bg-amber text-background hover:bg-amber/90 font-semibold gap-2"
          >
            <Send className="w-4 h-4" />
            {addComment.isPending ? "Submitting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-amber/20 bg-amber/5 text-center">
          <p className="font-semibold text-amber mb-1">Thank you for your comment!</p>
          <p className="text-sm text-foreground/50">It will appear after moderation (usually within 24 hours).</p>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-xs text-foreground/40 hover:text-foreground/60 underline">Leave another comment</button>
        </div>
      )}
    </section>
  );
}
