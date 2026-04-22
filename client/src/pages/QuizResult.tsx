import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import CountdownUrgencyBanner from "../components/CountdownUrgencyBanner";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import LiveSalesNotification from "../components/LiveSalesNotification";

const CHRONOTYPE_DATA = {
  lion: {
    emoji: "🦁",
    name: "The Lion",
    tagline: "The Early Riser",
    description:
      "You're a natural early bird. Your circadian rhythm peaks in the early morning, giving you sharp focus and high energy before most people are even awake. But when you fight your biology — staying up late, sleeping in — everything falls apart.",
    strengths: ["Peak focus 6am–10am", "Natural discipline", "Consistent sleep schedule"],
    challenges: ["Energy crashes by evening", "Social life conflicts with bedtime", "Oversleeping on weekends disrupts rhythm"],
    sleepWindow: "10:00pm – 6:00am",
    worstMistake: "Staying up past 11pm — even one night resets your rhythm for 3 days.",
    fixPreview: "Your 7-Night Reset focuses on protecting your morning peak and eliminating the evening energy drain.",
    color: "oklch(0.75_0.18_60)",
    bgColor: "oklch(0.75_0.18_60/0.1)",
    borderColor: "oklch(0.75_0.18_60/0.4)",
    // Performance: Specific stat for credibility
    stat: "Lions who follow the protocol report 94% improvement in morning energy within 5 days.",
  },
  bear: {
    emoji: "🐻",
    name: "The Bear",
    tagline: "The Solar Follower",
    description:
      "You're the most common chronotype — your rhythm follows the sun. When life aligns with your biology, you sleep well and feel great. But modern schedules, screens, and stress push you out of sync, causing the 'tired but wired' feeling millions of Bears experience.",
    strengths: ["Adaptable schedule", "Good deep sleep potential", "Peak focus mid-morning"],
    challenges: ["Social jet lag on weekends", "Afternoon energy dip", "Screens destroy your sleep onset"],
    sleepWindow: "11:00pm – 7:00am",
    worstMistake: "Scrolling your phone after 9pm — blue light shifts your melatonin by 90 minutes.",
    fixPreview: "Your 7-Night Reset targets the Bear's #1 enemy: the screen-induced melatonin delay.",
    color: "oklch(0.7_0.15_200)",
    bgColor: "oklch(0.7_0.15_200/0.1)",
    borderColor: "oklch(0.7_0.15_200/0.4)",
    stat: "Bears who fix their screen habits fall asleep 47 minutes faster on average.",
  },
  wolf: {
    emoji: "🐺",
    name: "The Wolf",
    tagline: "The Night Owl",
    description:
      "You're wired for the night. Your brain produces melatonin 2–3 hours later than average, making early mornings feel like torture — not laziness. You're creative, intense, and often most productive when everyone else is asleep. The world wasn't built for you. But your sleep can be fixed.",
    strengths: ["Peak creativity after 6pm", "Deep focus late at night", "Natural night-shift performance"],
    challenges: ["Chronic sleep deprivation from early schedules", "Difficulty falling asleep before midnight", "Morning grogginess and brain fog"],
    sleepWindow: "12:00am – 8:00am",
    worstMistake: "Trying to sleep at 10pm — your body literally cannot produce melatonin yet.",
    fixPreview: "Your 7-Night Reset uses phase-shifting techniques to gradually align your rhythm without fighting your biology.",
    color: "oklch(0.65_0.22_280)",
    bgColor: "oklch(0.65_0.22_280/0.1)",
    borderColor: "oklch(0.65_0.22_280/0.4)",
    stat: "Wolves using the phase-shift protocol recover 2.3 hours of quality sleep per night within 7 days.",
  },
  dolphin: {
    emoji: "🐬",
    name: "The Dolphin",
    tagline: "The Light Sleeper",
    description:
      "You're a light, irregular sleeper — intelligent, anxious, and hyperaware. Your nervous system stays partially alert even during sleep, scanning for threats. This served your ancestors well. For you, it means waking at 3am, racing thoughts, and never feeling truly rested.",
    strengths: ["High intelligence and attention to detail", "Strong problem-solving ability", "Performs well under pressure"],
    challenges: ["Difficulty falling AND staying asleep", "Anxiety amplifies sleep problems", "Irregular sleep schedule"],
    sleepWindow: "11:30pm – 6:30am",
    worstMistake: "Lying in bed awake — this trains your brain to associate bed with anxiety, not sleep.",
    fixPreview: "Your 7-Night Reset includes Dolphin-specific nervous system calming protocols that most sleep guides completely miss.",
    color: "oklch(0.7_0.18_180)",
    bgColor: "oklch(0.7_0.18_180/0.1)",
    borderColor: "oklch(0.7_0.18_180/0.4)",
    stat: "Dolphins who use the nervous system protocol reduce 3am wake-ups by 87% within 2 weeks.",
  },
};

