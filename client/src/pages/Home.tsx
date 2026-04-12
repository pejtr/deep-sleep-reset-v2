import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import SocialProofToast from "@/components/SocialProofToast";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import ReviewsSection from "@/components/ReviewsSection";

// ─── A/B Test Variants ────────────────────────────────────────────────────────
const HEADLINE_VARIANTS = [
  {
    id: "A",
    headline: "Why You Sleep 8 Hours and Still Wake Up Exhausted",
    subheadline: "Discover your sleep chronotype in 60 seconds — and fix it tonight.",
    hook: "73% of people with sleep problems make this one mistake.",
  },
  {
    id: "B",
    headline: "Your Brain Isn't Broken. You're Just Sleeping at the Wrong Time.",
    subheadline: "A free 60-second quiz reveals your chronotype and exactly what to fix.",
    hook: "Science-backed. Used by 12,847 people this month.",
  },
  {
    id: "C",
    headline: "Stop Fighting Your Sleep. Start Working With Your Biology.",
    subheadline: "5 questions. 60 seconds. Your personalized Deep Sleep Reset plan.",
    hook: "People who know their chronotype fall asleep 3x faster.",
  },
  {
    id: "D",
    headline: "Every Night You Sleep Wrong, You Lose 40% of Your Brain's Recovery.",
    subheadline: "Take the free chronotype quiz and reclaim deep, restorative sleep — starting tonight.",
    hook: "Trusted by sleep coaches. Backed by chronobiology research.",
  },
];

const CTA_VARIANTS = [
  { id: "A", text: "Discover My Sleep Type →" },
  { id: "B", text: "Start Free Quiz →" },
  { id: "C", text: "Reveal My Chronotype →" },
];

const SCARCITY_MESSAGES = [
  "⚡ 47 people took this quiz in the last hour",
  "🔥 This free quiz closes at midnight",
  "⏰ 23 spots left for today's free plan",
  "📈 Your chronotype results expire in 24h",
];

function getOrSetVariant<T extends { id: string }>(key: string, variants: T[], weights?: Record<string, number>): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const found = variants.find((v) => v.id === stored);
      if (found) return found;
    }
    let chosen: T;
    if (weights && Object.keys(weights).length > 0) {
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      let rand = Math.random() * total;
      chosen = variants[0];
      for (const v of variants) {
        const w = weights[v.id] ?? (100 / variants.length);
        rand -= w;
        if (rand <= 0) { chosen = v; break; }
      }
    } else {
      chosen = variants[Math.floor(Math.random() * variants.length)];
    }
    localStorage.setItem(key, chosen.id);
    return chosen;
  } catch {
    return variants[0];
  }
}

