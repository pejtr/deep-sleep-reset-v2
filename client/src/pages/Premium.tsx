import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ─── Klein Principle: Identity-first brand positioning ───────────────────────
// Not "buy a product" — "become a Sleep Optimizer"
// The brand represents resistance to the "average exhausted world"

const SUBSCRIPTION_TIERS = [
  {
    key: "basic",
    name: "Sleep Optimizer",
    tagline: "Start your transformation",
    price: "$9.99",
    priceMonthly: 999,
    originalPrice: "$47",
    interval: "/ month",
    features: [
      { text: "Monthly Sleep Protocol Update (PDF)", value: "$19 value" },
      { text: "Weekly Sleep Tips Email", value: "$9 value" },
      { text: "Chronotype-specific meal timing guide", value: "$15 value" },
      { text: "Access to Sleep Optimizer community", value: "$27 value" },
      { text: "Cancel anytime", value: null },
    ],
    totalValue: "$70",
    badge: null,
    cardClass: "glass-card",
    ctaClass: "bg-[oklch(0.2_0.04_265)] hover:bg-[oklch(0.25_0.05_265)] border border-[oklch(0.35_0.05_265)]",
    ctaText: "Start Basic →",
    color: "oklch(0.65 0.18 250)",
    icon: "🌙",
  },
  {
    key: "pro",
    name: "Sleep Optimizer Pro",
    tagline: "The complete sleep system",
    price: "$27",
    priceMonthly: 2700,
    originalPrice: "$275",
    interval: "/ month",
    features: [
      { text: "Everything in Basic", value: null },
      { text: "Weekly AI Sleep Score Report", value: "$47 value" },
      { text: "Monthly Live Q&A Recording", value: "$67 value" },
      { text: "Exclusive Bonus Guides (2/month)", value: "$37 value" },
      { text: "Private Sleep Optimizers Community", value: "$27 value" },
      { text: "Priority email support", value: "$19 value" },
      { text: "Early access to new protocols", value: "$29 value" },
    ],
    totalValue: "$275",
    badge: "MOST POPULAR",
    cardClass: "subscription-card-pro",
    ctaClass: "cta-premium",
    ctaText: "Join Pro — $27/mo →",
    color: "oklch(0.65 0.22 280)",
    icon: "⚡",
  },
  {
    key: "elite",
    name: "Sleep Optimizer Elite",
    tagline: "Maximum performance",
    price: "$47",
    priceMonthly: 4700,
    originalPrice: "$497",
    interval: "/ month",
    features: [
      { text: "Everything in Pro", value: null },
      { text: "Personal Sleep Score Dashboard", value: "$97 value" },
      { text: "Monthly AI coaching session", value: "$147 value" },
      { text: "VIP community badge & recognition", value: "$27 value" },
      { text: "Lifetime access to all past protocols", value: "$97 value" },
      { text: "First access to new products (free)", value: "$47 value" },
      { text: "Quarterly deep-dive sleep audit", value: "$97 value" },
    ],
    totalValue: "$497",
    badge: "BEST VALUE",
    cardClass: "subscription-card-elite",
    ctaClass: "bg-gradient-to-r from-[oklch(0.75_0.18_65)] to-[oklch(0.65_0.2_45)] hover:opacity-90",
    ctaText: "Go Elite — $47/mo →",
    color: "oklch(0.75 0.18 65)",
    icon: "👑",
  },
];

const COMMUNITY_PROOF = [
  { name: "Alex R.", city: "New York", tier: "Pro", text: "The weekly AI report showed me I was sleeping 47 min less than optimal. Fixed it in 3 days.", avatar: "A" },
  { name: "Maria K.", city: "London", tier: "Elite", text: "The quarterly audit was eye-opening. I had no idea my evening screen time was destroying my sleep quality.", avatar: "M" },
  { name: "James T.", city: "Sydney", tier: "Pro", text: "The community alone is worth it. People share their chronotype hacks and it's genuinely useful.", avatar: "J" },
  { name: "Priya S.", city: "Mumbai", tier: "Basic", text: "Monthly guides are excellent quality. Each one focuses on a different aspect of sleep optimization.", avatar: "P" },
];

