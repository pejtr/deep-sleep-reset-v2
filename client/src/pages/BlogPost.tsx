import { useParams, Link } from "wouter";
import { getBlogPost, getRecentPosts } from "@/data/blogPosts";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPost(slug);
  const recentPosts = getRecentPosts(3).filter((p) => p.slug !== slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0d0b1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-2xl font-bold text-white mb-2">Article Not Found</h1>
          <p className="text-slate-400 mb-6">This article doesn't exist or has been moved.</p>
          <Link href="/blog">
            <button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-full transition-all">
              ← Back to Blog
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Deep Sleep Reset",
      url: "https://deepsleep.quest",
    },
    publisher: {
      "@type": "Organization",
      name: "Deep Sleep Reset",
      url: "https://deepsleep.quest",
      logo: {
        "@type": "ImageObject",
        url: "https://deepsleep.quest/favicon.ico",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://deepsleep.quest/blog/${post.slug}`,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://deepsleep.quest" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://deepsleep.quest/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://deepsleep.quest/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={`https://deepsleep.quest/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:image" content={post.imageUrl} />
        <meta property="og:url" content={`https://deepsleep.quest/blog/${post.slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={post.imageUrl} />
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-[#0d0b1a]">
        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 pt-8 pb-2">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/">
              <span className="hover:text-amber-400 cursor-pointer transition-colors">Home</span>
            </Link>
            <span>/</span>
            <Link href="/blog">
              <span className="hover:text-amber-400 cursor-pointer transition-colors">Blog</span>
            </Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
          </nav>
        </div>

        {/* Hero Image */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="rounded-2xl overflow-hidden h-64 md:h-96">
            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-3xl mx-auto px-4 py-12">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="bg-amber-900/40 text-amber-300 border border-amber-700/40 text-xs font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-slate-500 text-sm">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-slate-500 text-sm">· {post.readTime} min read</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{post.title}</h1>

          {/* Excerpt */}
          <p className="text-lg text-slate-300 mb-8 leading-relaxed border-l-4 border-amber-500/50 pl-4 italic">
            {post.excerpt}
          </p>

          {/* Article Body */}
          <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4 prose-strong:text-white prose-a:text-amber-400 prose-a:no-underline hover:prose-a:text-amber-300 prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:mb-1 prose-table:border-collapse prose-th:bg-white/10 prose-th:text-white prose-th:p-3 prose-th:text-left prose-td:text-slate-300 prose-td:p-3 prose-td:border-b prose-td:border-white/10 prose-blockquote:border-amber-500 prose-blockquote:text-slate-400 prose-blockquote:italic">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-sm text-slate-500 mb-3">Tags:</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="bg-white/5 border border-white/10 text-slate-400 text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-2xl bg-gradient-to-r from-violet-900/50 to-amber-900/30 border border-amber-500/20 p-8 text-center">
            <div className="text-3xl mb-3">🌙</div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to Sleep Better Tonight?</h3>
            <p className="text-slate-400 mb-6 text-sm max-w-md mx-auto">
              Take the free 60-second chronotype quiz and get your personalized 7-Night Deep Sleep Protocol for just $1.
            </p>
            <Link href="/quiz">
              <button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95">
                Discover My Chronotype →
              </button>
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        {recentPosts.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="border-t border-white/10 pt-12">
              <h2 className="text-2xl font-bold text-white mb-8">More Sleep Science</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.map((related) => (
                  <Link key={related.slug} href={`/blog/${related.slug}`}>
                    <article className="group overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-amber-500/30 transition-all duration-300 cursor-pointer">
                      <div className="h-40 overflow-hidden">
                        <img
                          src={related.imageUrl}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors leading-tight mb-2">
                          {related.title}
                        </h3>
                        <p className="text-xs text-slate-500">{related.readTime} min read</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
