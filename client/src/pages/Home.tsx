import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import SocialProofToast from "@/components/SocialProofToast";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import EmailCapturePopup from "@/components/EmailCapturePopup";
import ReviewsSection from "@/components/ReviewsSection";
import FAQSection from "@/components/FAQSection";

// ─── A/B Test Variants ────────────────────────────────────────────────────────
const HEADLINE_VARIANTS = [
  {
    id: "A",
    headline: "You're Not Tired.",
    italic: "You're Sleep-Deprived.",
    tail: "There's a Fix.",
    subheadline: "The 7-Night Deep Sleep Reset uses the same CBT-I protocol sleep clinics charge $800 for — for the price of one coffee.",
    hook: "THE 7-NIGHT SLEEP TRANSFORMATION",
  },
  {
    id: "B",
    headline: "Why You Sleep 8 Hours",
    italic: "and Still Wake Up Exhausted.",
    tail: "",
    subheadline: "Discover your sleep chronotype in 60 seconds — and fix it tonight.",
    hook: "73% OF PEOPLE WITH SLEEP PROBLEMS MAKE THIS ONE MISTAKE",
  },
  {
    id: "C",
    headline: "Stop Fighting Your Sleep.",
    italic: "Start Working With Your Biology.",
    tail: "",
    subheadline: "5 questions. 60 seconds. Your personalized Deep Sleep Reset plan.",
    hook: "PEOPLE WHO KNOW THEIR CHRONOTYPE FALL ASLEEP 3× FASTER",
  },
  {
    id: "D",
    headline: "Every Night You Sleep Wrong,",
    italic: "You Lose 40% of Your Brain's Recovery.",
    tail: "",
    subheadline: "Take the free chronotype quiz and reclaim deep, restorative sleep — starting tonight.",
    hook: "TRUSTED BY SLEEP COACHES · BACKED BY CHRONOBIOLOGY RESEARCH",
  },
];

const CTA_VARIANTS = [
  { id: "A", text: "Yes — I Want to Sleep Like This" },
  { id: "B", text: "Discover My Sleep Type →" },
  { id: "C", text: "Reveal My Chronotype →" },
];

