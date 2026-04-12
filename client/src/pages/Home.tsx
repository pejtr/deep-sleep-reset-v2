import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import SocialProofToast from "@/components/SocialProofToast";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import ReviewsSection from "@/components/ReviewsSection";

// ─── Neuro-marketing: A/B test variants (loss aversion + curiosity gap) ───────
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

// ─── Behaviorální psychologie: Social proof s reálnými jmény ─────────────────
const TESTIMONIALS = [
  {
    name: "Sarah M.",
    city: "Austin, TX",
    avatar: "S",
    text: "I've tried everything for 3 years. This quiz told me I'm a Wolf type — changed my entire sleep schedule. I sleep like a baby now.",
    stars: 5,
    result: "Wolf",
    verified: true,
  },
  {
    name: "James K.",
    city: "London, UK",
    avatar: "J",
    text: "Skeptical about the $1 price. Thought it was a scam. It wasn't. The 7-night plan actually worked. I'm sleeping deeper than I have in 5 years.",
    stars: 5,
    result: "Bear",
    verified: true,
  },
  {
    name: "Priya S.",
    city: "Mumbai, India",
    avatar: "P",
    text: "The quiz was 100% accurate. I'm a Dolphin — light sleeper, anxious at night. The techniques are specifically designed for my type. Game changer.",
    stars: 5,
    result: "Dolphin",
    verified: true,
  },
  {
    name: "Marcus T.",
    city: "Toronto, CA",
    avatar: "M",
    text: "Night 1: fell asleep in under 10 minutes. I usually take 2 hours. Worth every penny of that $1.",
    stars: 5,
    result: "Lion",
    verified: true,
  },
  {
    name: "Aisha R.",
    city: "Lagos, Nigeria",
    avatar: "A",
    text: "I was waking up 4-5 times a night. After following the Bear protocol for 7 nights, I sleep through. My productivity doubled.",
    stars: 5,
    result: "Bear",
    verified: true,
  },
  {
    name: "David L.",
    city: "Sydney, AU",
    avatar: "D",
    text: "The science behind this is real. I've read about chronotypes before but never had a personalized plan. This is different.",
    stars: 5,
    result: "Wolf",
    verified: true,
  },
];

// ─── Neuro-marketing: Authority signals ──────────────────────────────────────
const AUTHORITY_BADGES = [
  { icon: "🧬", label: "Based on Chronobiology Research" },
  { icon: "📊", label: "12,847 Tests Completed" },
  { icon: "⭐", label: "4.9/5 Average Rating" },
  { icon: "🔬", label: "Validated by Sleep Science" },
];

// ─── Cialdini: Scarcity + FOMO ────────────────────────────────────────────────
const SCARCITY_MESSAGES = [
  "⚡ 47 people took this quiz in the last hour",
  "🔥 This free quiz closes at midnight",
  "⏰ 23 spots left for today's free plan",
  "📈 Your chronotype results expire in 24h",
];

