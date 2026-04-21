import { Link } from "wouter";
import { blogPosts } from "@/data/blogPosts";
import { Helmet } from "react-helmet-async";

export default function BlogList() {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  const categoryColors: Record<string, string> = {
    "Sleep Science": "bg-indigo-900/60 text-indigo-300 border border-indigo-700/50",
    "Sleep Optimization": "bg-amber-900/60 text-amber-300 border border-amber-700/50",
    "Sleep Remedies": "bg-emerald-900/60 text-emerald-300 border border-emerald-700/50",
    Insomnia: "bg-rose-900/60 text-rose-300 border border-rose-700/50",
  };

  return (
    <>
      <Helmet>
        <title>Sleep Science Blog — Deep Sleep Reset</title>
        <meta
          name="description"
          content="Evidence-based articles on sleep science, chronotypes, insomnia treatment, and sleep optimization. Backed by research, written for real people."
        />
        <link rel="canonical" href="https://deepsleep.quest/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Deep Sleep Reset Blog",
            url: "https://deepsleep.quest/blog",
            description: "Evidence-based sleep science articles",
            publisher: {
              "@type": "Organization",
              name: "Deep Sleep Reset",
              url: "https://deepsleep.quest",
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-[#0d0b1a]">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1535] to-[#0d0b1a] py-20 px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_70%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-900/30 border border-violet-700/40 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Sleep Science Research
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              The Deep Sleep{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                Knowledge Base
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Evidence-based articles on sleep science, chronotypes, insomnia, and optimization. No fluff — just
              research that works.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* Featured Post */}
          {sortedPosts.length > 0 && (
            <div className="mb-12">
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-4">Featured Article</p>
              <Link href={`/blog/${sortedPosts[0].slug}`}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-amber-500/30 transition-all duration-300 cursor-pointer">
                  <div className="md:flex">
                    <div className="md:w-1/2 h-64 md:h-auto overflow-hidden">
                      <img
                        src={sortedPosts[0].imageUrl}
                        alt={sortedPosts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-center">
                      <span
                        className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full mb-4 w-fit ${categoryColors[sortedPosts[0].category] || "bg-slate-800 text-slate-300"}`}
                      >
                        {sortedPosts[0].category}
                      </span>
                      <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-amber-400 transition-colors leading-tight">
                        {sortedPosts[0].title}
                      </h2>
                      <p className="text-slate-400 mb-6 line-clamp-3">{sortedPosts[0].excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>
                          {new Date(sortedPosts[0].publishedAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span>·</span>
                        <span>{sortedPosts[0].readTime} min read</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Rest of Posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPosts.slice(1).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <article className="group h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-amber-500/30 transition-all duration-300 cursor-pointer flex flex-col">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <span
                      className={`inline-flex text-xs font-semibold px-3 py-1 rounded-full mb-3 w-fit ${categoryColors[post.category] || "bg-slate-800 text-slate-300"}`}
                    >
                      {post.category}
                    </span>
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors leading-tight flex-1">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-auto">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* CTA Banner */}
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-violet-900/40 to-amber-900/30 border border-amber-500/20 p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Ready to Fix Your Sleep?</h3>
            <p className="text-slate-400 mb-6 max-w-lg mx-auto">
              Take the free 60-second chronotype quiz and get a personalized 7-Night Deep Sleep Protocol.
            </p>
            <Link href="/quiz">
              <button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                Take the Free Quiz →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