// ─── Premium Testimonials ─────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Sarah M.",
    city: "Austin, TX",
    avatar: "S",
    text: "I've tried everything for 3 years. This quiz told me I'm a Wolf type — changed my entire sleep schedule. I sleep like a baby now.",
    stars: 5,
    result: "Wolf",
    verified: true,
    highlight: "Fell asleep in 8 min",
  },
  {
    name: "James K.",
    city: "London, UK",
    avatar: "J",
    text: "Skeptical about the $1 price. Thought it was a scam. It wasn't. The 7-night plan actually worked. I'm sleeping deeper than I have in 5 years.",
    stars: 5,
    result: "Bear",
    verified: true,
    highlight: "5 years of bad sleep fixed",
  },
  {
    name: "Priya S.",
    city: "Mumbai, India",
    avatar: "P",
    text: "The quiz was 100% accurate. I'm a Dolphin — light sleeper, anxious at night. The techniques are specifically designed for my type. Game changer.",
    stars: 5,
    result: "Dolphin",
    verified: true,
    highlight: "Anxiety at night: gone",
  },
  {
    name: "Marcus T.",
    city: "Toronto, CA",
    avatar: "M",
    text: "Night 1: fell asleep in under 10 minutes. I usually take 2 hours. Worth every penny of that $1.",
    stars: 5,
    result: "Lion",
    verified: true,
    highlight: "Night 1 results",
  },
  {
    name: "Aisha R.",
    city: "Lagos, Nigeria",
    avatar: "A",
    text: "I was waking up 4-5 times a night. After following the Bear protocol for 7 nights, I sleep through. My productivity doubled.",
    stars: 5,
    result: "Bear",
    verified: true,
    highlight: "Productivity doubled",
  },
  {
    name: "David L.",
    city: "Sydney, AU",
    avatar: "D",
    text: "The science behind this is real. I've read about chronotypes before but never had a personalized plan. This is different.",
    stars: 5,
    result: "Wolf",
    verified: true,
    highlight: "Science-backed results",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [headlineVariant, setHeadlineVariant] = useState(HEADLINE_VARIANTS[0]);
  const [ctaVariant, setCtaVariant] = useState(CTA_VARIANTS[0]);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scarcityMsg] = useState(() => SCARCITY_MESSAGES[Math.floor(Math.random() * SCARCITY_MESSAGES.length)]);
  const [visitorCount] = useState(() => Math.floor(Math.random() * 30) + 15);
  const exitShown = useRef(false);
  const emailPopupShown = useRef(false);
  const scrollDepthRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/behavior/summary")
      .then((r) => r.json())
      .then((data) => {
        const headlineWeights: Record<string, number> = {};
        const ctaWeights: Record<string, number> = {};
        if (data.abWinners) {
          for (const w of data.abWinners) {
            if (w.testName === "headline") headlineWeights[w.winner] = w.weight;
            if (w.testName === "cta_button") ctaWeights[w.winner] = w.weight;
          }
        }
        const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS, headlineWeights);
        const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS, ctaWeights);
        setHeadlineVariant(hv);
        setCtaVariant(cv);
        fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "headline", variant: hv.id, type: "impression" }) }).catch(() => {});
        fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "cta_button", variant: cv.id, type: "impression" }) }).catch(() => {});
      })
      .catch(() => {
        const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS);
        const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS);
        setHeadlineVariant(hv);
        setCtaVariant(cv);
      });

    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "home", ts: Date.now() }),
    }).catch(() => {});

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current) {
        exitShown.current = true;
        setShowExitPopup(true);
        fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "exit_intent", page: "home", ts: Date.now() }) }).catch(() => {});
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    const emailTimer = setTimeout(() => {
      if (!emailPopupShown.current) {
        emailPopupShown.current = true;
        setShowEmailPopup(true);
      }
    }, 8000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
      const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      [25, 50, 75, 100].forEach((m) => {
        if (scrollPct >= m && !scrollDepthRef.current.has(m)) {
          scrollDepthRef.current.add(m);
          fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "scroll_depth", page: "home", depth: m, ts: Date.now() }) }).catch(() => {});
        }
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(emailTimer);
    };
  }, []);

  const handleCTAClick = (source: string = "hero") => {
    fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "cta_button", variant: ctaVariant.id, type: "click" }) }).catch(() => {});
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "cta_click", page: "home", source, ts: Date.now() }) }).catch(() => {});
    setLocation("/quiz");
  };

  const handleElementClick = (element: string) => {
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "click", page: "home", element, ts: Date.now() }) }).catch(() => {});
  };

  return (
    <div className="min-h-screen stars-premium relative overflow-x-hidden">
      <SocialProofToast />

      {showExitPopup && (
        <ExitIntentPopup ctaVariant={ctaVariant.id} onClose={() => setShowExitPopup(false)} onCTA={() => handleCTAClick("exit_popup")} />
      )}
      {showEmailPopup && (
        <EmailCapturePopup onClose={() => setShowEmailPopup(false)} onCTA={() => { setShowEmailPopup(false); handleCTAClick("email_popup"); }} />
      )}

      {/* Sticky mobile CTA */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[oklch(0.07_0.02_265/0.97)] backdrop-blur-xl border-t border-[oklch(0.65_0.22_280/0.2)] md:hidden">
          <button
            onClick={() => handleCTAClick("sticky_mobile")}
            className="cta-premium cta-shimmer w-full py-4 rounded-xl font-bold text-base text-white"
          >
            {ctaVariant.text}
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-28 text-center overflow-hidden">
        {/* Floating orbs — premium depth */}
        <div className="orb orb-purple w-[600px] h-[600px] top-[-200px] right-[-200px] animate-parallax" />
        <div className="orb orb-blue w-[400px] h-[400px] bottom-[-100px] left-[-150px] animate-parallax stagger-3" />
        <div className="orb orb-purple w-[200px] h-[200px] top-[40%] left-[10%] animate-float stagger-2" style={{ opacity: 0.08 }} />

        {/* Moon — premium version */}
        <div className="absolute top-16 right-8 md:right-20 pointer-events-none">
          <div className="relative w-24 h-24 md:w-36 md:h-36">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[oklch(0.88_0.06_280)] to-[oklch(0.72_0.14_280)] opacity-15 blur-md animate-float" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[oklch(0.88_0.06_280)] to-[oklch(0.72_0.14_280)] opacity-10 animate-float stagger-1" />
            <div className="absolute inset-0 rounded-full border border-[oklch(0.88_0.06_280/0.2)] animate-float stagger-2" />
          </div>
        </div>

        {/* Live visitors badge */}
        <div className="relative z-10 mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-semibold animate-reveal">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {visitorCount} people taking this quiz right now
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Hook — premium small caps */}
          <p className="text-xs font-bold text-[oklch(0.65_0.18_280)] mb-4 uppercase tracking-[0.2em] animate-reveal stagger-1">
            {headlineVariant.hook}
          </p>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-reveal stagger-2">
            <span className="trust-badge">✓ Free · No registration</span>
            <span className="trust-badge">⏱ Results in 60 seconds</span>
            <span className="trust-badge">🔬 Science-backed</span>
          </div>

          {/* Main headline — Playfair Display for premium feel */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6 animate-reveal stagger-2">
            <span className="text-white">{headlineVariant.headline.split(".")[0]}</span>
            {headlineVariant.headline.includes(".") && (
              <>
                <span className="text-white">.</span>
                <br />
                <span className="text-gradient-animated">{headlineVariant.headline.split(".").slice(1).join(".").trim()}</span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-[oklch(0.72_0.04_265)] mb-10 leading-relaxed max-w-2xl mx-auto animate-reveal stagger-3">
            {headlineVariant.subheadline}
          </p>

          {/* Primary CTA — premium version */}
          <div className="animate-reveal stagger-4">
            <button
              onClick={() => handleCTAClick("hero_primary")}
              className="cta-premium cta-shimmer inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-lg md:text-xl text-white"
            >
              <span className="text-2xl">🌙</span>
              {ctaVariant.text}
            </button>

            <p className="mt-4 text-sm text-[oklch(0.5_0.04_265)]">
              🔒 No credit card · No spam · 100% free
            </p>

            <p className="mt-2 text-xs font-semibold text-[oklch(0.65_0.15_30)] animate-pulse">
              {scarcityMsg}
            </p>
          </div>

          {/* Social proof numbers — premium layout */}
          <div className="flex items-center justify-center gap-8 mt-12 animate-reveal stagger-5">
            {[
              { value: "12,847", label: "tests completed" },
              { value: "4.9 ★", label: "average rating" },
              { value: "7 nights", label: "to results" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-black text-white animate-count" style={{ animationDelay: `${0.6 + i * 0.1}s` }}>{stat.value}</span>
                <span className="text-xs text-[oklch(0.55_0.04_265)] mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[oklch(0.35_0.03_265)] text-xs">
          <span className="uppercase tracking-widest text-[0.6rem]">Scroll</span>
          <div className="w-5 h-8 border border-[oklch(0.25_0.03_265)] rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-[oklch(0.45_0.08_280)] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── AUTHORITY STRIP ──────────────────────────────────────────────────── */}
      <div className="section-divider" />
      <section className="py-6 px-4 bg-[oklch(0.09_0.02_265/0.8)] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: "🧬", label: "Based on Chronobiology Research" },
            { icon: "📊", label: "12,847 Tests Completed" },
            { icon: "⭐", label: "4.9/5 Average Rating" },
            { icon: "🔬", label: "Validated by Sleep Science" },
            { icon: "🌍", label: "Used in 47 Countries" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-[oklch(0.6_0.04_265)]">
              <span className="text-base">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="section-divider" />

      {/* ── PROBLEM AGITATION ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            The Hidden Problem
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-4 text-white leading-tight">
            Sound familiar?
          </h2>
          <p className="text-center text-[oklch(0.58_0.04_265)] mb-12 max-w-xl mx-auto">
            If you're nodding yes to any of these, your chronotype is the missing piece.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              "You sleep 7-8 hours but still feel tired",
              "You lie awake for 30+ minutes before falling asleep",
              "You wake up at 3am and can't fall back asleep",
              "You feel most alive after 10pm",
              "Mornings feel impossible without 2 coffees",
              "You've tried sleep tips that don't work for you",
            ].map((pain, i) => (
              <div key={i} className="glass-card glass-card-hover flex items-start gap-3 p-4 rounded-xl">
                <span className="text-red-400 text-base mt-0.5 flex-shrink-0">✗</span>
                <span className="text-[oklch(0.75_0.03_265)] text-sm">{pain}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-[oklch(0.72_0.18_280)] font-semibold mb-6 text-lg">
              The problem isn't your sleep habits.<br />
              <span className="font-display italic text-white">It's that you don't know your chronotype.</span>
            </p>
            <button
              onClick={() => handleCTAClick("problem_section")}
              className="cta-premium cta-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white"
            >
              Find My Chronotype Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── CHRONOTYPE SECTION ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_265)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            The 4 Sleep Types
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-3 text-white">
            Which sleep type are you?
          </h2>
          <p className="text-center text-[oklch(0.58_0.04_265)] mb-12 max-w-xl mx-auto">
            Science identifies 4 chronotypes. Most sleep advice is written for Bears — which is why it fails everyone else.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🦁", name: "Lion", desc: "Early riser. Peak energy at dawn.", time: "10pm–6am", pct: "15%", color: "oklch(0.75 0.18 65)" },
              { emoji: "🐻", name: "Bear", desc: "Follows the sun. Most common type.", time: "11pm–7am", pct: "55%", color: "oklch(0.65 0.22 280)" },
              { emoji: "🐺", name: "Wolf", desc: "Night owl. Creative after dark.", time: "12am–8am", pct: "20%", color: "oklch(0.6 0.2 320)" },
              { emoji: "🐬", name: "Dolphin", desc: "Light sleeper. Anxious at night.", time: "11:30pm–6:30am", pct: "10%", color: "oklch(0.6 0.18 200)" },
            ].map((type) => (
              <div
                key={type.name}
                className="glass-card glass-card-hover p-5 rounded-2xl text-center cursor-pointer group"
                onClick={() => { handleElementClick(`chronotype_${type.name}`); handleCTAClick("chronotype_card"); }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{type.emoji}</div>
                <div className="font-bold text-white mb-1 text-base">{type.name}</div>
                <div className="text-xs text-[oklch(0.55_0.04_265)] mb-3 leading-snug">{type.desc}</div>
                <div className="text-xs font-mono font-bold mb-1" style={{ color: type.color }}>{type.time}</div>
                <div className="text-xs text-[oklch(0.45_0.04_265)]">{type.pct} of people</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => handleCTAClick("chronotype_section")}
              className="cta-premium cta-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white"
            >
              Discover My Type Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            Simple 3-Step Process
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-12 text-white">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "🧠", title: "Take the quiz", desc: "5 simple questions. No registration. Results in 60 seconds." },
              { step: "02", icon: "📊", title: "Get your type", desc: "Receive your exact chronotype and optimal sleep window for your biology." },
              { step: "03", icon: "🌙", title: "Start your reset", desc: "The 7-Night Deep Sleep Reset plan for just $1 — sleep deeper from night one." },
            ].map((item, i) => (
              <div key={item.step} className="glass-card p-6 rounded-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 text-[5rem] font-black text-[oklch(0.65_0.22_280/0.04)] leading-none select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(0.65_0.22_280/0.15)] border border-[oklch(0.65_0.22_280/0.3)] flex items-center justify-center text-xs font-black text-[oklch(0.75_0.18_280)] mb-4 mx-auto">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-white mb-2 text-base">{item.title}</h3>
                  <p className="text-sm text-[oklch(0.58_0.04_265)] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_265)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            Real Results
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-3 text-white">
            Real results from real people
          </h2>
          <p className="text-center text-[oklch(0.58_0.04_265)] mb-12 text-sm">
            Verified purchases · All chronotypes · All countries
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col relative overflow-hidden">
                {/* Highlight badge */}
                <div className="absolute top-3 right-3">
                  <span className="badge-popular">{t.highlight}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                  {t.verified && (
                    <span className="ml-2 text-xs text-green-400 font-medium">✓ Verified</span>
                  )}
                </div>
                <p className="text-[oklch(0.8_0.03_265)] text-sm mb-4 italic flex-1 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-[oklch(0.22_0.03_265)]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280/0.4)] to-[oklch(0.55_0.22_290/0.2)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-[oklch(0.5_0.04_265)]">{t.city} · {t.result} type</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold text-[oklch(0.65_0.18_280)] uppercase tracking-[0.2em] mb-4">
            Hormozi Value Stack
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
            Everything you get for <span className="text-gradient-animated">$1</span>
          </h2>
          <p className="text-[oklch(0.58_0.04_265)] mb-10">
            Less than a cup of coffee. More impact than years of bad sleep advice.
          </p>
          <div className="space-y-2 mb-8 text-left">
            {[
              { item: "Chronotype Quiz + Personalized Result", value: "$19" },
              { item: "7-Night Deep Sleep Reset PDF Guide", value: "$29" },
              { item: "Your Custom Sleep Schedule", value: "$15" },
              { item: "4 Chronotype-Specific Protocols", value: "$25" },
              { item: "Evening Wind-Down Ritual Checklist", value: "$9" },
            ].map((v, i) => (
              <div key={i} className="value-item">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-xs font-bold flex-shrink-0">✓</span>
                  <span className="text-[oklch(0.82_0.03_265)] text-sm">{v.item}</span>
                </div>
                <span className="text-[oklch(0.45_0.04_265)] text-xs line-through flex-shrink-0 ml-2">{v.value}</span>
              </div>
            ))}
          </div>

          {/* Price reveal — premium anchoring */}
          <div className="glass-card border-gradient p-6 rounded-2xl mb-6 text-center">
            <p className="text-[oklch(0.6_0.04_265)] text-sm mb-1">
              Total value: <span className="line-through text-[oklch(0.45_0.04_265)]">$97</span>
            </p>
            <p className="font-display text-4xl font-black text-white mb-1">
              You pay: <span className="text-gradient-animated">$1</span>
            </p>
            <p className="text-xs text-[oklch(0.5_0.04_265)]">One-time · Instant access · No subscription</p>
          </div>

          <button
            onClick={() => handleCTAClick("value_stack")}
            className="cta-premium cta-shimmer w-full py-5 rounded-2xl font-black text-lg text-white"
          >
            Start Free Quiz → Get It For $1
          </button>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <span className="trust-badge">🔒 Secure checkout</span>
            <span className="trust-badge">⚡ Instant delivery</span>
            <span className="trust-badge">↩ 30-day guarantee</span>
          </div>
        </div>
      </section>

      {/* ── PREMIUM SUBSCRIPTION TEASER (Klein principle — identity) ─────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_265)] relative overflow-hidden">
        <div className="orb orb-purple w-[400px] h-[400px] top-[-100px] right-[-100px]" style={{ opacity: 0.1 }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.3)] text-[oklch(0.75_0.18_280)] text-xs font-bold uppercase tracking-widest mb-6">
            ✦ New — Sleep Optimizers Community
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            You're not just buying a guide.<br />
            <span className="text-gradient-animated font-display italic">You're joining a movement.</span>
          </h2>
          <p className="text-[oklch(0.65_0.04_265)] mb-8 max-w-xl mx-auto leading-relaxed">
            The Sleep Optimizers Community is for people who refuse to accept chronic exhaustion as normal. 
            Monthly protocols, AI sleep reports, and a tribe of high-performers who optimize everything — including sleep.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 text-center">
            {[
              { icon: "📋", label: "Monthly Protocol", sub: "New guide every month" },
              { icon: "🤖", label: "AI Sleep Report", sub: "Weekly personalized score" },
              { icon: "👥", label: "Community", sub: "Private members only" },
            ].map((f) => (
              <div key={f.label} className="glass-card p-4 rounded-xl">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-bold text-white">{f.label}</div>
                <div className="text-xs text-[oklch(0.55_0.04_265)] mt-1">{f.sub}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { handleElementClick("premium_teaser"); setLocation("/premium"); }}
            className="cta-premium cta-shimmer inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white"
          >
            Join Sleep Optimizers — From $9.99/mo →
          </button>
          <p className="mt-3 text-xs text-[oklch(0.45_0.04_265)]">Cancel anytime · No commitment · Instant access</p>
        </div>
      </section>

      <ReviewsSection />

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="orb orb-purple w-[500px] h-[500px] bottom-[-200px] left-[50%] -translate-x-1/2" style={{ opacity: 0.08 }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-6xl mb-6 animate-float">🌙</div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Ready to sleep like you did as a kid?
          </h2>
          <p className="text-[oklch(0.62_0.04_265)] mb-2">
            Start with the free quiz. Get your result in 60 seconds.
          </p>
          <p className="text-[oklch(0.5_0.04_265)] mb-10 text-sm">
            Then decide if the $1 plan is worth it. No pressure.
          </p>
          <button
            onClick={() => handleCTAClick("final_cta")}
            className="cta-premium cta-shimmer inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xl text-white"
          >
            <span className="text-2xl">✨</span>
            {ctaVariant.text}
          </button>
          <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
            <span className="trust-badge">🔒 Secure</span>
            <span className="trust-badge">📧 No spam</span>
            <span className="trust-badge">⚡ Instant results</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t border-[oklch(0.15_0.03_265)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[oklch(0.65_0.18_280)] font-bold text-lg mb-1">
              <span className="text-2xl">🌙</span>
              Deep Sleep Reset
            </div>
            <p className="text-xs text-[oklch(0.4_0.03_265)]">Helping people sleep better through chronobiology science</p>
          </div>
          <div className="section-divider mb-6" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[oklch(0.4_0.03_265)]">
            <span>© 2025 Deep Sleep Reset · All rights reserved</span>
            <a href="/privacy" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Contact</a>
            <a href="/premium" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Premium</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