export default function Premium() {
  const [, setLocation] = useLocation();
  const [selectedTier, setSelectedTier] = useState("pro");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState({ h: 11, m: 47, s: 23 });

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Track page view
  useEffect(() => {
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "premium", ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleSubscribe = async (tierKey: string) => {
    setIsLoading(true);
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "subscription_click", page: "premium", tier: tierKey, ts: Date.now() }),
    }).catch(() => {});

    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Fallback: redirect to order page with subscription param
        setLocation(`/order?subscription=${tierKey}`);
      }
    } catch {
      setLocation(`/order?subscription=${tierKey}`);
    } finally {
      setIsLoading(false);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen stars-premium relative overflow-x-hidden">
      {/* Floating orbs */}
      <div className="orb orb-purple w-[500px] h-[500px] top-[-150px] right-[-150px] animate-parallax" />
      <div className="orb orb-gold w-[300px] h-[300px] bottom-[20%] left-[-100px] animate-parallax stagger-3" />

      {/* Back nav */}
      <div className="relative z-10 p-4">
        <button
          onClick={() => setLocation("/")}
          className="text-[oklch(0.55_0.04_265)] hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          ← Back to home
        </button>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-8 pb-16 px-4 text-center">
        {/* Klein principle: Identity badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.65_0.22_280/0.12)] border border-[oklch(0.65_0.22_280/0.35)] text-[oklch(0.75_0.18_280)] text-xs font-bold uppercase tracking-widest mb-6">
          ✦ Sleep Optimizers Community
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 leading-tight max-w-3xl mx-auto">
          Stop being average.<br />
          <span className="text-gradient-animated font-display italic">Become a Sleep Optimizer.</span>
        </h1>

        <p className="text-lg text-[oklch(0.68_0.04_265)] mb-6 max-w-2xl mx-auto leading-relaxed">
          The Sleep Optimizers Community is for high-performers who refuse to accept chronic exhaustion as normal.
          Monthly science-backed protocols, AI-powered sleep analysis, and a tribe of people who optimize everything — including their sleep.
        </p>

        {/* Klein: "This is who we are" manifesto */}
        <div className="max-w-2xl mx-auto glass-card p-6 rounded-2xl mb-10 text-left">
          <p className="text-sm text-[oklch(0.65_0.04_265)] italic leading-relaxed">
            "We believe that sleep is not a passive activity — it's a performance tool. 
            Every Sleep Optimizer understands that the quality of your sleep determines the quality of your life. 
            We don't accept 'tired but functional.' We demand <strong className="text-white">deeply rested and fully alive.</strong>"
          </p>
          <p className="text-xs text-[oklch(0.5_0.04_265)] mt-3">— The Sleep Optimizers Manifesto</p>
        </div>

        {/* Urgency countdown */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-[oklch(0.65_0.15_30/0.12)] border border-[oklch(0.65_0.15_30/0.3)] mb-4">
          <span className="text-[oklch(0.75_0.18_30)] text-sm font-bold">🔥 Founding member pricing ends in:</span>
          <div className="flex items-center gap-1 font-mono font-black text-white text-lg">
            <span className="animate-countdown-tick">{pad(countdown.h)}</span>
            <span className="text-[oklch(0.5_0.04_265)]">:</span>
            <span className="animate-countdown-tick">{pad(countdown.m)}</span>
            <span className="text-[oklch(0.5_0.04_265)]">:</span>
            <span className="animate-countdown-tick">{pad(countdown.s)}</span>
          </div>
        </div>
      </section>

      {/* ── PRICING TIERS ────────────────────────────────────────────────────── */}
      <section className="relative z-10 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {SUBSCRIPTION_TIERS.map((tier) => (
              <div
                key={tier.key}
                className={`${tier.cardClass} rounded-2xl p-6 relative cursor-pointer transition-all duration-300 ${selectedTier === tier.key ? "scale-[1.02]" : ""}`}
                onClick={() => setSelectedTier(tier.key)}
              >
                {/* Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={tier.key === "elite" ? "badge-premium" : "badge-popular"}>
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Tier header */}
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">{tier.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-1">{tier.name}</h3>
                  <p className="text-xs text-[oklch(0.55_0.04_265)]">{tier.tagline}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-[oklch(0.55_0.04_265)] text-sm">{tier.interval}</span>
                  </div>
                  <p className="text-xs text-[oklch(0.45_0.04_265)] mt-1">
                    <span className="line-through">{tier.originalPrice} value</span>
                    <span className="text-green-400 ml-2">→ {tier.totalValue} total value</span>
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-[0.6rem] font-bold flex-shrink-0 mt-0.5">✓</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-[oklch(0.78_0.03_265)] text-xs">{f.text}</span>
                        {f.value && (
                          <span className="text-[oklch(0.45_0.04_265)] text-[0.65rem] line-through ml-1">{f.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSubscribe(tier.key); }}
                  disabled={isLoading}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all ${tier.ctaClass} ${isLoading && selectedTier === tier.key ? "opacity-70 cursor-not-allowed" : ""}`}
                >
                  {isLoading && selectedTier === tier.key ? "Loading..." : tier.ctaText}
                </button>

                <p className="text-center text-[0.65rem] text-[oklch(0.4_0.03_265)] mt-2">Cancel anytime · No commitment</p>
              </div>
            ))}
          </div>

          {/* Comparison note */}
          <p className="text-center text-xs text-[oklch(0.45_0.04_265)] mt-6">
            All plans include 7-day free trial · Billed monthly · Cancel anytime · Secure payment via Stripe
          </p>
        </div>
      </section>

      {/* ── WHAT YOU GET ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_265)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            Inside the Community
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-12 text-white">
            What Sleep Optimizers get every month
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "📋",
                title: "Monthly Sleep Protocol",
                desc: "A new science-backed sleep optimization protocol every month. Topics include: sleep pressure management, circadian rhythm hacking, stress-sleep connection, nutrition timing, and more.",
                value: "$19/month value",
              },
              {
                icon: "🤖",
                title: "Weekly AI Sleep Score Report",
                desc: "Our AI analyzes your chronotype data and sleep patterns to generate a personalized weekly score with specific, actionable recommendations for improvement.",
                value: "$47/month value",
              },
              {
                icon: "🎙️",
                title: "Monthly Q&A Recording",
                desc: "Every month we host a live Q&A session with sleep optimization experts. Members get the full recording plus a summary of key insights.",
                value: "$67/month value",
              },
              {
                icon: "👥",
                title: "Private Community Access",
                desc: "Join a community of high-performers who take sleep seriously. Share results, ask questions, get accountability, and discover what's working for people with your chronotype.",
                value: "$27/month value",
              },
              {
                icon: "📚",
                title: "Exclusive Bonus Guides",
                desc: "Pro and Elite members receive 2 exclusive bonus guides per month — deep dives into specific sleep topics like sleep tracking, supplement protocols, and travel sleep optimization.",
                value: "$37/month value",
              },
              {
                icon: "📊",
                title: "Personal Sleep Dashboard",
                desc: "Elite members get access to a personal sleep score dashboard that tracks their progress over time and shows trends, patterns, and optimization opportunities.",
                value: "$97/month value",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card glass-card-hover p-6 rounded-2xl flex gap-4">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-[oklch(0.62_0.04_265)] leading-relaxed mb-2">{item.desc}</p>
                  <span className="text-xs text-[oklch(0.45_0.04_265)] line-through">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITY PROOF ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            Member Stories
          </p>
          <h2 className="font-display text-3xl font-black text-center mb-12 text-white">
            What our members say
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {COMMUNITY_PROOF.map((m, i) => (
              <div key={i} className="glass-card glass-card-hover p-5 rounded-2xl">
                <p className="text-[oklch(0.8_0.03_265)] text-sm italic mb-4 leading-relaxed">"{m.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280/0.4)] to-[oklch(0.55_0.22_290/0.2)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {m.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{m.name}</div>
                    <div className="text-xs text-[oklch(0.5_0.04_265)]">{m.city} · {m.tier} member</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[oklch(0.09_0.02_265)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h2 className="font-display text-2xl md:text-3xl font-black text-white mb-4">
            30-Day Money-Back Guarantee
          </h2>
          <p className="text-[oklch(0.65_0.04_265)] leading-relaxed mb-8">
            Try any plan for 30 days. If you don't see measurable improvement in your sleep quality, 
            we'll refund every penny — no questions asked. We're that confident in the results.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="trust-badge">🔒 Secure payment</span>
            <span className="trust-badge">↩ 30-day refund</span>
            <span className="trust-badge">⚡ Instant access</span>
            <span className="trust-badge">❌ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="orb orb-purple w-[600px] h-[600px] bottom-[-200px] left-[50%] -translate-x-1/2" style={{ opacity: 0.1 }} />
        <div className="max-w-xl mx-auto relative z-10">
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Ready to become a<br />
            <span className="text-gradient-animated font-display italic">Sleep Optimizer?</span>
          </h2>
          <p className="text-[oklch(0.62_0.04_265)] mb-10">
            Join thousands of high-performers who've taken control of their sleep — and their life.
          </p>
          <button
            onClick={() => handleSubscribe("pro")}
            disabled={isLoading}
            className="cta-premium cta-shimmer inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white mb-4"
          >
            <span>⚡</span>
            Join Pro — $27/month
          </button>
          <p className="text-xs text-[oklch(0.45_0.04_265)]">
            7-day free trial · Cancel anytime · Instant access
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[oklch(0.15_0.03_265)] text-center text-xs text-[oklch(0.4_0.03_265)]">
        <p>© 2025 Deep Sleep Reset · Sleep Optimizers Community</p>
        <p className="mt-1">
          <a href="/" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Home</a>
          {" · "}
          <a href="/privacy" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Privacy</a>
          {" · "}
          <a href="/terms" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Terms</a>
        </p>
      </footer>
    </div>
  );
}