// ─── CTA Color A/B Test Variants ────────────────────────────────────────────
const CTA_COLOR_VARIANTS = [
  {
    id: "gold",
    label: "Gold",
    className: "cta-gold cta-shimmer",
    navClassName: "cta-gold cta-shimmer",
  },
  {
    id: "purple",
    label: "Purple",
    className: "cta-purple cta-shimmer",
    navClassName: "cta-purple cta-shimmer",
  },
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
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
  const [scrollPct, setScrollPct] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [ctaColorVariant, setCtaColorVariant] = useState(CTA_COLOR_VARIANTS[0]);
  const [scarcityMsg] = useState(() => SCARCITY_MESSAGES[Math.floor(Math.random() * SCARCITY_MESSAGES.length)]);
  const exitShown = useRef(false);
  const emailPopupShown = useRef(false);
  const scrollDepthRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    fetch("/api/behavior/summary")
      .then((r) => r.json())
      .then((data) => {
        const headlineWeights: Record<string, number> = {};
        const ctaWeights: Record<string, number> = {};
        const colorWeights: Record<string, number> = {};
        if (data.abWinners) {
          for (const w of data.abWinners) {
            if (w.testName === "headline") headlineWeights[w.winner] = w.weight;
            if (w.testName === "cta_button") ctaWeights[w.winner] = w.weight;
            if (w.testName === "cta_color") colorWeights[w.winner] = w.weight;
          }
        }
        const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS, headlineWeights);
        const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS, ctaWeights);
        const ccv = getOrSetVariant("dsr_cta_color_variant", CTA_COLOR_VARIANTS, colorWeights);
        setHeadlineVariant(hv);
        setCtaVariant(cv);
        setCtaColorVariant(ccv);
        fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "headline", variant: hv.id, type: "impression" }) }).catch(() => {});
        fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "cta_button", variant: cv.id, type: "impression" }) }).catch(() => {});
        fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "cta_color", variant: ccv.id, type: "impression" }) }).catch(() => {});
      })
      .catch(() => {
        const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS);
        const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS);
        const ccv = getOrSetVariant("dsr_cta_color_variant", CTA_COLOR_VARIANTS);
        setHeadlineVariant(hv);
        setCtaVariant(cv);
        setCtaColorVariant(ccv);
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
      const pct = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      setScrollPct(Math.min(pct, 100));
      setScrolled(window.scrollY > 300);
      [25, 50, 75, 100].forEach((m) => {
        if (pct >= m && !scrollDepthRef.current.has(m)) {
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
    fetch("/api/ab-test/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ testName: "cta_color", variant: ctaColorVariant.id, type: "click" }) }).catch(() => {});
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "cta_click", page: "home", source, cta_color: ctaColorVariant.id, ts: Date.now() }) }).catch(() => {});
    setLocation("/quiz");
  };

  const handleElementClick = (element: string) => {
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "click", page: "home", element, ts: Date.now() }) }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-[oklch(0.07_0.025_255)] relative overflow-x-hidden">
      <SocialProofToast />

      {showExitPopup && (
        <ExitIntentPopup ctaVariant={ctaVariant.id} onClose={() => setShowExitPopup(false)} onCTA={() => handleCTAClick("exit_popup")} />
      )}
      {showEmailPopup && (
        <EmailCapturePopup onClose={() => setShowEmailPopup(false)} onCTA={() => { setShowEmailPopup(false); handleCTAClick("email_popup"); }} />
      )}

      {/* ── TOP PROGRESS BAR ─────────────────────────────────────────────────── */}
      <div className="top-progress-bar">
        <div className="top-progress-fill" style={{ width: `${scrollPct}%` }} />
      </div>

      {/* ── SCARCITY TICKER ──────────────────────────────────────────────────── */}
      <div className="fixed top-[3px] left-0 right-0 z-[98] flex items-center justify-between px-4 md:px-8 py-1.5 bg-[oklch(0.10_0.025_255/0.9)] backdrop-blur-sm border-b border-[oklch(0.78_0.18_65/0.15)]">
        <p className="text-[0.68rem] text-[oklch(0.72_0.04_265)] tracking-wide text-center w-full">
          Don't close — Start your sleep transformation
        </p>
        <span className="text-[0.68rem] font-bold text-gold ml-4 flex-shrink-0">{scrollPct}%</span>
      </div>

      {/* ── NAVIGATION ───────────────────────────────────────────────────────── */}
      <nav className="top-nav pt-[30px]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2 text-[oklch(0.82_0.16_65)] font-bold text-base">
            <span className="text-lg">☽</span>
            <span className="font-display">Deep Sleep Reset</span>
          </div>
          <button
            onClick={() => handleCTAClick("nav")}
            className={`${ctaColorVariant.navClassName} px-5 py-2 rounded-lg text-sm font-bold`}
          >
            Change My Sleep — $5
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="hero-photo relative min-h-screen flex flex-col items-center justify-center px-4 pt-28 pb-24 text-center">
        {/* Hook label */}
        <p className="relative z-10 text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-8 animate-reveal">
          {headlineVariant.hook}
        </p>

        {/* Main headline — Playfair Display, exact original style */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="font-display font-black leading-[1.08] mb-8 animate-reveal stagger-1">
            <span className="text-white text-5xl md:text-7xl block">
              {headlineVariant.headline}
            </span>
            {headlineVariant.italic && (
              <span className="text-gradient-gold font-display italic text-5xl md:text-7xl block">
                {headlineVariant.italic}
              </span>
            )}
            {headlineVariant.tail && (
              <span className="text-white text-5xl md:text-7xl block">
                {headlineVariant.tail}
              </span>
            )}
          </h1>

          <p className="text-base md:text-lg text-[oklch(0.72_0.04_265)] mb-12 leading-relaxed max-w-2xl mx-auto animate-reveal stagger-2">
            {headlineVariant.subheadline}
          </p>

          {/* Primary CTA — golden amber, chevron down */}
          <div className="animate-reveal stagger-3">
            <button
              onClick={() => handleCTAClick("hero_primary")}
              className={`${ctaColorVariant.className} inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl font-black text-lg md:text-xl`}
            >
              {ctaVariant.text}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <p className="mt-5 text-xs text-[oklch(0.45_0.04_265)]">
              🔒 No credit card · No spam · 100% free
            </p>
            <p className="mt-2 text-xs font-semibold text-[oklch(0.72_0.14_65)] animate-pulse">
              {scarcityMsg}
            </p>
          </div>

          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-8 mt-14 animate-reveal stagger-4">
            {[
              { value: "12,847", label: "tests completed" },
              { value: "4.9 ★", label: "average rating" },
              { value: "7 nights", label: "to results" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-black text-white">{stat.value}</span>
                <span className="text-xs text-[oklch(0.5_0.04_265)] mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[oklch(0.38_0.03_265)] text-xs animate-reveal stagger-5">
          <span className="uppercase tracking-[0.2em] text-[0.6rem]">Scroll</span>
          <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── AUTHORITY STRIP ──────────────────────────────────────────────────── */}
      <div className="section-divider" />
      <section className="py-5 px-4 bg-[oklch(0.09_0.02_255/0.9)] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            { icon: "🧬", label: "Based on Chronobiology Research" },
            { icon: "📊", label: "12,847 Tests Completed" },
            { icon: "⭐", label: "4.9/5 Average Rating" },
            { icon: "🔬", label: "Validated by Sleep Science" },
            { icon: "🌍", label: "Used in 47 Countries" },
          ].map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-sm text-[oklch(0.58_0.04_265)]">
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
          <p className="text-center text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
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
            <p className="text-[oklch(0.78_0.14_65)] font-semibold mb-6 text-lg">
              The problem isn't your sleep habits.<br />
              <span className="font-display italic text-white">It's that you don't know your chronotype.</span>
            </p>
            <button
              onClick={() => handleCTAClick("problem_section")}
              className={`${ctaColorVariant.className} inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base`}
            >
              Find My Chronotype Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── CHRONOTYPE SECTION ───────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_255)]">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
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
              { emoji: "🦁", name: "Lion", desc: "Early riser. Peak energy at dawn.", time: "10pm–6am", pct: "15%", color: "oklch(0.82 0.16 65)" },
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
            className={`${ctaColorVariant.className} inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base`}
          >
              Discover My Type Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
            Simple 3-Step Process
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-center mb-12 text-white">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "🧠", title: "Take the quiz", desc: "5 simple questions. No registration. Results in 60 seconds." },
              { step: "02", icon: "📊", title: "Get your type", desc: "Receive your exact chronotype and optimal sleep window for your biology." },
              { step: "03", icon: "🌙", title: "Start your reset", desc: "The 7-Night Deep Sleep Reset plan for just $5 — sleep deeper from night one." },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 rounded-2xl text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 text-[5rem] font-black text-[oklch(0.82_0.16_65/0.04)] leading-none select-none pointer-events-none">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-[oklch(0.78_0.18_65/0.12)] border border-[oklch(0.78_0.18_65/0.3)] flex items-center justify-center text-xs font-black text-[oklch(0.82_0.16_65)] mb-4 mx-auto">
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
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_255)]">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
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
              <div key={i} className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col">
                {/* Stars + Verified */}
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <span key={j} className="text-[oklch(0.82_0.16_65)] text-sm">★</span>
                  ))}
                  {t.verified && (
                    <span className="ml-2 text-xs text-green-400 font-medium">✓ Verified</span>
                  )}
                </div>
                {/* Highlight badge — own line, no overflow */}
                <div className="mb-3">
                  <span className="badge-popular inline-block">{t.highlight}</span>
                </div>
                <p className="text-[oklch(0.8_0.03_265)] text-sm mb-4 italic flex-1 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-[oklch(0.22_0.03_265)]">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[oklch(0.78_0.18_65/0.35)] to-[oklch(0.65_0.16_65/0.15)] flex items-center justify-center text-sm font-bold text-[oklch(0.10_0.02_265)] flex-shrink-0">
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
          <p className="text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
            Hormozi Value Stack
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
            Everything you get for <span className="text-gradient-gold">$5</span>
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
                  <span className="w-5 h-5 rounded-full bg-[oklch(0.78_0.18_65/0.15)] border border-[oklch(0.78_0.18_65/0.4)] flex items-center justify-center text-[oklch(0.82_0.16_65)] text-xs font-bold flex-shrink-0">✓</span>
                  <span className="text-[oklch(0.82_0.03_265)] text-sm">{v.item}</span>
                </div>
                <span className="text-[oklch(0.45_0.04_265)] text-xs line-through flex-shrink-0 ml-2">{v.value}</span>
              </div>
            ))}
          </div>

          {/* Price reveal */}
          <div className="glass-card border border-[oklch(0.78_0.18_65/0.25)] p-6 rounded-2xl mb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.78_0.18_65/0.04)] to-transparent pointer-events-none" />
            <p className="text-[oklch(0.6_0.04_265)] text-sm mb-1 relative z-10">
              Total value: <span className="line-through text-[oklch(0.45_0.04_265)]">$97</span>
            </p>
            <p className="font-display text-4xl font-black text-white mb-1 relative z-10">
              You pay: <span className="text-gradient-gold">$5</span>
            </p>
            <p className="text-xs text-[oklch(0.5_0.04_265)] relative z-10">One-time · Instant access · No subscription</p>
          </div>

          <button
            onClick={() => handleCTAClick("value_stack")}
            className={`${ctaColorVariant.className} w-full py-5 rounded-2xl font-black text-lg`}
          >
            Start Free Quiz → Get It For $5
          </button>
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            <span className="trust-badge">🔒 Secure checkout</span>
            <span className="trust-badge">⚡ Instant delivery</span>
            <span className="trust-badge">↩ 30-day guarantee</span>
          </div>
        </div>
      </section>

      {/* ── PREMIUM SUBSCRIPTION TEASER (Klein principle — identity) ─────────── */}
      <section className="py-20 px-4 bg-[oklch(0.09_0.02_255)] relative overflow-hidden">
        <div className="orb orb-gold w-[400px] h-[400px] top-[-100px] right-[-100px]" style={{ opacity: 0.06 }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.78_0.18_65/0.08)] border border-[oklch(0.78_0.18_65/0.3)] text-[oklch(0.82_0.16_65)] text-xs font-bold uppercase tracking-widest mb-6">
            ✦ New — Sleep Optimizers Community
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            You're not just buying a guide.<br />
            <span className="text-gradient-gold font-display italic">You're joining a movement.</span>
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
              <div key={f.label} className="glass-card p-4 rounded-xl border border-[oklch(0.78_0.18_65/0.12)]">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-sm font-bold text-white">{f.label}</div>
                <div className="text-xs text-[oklch(0.55_0.04_265)] mt-1">{f.sub}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { handleElementClick("premium_teaser"); setLocation("/premium"); }}
            className={`${ctaColorVariant.className} inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base`}
          >
            Join Sleep Optimizers — From $9.99/mo →
          </button>
          <p className="mt-3 text-xs text-[oklch(0.45_0.04_265)]">Cancel anytime · No commitment · Instant access</p>
        </div>
      </section>

      <ReviewsSection />

      {/* ── FAQ ─────────────────────────────────────────────────────────────────────────── */}
      <FAQSection />

      {/* ── FINAL CTA ──────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center relative overflow-hidden">
        <div className="orb orb-gold w-[500px] h-[500px] bottom-[-200px] left-[50%] -translate-x-1/2" style={{ opacity: 0.05 }} />
        <div className="max-w-xl mx-auto relative z-10">
          <div className="text-6xl mb-6 animate-float">🌙</div>
          <h2 className="font-display text-3xl md:text-4xl font-black text-white mb-4">
            Ready to sleep like you did as a kid?
          </h2>
          <p className="text-[oklch(0.62_0.04_265)] mb-2">
            Start with the free quiz. Get your result in 60 seconds.
          </p>
          <p className="text-[oklch(0.5_0.04_265)] mb-10 text-sm">
            Then decide if the $5 plan is worth it. No pressure.
          </p>
          <button
            onClick={() => handleCTAClick("final_cta")}
            className={`${ctaColorVariant.className} inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black text-xl`}
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

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="py-10 px-4 border-t border-[oklch(0.78_0.18_65/0.1)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 text-[oklch(0.82_0.16_65)] font-bold text-lg mb-1 font-display">
              <span className="text-2xl">☽</span>
              Deep Sleep Reset
            </div>
            <p className="text-xs text-[oklch(0.4_0.03_265)]">Helping people sleep better through chronobiology science</p>
          </div>
          <div className="section-divider mb-6" />
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[oklch(0.4_0.03_265)]">
            <span>© 2025 Deep Sleep Reset · All rights reserved</span>
            <a href="/privacy" className="hover:text-[oklch(0.82_0.16_65)] transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-[oklch(0.82_0.16_65)] transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-[oklch(0.82_0.16_65)] transition-colors">Contact</a>
            <a href="/premium" className="hover:text-[oklch(0.82_0.16_65)] transition-colors">Premium</a>
          </div>
        </div>
      </footer>

      {/* Sticky mobile CTA */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[oklch(0.07_0.025_255/0.97)] backdrop-blur-xl border-t border-[oklch(0.78_0.18_65/0.2)] md:hidden">
          <button
            onClick={() => handleCTAClick("sticky_mobile")}
            className={`${ctaColorVariant.className} w-full py-4 rounded-xl font-bold text-base`}
          >
            {ctaVariant.text}
          </button>
        </div>
      )}
    </div>
  );
}
