import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Moon, Clock, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "insomnia", label: "Insomnia" },
  { value: "cbt-i", label: "CBT-I" },
  { value: "anxiety", label: "Anxiety" },
  { value: "sleep-science", label: "Sleep Science" },
  { value: "lifestyle", label: "Lifestyle" },
];

const CATEGORY_COLORS: Record<string, string> = {
  insomnia: "bg-red-500/15 text-red-300 border-red-500/20",
  "cbt-i": "bg-amber/15 text-amber border-amber/20",
  anxiety: "bg-purple-500/15 text-purple-300 border-purple-500/20",
  "sleep-science": "bg-blue-500/15 text-blue-300 border-blue-500/20",
  lifestyle: "bg-green-500/15 text-green-300 border-green-500/20",
};

export default function Blog() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const LIMIT = 9;

  const { data, isLoading } = trpc.blog.list.useQuery({
    category: category || undefined,
    limit: LIMIT,
    offset,
  });

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;

  const filtered = search
    ? posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase())
      )
    : posts;

  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || filtered.indexOf(p) > 0);

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

      {/* Hero */}
      <section className="py-16 lg:py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/3 to-transparent" />
        <div className="relative max-w-3xl mx-auto px-4">
          <p className="text-amber/70 text-sm uppercase tracking-[0.3em] mb-4 font-medium">Sleep Science Blog</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Evidence-Based Sleep Advice
          </h1>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Science-backed articles on insomnia, CBT-I, sleep anxiety, and everything you need to finally sleep through the night.
          </p>
          {/* Search */}
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-card/50 border-border/40"
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setOffset(0); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                category === cat.value
                  ? "bg-amber text-background border-amber"
                  : "border-border/40 text-foreground/60 hover:border-amber/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card/30 animate-pulse h-72" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-foreground/40">
            <Moon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No articles found.</p>
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <div className="group mb-10 rounded-2xl border border-amber/20 bg-card/30 hover:bg-card/50 hover:border-amber/40 transition-all overflow-hidden cursor-pointer">
                  <div className="grid md:grid-cols-2 gap-0">
                    {featured.heroImageUrl && (
                      <div className="h-64 md:h-auto overflow-hidden">
                        <img
                          src={featured.heroImageUrl}
                          alt={featured.heroImageAlt || featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[featured.category] || "bg-card/50 text-foreground/60 border-border/30"}`}>
                          {featured.category}
                        </span>
                        <span className="text-xs text-foreground/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {featured.readTimeMinutes} min read
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-3 group-hover:text-amber transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      <p className="text-foreground/60 text-sm leading-relaxed mb-4 line-clamp-3">
                        {featured.excerpt}
                      </p>
                      <span className="text-amber text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read article <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Article grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article className="group rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 hover:border-amber/30 transition-all overflow-hidden cursor-pointer h-full flex flex-col">
                    {post.heroImageUrl && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.heroImageUrl}
                          alt={post.heroImageAlt || post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLORS[post.category] || "bg-card/50 text-foreground/60 border-border/30"}`}>
                          {post.category}
                        </span>
                        <span className="text-xs text-foreground/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {post.readTimeMinutes} min
                        </span>
                      </div>
                      <h3 className="font-bold text-base mb-2 group-hover:text-amber transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-foreground/55 text-sm leading-relaxed flex-1 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 text-amber text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex justify-center gap-3 mt-12">
                <Button
                  variant="outline"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - LIMIT))}
                >
                  ← Previous
                </Button>
                <span className="flex items-center text-foreground/50 text-sm">
                  Page {Math.floor(offset / LIMIT) + 1} of {Math.ceil(total / LIMIT)}
                </span>
                <Button
                  variant="outline"
                  disabled={offset + LIMIT >= total}
                  onClick={() => setOffset(offset + LIMIT)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}

        {/* CTA Banner */}
        <div className="mt-16 rounded-2xl border border-amber/20 bg-gradient-to-r from-amber/5 to-transparent p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready to Fix Your Sleep?</h2>
          <p className="text-foreground/60 mb-6">The 7-Night Deep Sleep Reset — science-backed CBT-I protocol for just $5.</p>
          <Link href="/order">
            <Button className="bg-amber text-background hover:bg-amber/90 font-semibold px-8 py-3 text-base">
              Start Tonight — $5
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8 text-center text-foreground/30 text-sm">
        <p>© {new Date().getFullYear()} Deep Sleep Reset. All rights reserved.</p>
        <p className="mt-1">
          <Link href="/" className="hover:text-foreground/60 transition-colors">Home</Link>
          {" · "}
          <Link href="/blog" className="hover:text-foreground/60 transition-colors">Blog</Link>
          {" · "}
          <Link href="/order" className="hover:text-foreground/60 transition-colors">Get the Reset</Link>
        </p>
      </footer>
    </div>
  );
}