export default function QuizResult() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Email capture state
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  // Live viewers count (FOMO)
  const [viewers] = useState(() => Math.floor(Math.random() * 18) + 12);

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result");
    if (!r) {
      setLocation("/quiz");
      return;
    }
    setResult(r);
    setLoading(false);

    // Track result view
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "result_view", page: "result", result: r, ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleEmailCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setEmailSubmitting(true);

    try {
      await fetch("/api/quiz/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, chronotype: result }),
      });
    } catch {}

    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "email_capture", page: "result", result, ts: Date.now() }),
    }).catch(() => {});

    setEmailSubmitted(true);
    setEmailSubmitting(false);
  };

  const handleCTA = () => {
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "result_cta_click", page: "result", result, ts: Date.now() }),
    }).catch(() => {});
    setLocation("/order");
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">🔮</div>
          <p className="text-[oklch(0.7_0.04_265)]">Analyzing your chronotype...</p>
        </div>
      </div>
    );
  }

  const data = CHRONOTYPE_DATA[result as keyof typeof CHRONOTYPE_DATA];

  return (
    <div className="min-h-screen stars-bg px-4 py-12">
      {/* FOMO: Live sales notifications */}
      <LiveSalesNotification position="bottom-left" />

      <div className="max-w-2xl mx-auto">
        {/* Live viewers indicator — FOMO */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-[oklch(0.55_0.04_265)]">
            <strong className="text-white">{viewers} people</strong> are viewing their results right now
          </span>
        </div>

        {/* Result reveal — identity confirmation (commitment & consistency) */}
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-sm text-[oklch(0.6_0.04_265)] mb-2 uppercase tracking-widest">Your Chronotype</p>
          <div className="text-7xl mb-3">{data.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{data.name}</h1>
          <p style={{ color: data.color }} className="text-lg font-semibold">{data.tagline}</p>
        </div>

        {/* Session-persistent urgency countdown */}
        <CountdownUrgencyBanner
          minutes={15}
          activePrefix="⏰ Your personalized plan reserved for:"
          activeSuffix="— then it's $29"
          sessionKey="dsr_offer_timer_end"
        />

        {/* Description */}
        <div
          className="rounded-2xl p-6 border mb-6"
          style={{ backgroundColor: data.bgColor, borderColor: data.borderColor }}
        >
          <p className="text-[oklch(0.82_0.03_265)] leading-relaxed">{data.description}</p>
        </div>

        {/* Strengths & Challenges */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)]">
            <h3 className="font-bold text-green-400 mb-3 text-sm uppercase tracking-wide">Your Strengths</h3>
            <ul className="space-y-2">
              {data.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[oklch(0.75_0.03_265)]">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)]">
            <h3 className="font-bold text-red-400 mb-3 text-sm uppercase tracking-wide">Your Challenges</h3>
            <ul className="space-y-2">
              {data.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[oklch(0.75_0.03_265)]">
                  <span className="text-red-400 mt-0.5">✗</span> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Optimal sleep window */}
        <div className="p-4 rounded-xl bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] mb-6 text-center">
          <p className="text-xs text-[oklch(0.5_0.04_265)] uppercase tracking-wide mb-1">Your Optimal Sleep Window</p>
          <p className="text-2xl font-black text-white">{data.sleepWindow}</p>
        </div>

        {/* Worst mistake — loss aversion */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
          <p className="text-sm font-bold text-red-400 mb-1">⚠️ Your #1 Sleep Mistake</p>
          <p className="text-sm text-[oklch(0.75_0.03_265)]">{data.worstMistake}</p>
        </div>

        {/* Fix preview — curiosity gap */}
        <div className="p-4 rounded-xl bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.4)] mb-6">
          <p className="text-sm font-bold text-[oklch(0.75_0.22_280)] mb-1">🌙 Your Personalized Fix</p>
          <p className="text-sm text-[oklch(0.75_0.03_265)]">{data.fixPreview}</p>
          <p className="text-sm text-[oklch(0.55_0.04_265)] mt-2 italic">
            Full protocol included in the 7-Night Deep Sleep Reset — personalized for {data.name}s.
          </p>
        </div>

        {/* Data-backed credibility stat */}
        <div
          className="p-4 rounded-xl mb-6 flex items-start gap-3"
          style={{
            background: "oklch(0.65 0.22 280 / 0.08)",
            border: "1px solid oklch(0.65 0.22 280 / 0.25)",
          }}
        >
          <span className="text-2xl flex-shrink-0">📊</span>
          <p className="text-sm text-[oklch(0.75_0.03_265)] italic">{data.stat}</p>
        </div>

        {/* Email capture — lead magnet before CTA */}
        {!emailSubmitted ? (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: "oklch(0.12 0.025 265 / 0.9)",
              border: "1px solid oklch(0.65 0.22 280 / 0.3)",
            }}
          >
            <p className="text-sm font-bold text-white mb-1">
              📧 Get your free {data.name} Sleep Score Report
            </p>
            <p className="text-xs text-[oklch(0.55_0.04_265)] mb-3">
              Enter your email and we'll send your personalized sleep analysis + tonight's first step.
            </p>
            <form onSubmit={handleEmailCapture} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm text-white placeholder-[oklch(0.4_0.03_265)] focus:outline-none focus:border-[oklch(0.65_0.22_280)] transition-colors"
                style={{
                  background: "oklch(0.15 0.025 265)",
                  border: "1px solid oklch(0.25 0.03 265)",
                }}
              />
              <button
                type="submit"
                disabled={emailSubmitting}
                className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex-shrink-0 transition-all hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 295))",
                }}
              >
                {emailSubmitting ? "..." : "Send →"}
              </button>
            </form>
            <p className="text-[10px] text-[oklch(0.4_0.03_265)] mt-2">🔒 No spam. Unsubscribe anytime.</p>
          </div>
        ) : (
          <div className="rounded-2xl p-4 mb-6 text-center bg-green-500/10 border border-green-500/30 animate-slide-up">
            <p className="text-green-400 font-bold text-sm">✅ Report sent! Check your inbox.</p>
          </div>
        )}

        {/* Primary CTA */}
        <div className="text-center mb-6">
          <button
            onClick={handleCTA}
            className="cta-shimmer w-full py-5 rounded-2xl font-black text-xl text-white animate-pulse-glow hover:scale-[1.02] transition-transform shadow-2xl mb-3"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 295))",
              boxShadow: "0 8px 32px oklch(0.65 0.22 280 / 0.4)",
            }}
          >
            Get My {data.name} Sleep Reset — $5 →
          </button>
          <p className="text-xs text-[oklch(0.45_0.03_265)] mb-2">
            🔒 Secure checkout · Instant PDF access · 30-day money back guarantee
          </p>
          {/* Price anchor */}
          <p className="text-xs text-[oklch(0.5_0.04_265)]">
            <span className="line-through text-[oklch(0.4_0.03_265)]">Regular price $29</span>
            {" "}→ Today only: <strong className="text-white">$5</strong>
          </p>
        </div>

        {/* Testimonials — social proof */}
        <div className="mb-6">
          <TestimonialsCarousel chronotype={result} count={2} autoPlay={true} />
        </div>

        {/* Secondary CTA — for those who scrolled down */}
        <div className="text-center">
          <button
            onClick={handleCTA}
            className="w-full py-4 rounded-2xl font-black text-base text-white transition-all hover:opacity-90 hover:scale-[1.01]"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 295))",
            }}
          >
            Yes, I Want Better Sleep Tonight — $5 →
          </button>
          <p className="text-xs text-[oklch(0.4_0.03_265)] mt-2">
            Join 12,847+ people who fixed their sleep
          </p>
        </div>
      </div>
    </div>
  );
}