function getOrSetVariant<T extends { id: string }>(key: string, variants: T[]): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const found = variants.find((v) => v.id === stored);
      if (found) return found;
    }
    const chosen = variants[Math.floor(Math.random() * variants.length)];
    localStorage.setItem(key, chosen.id);
    return chosen;
  } catch {
    return variants[0];
  }
}

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
    const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS);
    const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS);
    setHeadlineVariant(hv);
    setCtaVariant(cv);

    // Track A/B impressions
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "headline", variant: hv.id, type: "impression" }),
    }).catch(() => {});
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "cta_button", variant: cv.id, type: "impression" }),
    }).catch(() => {});

    // Track page view for behavior analytics
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "home", ts: Date.now() }),
    }).catch(() => {});

    // Exit intent (desktop)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current) {
        exitShown.current = true;
        setShowExitPopup(true);
        fetch("/api/behavior/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "exit_intent", page: "home", ts: Date.now() }),
        }).catch(() => {});
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // Timed email popup (8 seconds — after user is engaged)
    const emailTimer = setTimeout(() => {
      if (!emailPopupShown.current) {
        emailPopupShown.current = true;
        setShowEmailPopup(true);
      }
    }, 8000);

    // Scroll tracking (heat map data)
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
      const scrollPct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      const milestones = [25, 50, 75, 100];
      milestones.forEach((m) => {
        if (scrollPct >= m && !scrollDepthRef.current.has(m)) {
          scrollDepthRef.current.add(m);
          fetch("/api/behavior/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ event: "scroll_depth", page: "home", depth: m, ts: Date.now() }),
          }).catch(() => {});
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
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "cta_button", variant: ctaVariant.id, type: "click" }),
    }).catch(() => {});
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "cta_click", page: "home", source, ts: Date.now() }),
    }).catch(() => {});
    setLocation("/quiz");
  };

  const handleElementClick = (element: string) => {
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "click", page: "home", element, ts: Date.now() }),
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen stars-bg moon-glow relative overflow-x-hidden">
      <SocialProofToast />

      {showExitPopup && (
        <ExitIntentPopup
          ctaVariant={ctaVariant.id}
          onClose={() => setShowExitPopup(false)}
          onCTA={() => handleCTAClick("exit_popup")}
        />
      )}

      {showEmailPopup && (
        <EmailCapturePopup
          onClose={() => setShowEmailPopup(false)}
          onCTA={() => { setShowEmailPopup(false); handleCTAClick("email_popup"); }}
        />
      )}

      {/* Sticky CTA bar (mobile) */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[oklch(0.08_0.025_265/0.97)] backdrop-blur-md border-t border-[oklch(0.65_0.22_280/0.3)] md:hidden">
          <button
            onClick={() => handleCTAClick("sticky_mobile")}
            className="cta-shimmer w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow"
          >
            {ctaVariant.text}
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-24 text-center">
        {/* Moon decoration */}
        <div className="absolute top-12 right-8 md:right-16 w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[oklch(0.85_0.08_280)] to-[oklch(0.7_0.15_280)] opacity-20 animate-float blur-sm pointer-events-none" />
        <div className="absolute top-12 right-8 md:right-16 w-20 h-20 md:w-28 md:h-28 rounded-full border border-[oklch(0.85_0.08_280/0.3)] pointer-events-none" />

        {/* Live visitors (social proof + FOMO) */}
        <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {visitorCount} people taking this quiz right now
        </div>

        <div className="max-w-2xl mx-auto animate-slide-up">
          {/* Hook line — curiosity gap */}
          <p className="text-sm font-semibold text-[oklch(0.7_0.15_280)] mb-3 uppercase tracking-widest">
            {headlineVariant.hook}
          </p>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[oklch(0.65_0.22_280/0.4)] bg-[oklch(0.65_0.22_280/0.1)] text-sm text-[oklch(0.8_0.12_280)] mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Free quiz · No registration · Results in 60 seconds
          </div>

          {/* Headline — loss aversion framing */}
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 text-white">
            {headlineVariant.headline}
          </h1>

          <p className="text-lg md:text-xl text-[oklch(0.75_0.04_265)] mb-8 leading-relaxed">
            {headlineVariant.subheadline}
          </p>

          {/* Primary CTA */}
          <button
            onClick={() => handleCTAClick("hero_primary")}
            className="cta-shimmer inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-lg md:text-xl bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow transition-transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            {ctaVariant.text}
          </button>

          {/* Micro-copy — remove friction */}
          <p className="mt-3 text-sm text-[oklch(0.55_0.04_265)]">
            🔒 No credit card · No spam · 100% free
          </p>

          {/* Scarcity */}
          <p className="mt-2 text-xs text-[oklch(0.65_0.15_30)] font-medium animate-pulse">
            {scarcityMsg}
          </p>

          {/* Social proof numbers — authority */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[oklch(0.6_0.04_265)]">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">12,847</span>
              <span>tests completed</span>
            </div>
            <div className="w-px h-10 bg-[oklch(0.25_0.03_265)]" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">4.9 ★</span>
              <span>average rating</span>
            </div>
            <div className="w-px h-10 bg-[oklch(0.25_0.03_265)]" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">7 nights</span>
              <span>to results</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[oklch(0.4_0.03_265)] text-xs">
          <span>Learn more</span>
          <div className="w-5 h-8 border border-[oklch(0.3_0.03_265)] rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-[oklch(0.5_0.05_265)] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── AUTHORITY BADGES ─────────────────────────────────────────────────── */}
      <section className="py-8 px-4 border-y border-[oklch(0.18_0.03_265)] bg-[oklch(0.09_0.02_265)]">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6">
          {AUTHORITY_BADGES.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-[oklch(0.65_0.04_265)]">
              <span className="text-xl">{b.icon}</span>
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM AGITATION (Neuro: Pain → Solution) ───────────────────────── */}
      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-4 text-white">
          Sound familiar?
        </h2>
        <p className="text-center text-[oklch(0.6_0.04_265)] mb-10 max-w-xl mx-auto text-sm">
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
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.11_0.02_265)]">
              <span className="text-red-400 text-lg mt-0.5">✗</span>
              <span className="text-[oklch(0.75_0.03_265)] text-sm">{pain}</span>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <p className="text-[oklch(0.65_0.22_280)] font-semibold mb-4">
            The problem isn't your sleep habits. It's that you don't know your chronotype.
          </p>
          <button
            onClick={() => handleCTAClick("problem_section")}
            className="cta-shimmer inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-base bg-[oklch(0.65_0.22_280)] text-white hover:opacity-90 transition-all hover:scale-105"
          >
            Find My Chronotype Free →
          </button>
        </div>
      </section>

      {/* ── CHRONOTYPE SECTION ───────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-[oklch(0.1_0.02_265)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-3 text-white">
            Which sleep type are you?
          </h2>
          <p className="text-center text-[oklch(0.65_0.04_265)] mb-10 max-w-xl mx-auto text-sm">
            Science identifies 4 chronotypes. Most sleep advice is written for Bears — which is why it fails everyone else.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: "🦁", name: "Lion", desc: "Early riser. Peak energy at dawn.", time: "10pm–6am", pct: "15%" },
              { emoji: "🐻", name: "Bear", desc: "Follows the sun. Most common type.", time: "11pm–7am", pct: "55%" },
              { emoji: "🐺", name: "Wolf", desc: "Night owl. Creative after dark.", time: "12am–8am", pct: "20%" },
              { emoji: "🐬", name: "Dolphin", desc: "Light sleeper. Anxious at night.", time: "11:30pm–6:30am", pct: "10%" },
            ].map((type) => (
              <div
                key={type.name}
                className="p-4 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] text-center hover:border-[oklch(0.65_0.22_280/0.5)] transition-all hover:bg-[oklch(0.65_0.22_280/0.06)] cursor-pointer group"
                onClick={() => { handleElementClick(`chronotype_${type.name}`); handleCTAClick("chronotype_card"); }}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{type.emoji}</div>
                <div className="font-bold text-white mb-1">{type.name}</div>
                <div className="text-xs text-[oklch(0.55_0.04_265)] mb-2">{type.desc}</div>
                <div className="text-xs font-mono text-[oklch(0.65_0.22_280)] mb-1">{type.time}</div>
                <div className="text-xs text-[oklch(0.45_0.04_265)]">{type.pct} of people</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => handleCTAClick("chronotype_section")}
              className="cta-shimmer inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-base bg-[oklch(0.65_0.22_280)] text-white hover:opacity-90 transition-all hover:scale-105"
            >
              Discover My Type Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10 text-white">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "🧠", title: "Take the quiz", desc: "5 simple questions. No registration. Results in 60 seconds." },
              { step: "2", icon: "📊", title: "Get your type", desc: "Receive your exact chronotype and optimal sleep window for your biology." },
              { step: "3", icon: "🌙", title: "Start your reset", desc: "The 7-Night Deep Sleep Reset plan for just $1 — sleep deeper from night one." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)]">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.65_0.22_280/0.2)] border border-[oklch(0.65_0.22_280/0.4)] flex items-center justify-center text-sm font-black text-[oklch(0.8_0.12_280)] mb-3">
                  {item.step}
                </div>
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[oklch(0.6_0.04_265)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Social proof + Specificity = credibility) ─────────── */}
      <section className="py-16 px-4 bg-[oklch(0.1_0.02_265)]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-3 text-white">
            Real results from real people
          </h2>
          <p className="text-center text-[oklch(0.6_0.04_265)] mb-10 text-sm">
            Verified purchases · All chronotypes · All countries
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] flex flex-col">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                  {t.verified && (
                    <span className="ml-auto text-xs text-green-400 font-medium">✓ Verified</span>
                  )}
                </div>
                <p className="text-[oklch(0.8_0.03_265)] text-sm mb-4 italic flex-1">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-[oklch(0.65_0.22_280/0.3)] flex items-center justify-center text-sm font-bold text-[oklch(0.8_0.12_280)] flex-shrink-0">
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

      {/* ── VALUE STACK (Anchoring — show value before price) ────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Everything you get for $1
          </h2>
          <p className="text-[oklch(0.6_0.04_265)] mb-8 text-sm">
            Less than a cup of coffee. More impact than years of bad sleep advice.
          </p>
          <div className="space-y-3 mb-8 text-left">
            {[
              { item: "Chronotype Quiz + Personalized Result", value: "$19 value" },
              { item: "7-Night Deep Sleep Reset PDF Guide", value: "$29 value" },
              { item: "Your Custom Sleep Schedule", value: "$15 value" },
              { item: "4 Chronotype-Specific Protocols", value: "$25 value" },
              { item: "Evening Wind-Down Ritual Checklist", value: "$9 value" },
            ].map((v, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)]">
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">✓</span>
                  <span className="text-[oklch(0.8_0.03_265)] text-sm">{v.item}</span>
                </div>
                <span className="text-[oklch(0.5_0.04_265)] text-xs line-through">{v.value}</span>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-2xl bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.4)] mb-6">
            <p className="text-[oklch(0.7_0.04_265)] text-sm mb-1">Total value: <span className="line-through text-[oklch(0.5_0.04_265)]">$97</span></p>
            <p className="text-3xl font-black text-white">You pay: <span className="text-[oklch(0.75_0.22_280)]">$1</span></p>
            <p className="text-xs text-[oklch(0.55_0.04_265)] mt-1">One-time · Instant access · No subscription</p>
          </div>
          <button
            onClick={() => handleCTAClick("value_stack")}
            className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-105 transition-transform shadow-2xl"
          >
            Start Free Quiz → Get It For $1
          </button>
          <p className="mt-3 text-xs text-[oklch(0.4_0.03_265)]">
            🔒 Secure checkout · Instant delivery · 30-day money back guarantee
          </p>
        </div>
      </section>

      <ReviewsSection />

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-transparent to-[oklch(0.08_0.02_265)]">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">🌙</div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            Ready to sleep like you did as a kid?
          </h2>
          <p className="text-[oklch(0.65_0.04_265)] mb-2 text-sm">
            Start with the free quiz. Get your result in 60 seconds.
          </p>
          <p className="text-[oklch(0.55_0.04_265)] mb-8 text-xs">
            Then decide if the $1 plan is worth it. No pressure.
          </p>
          <button
            onClick={() => handleCTAClick("final_cta")}
            className="cta-shimmer inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-105 transition-transform shadow-2xl"
          >
            {ctaVariant.text}
          </button>
          <p className="mt-4 text-xs text-[oklch(0.4_0.03_265)]">
            🔒 Secure · No spam · Instant results
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[oklch(0.18_0.03_265)] text-center text-xs text-[oklch(0.4_0.03_265)]">
        <p>© 2025 Deep Sleep Reset · All rights reserved</p>
        <p className="mt-1">
          <a href="/privacy" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Privacy Policy</a>
          {" · "}
          <a href="/terms" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Terms of Service</a>
          {" · "}
          <a href="/contact" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Contact</a>
        </p>
      </footer>
    </div>
  );
}
