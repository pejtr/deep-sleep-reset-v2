import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Upsell 2: Chronotype Audio Mastery Pack ($12) ───────────────────────────
// Previously missing: tracking, personalization, urgency, social proof
// Updated 2026-04-22: Full CRO overhaul — now consistent with Upsell1/Upsell3

const CHRONOTYPE_AUDIO_BENEFIT: Record<string, string> = {
  lion: "The Morning Energy Activation was built specifically for Lions — protecting your peak and preventing the evening crash.",
  bear: "The Deep Sleep Induction is optimized for Bears — targeting the melatonin delay caused by screens and stress.",
  wolf: "The Mind Quieting Session is your most important track — it quiets the Wolf's hyperactive mind so you can fall asleep before 2am.",
  dolphin: "All 4 sessions target Dolphin-specific anxiety patterns — the nervous system protocols that most audio guides completely miss.",
};

export default function Upsell2() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 min urgency

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result") || "bear";
    setChronotype(r);

    // Track page view (was missing before)
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "upsell2", ts: Date.now() }),
    }).catch(() => {});

    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(countdown / 60).toString().padStart(2, "0");
  const secs = (countdown % 60).toString().padStart(2, "0");
  const expired = countdown === 0;

  const handleAccept = () => {
    setLoading(true);

    // Track accept (was missing before)
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "upsell_accept", page: "upsell2", product: "oto2", ts: Date.now() }),
    }).catch(() => {});

    // Record locally (fire and forget)
    fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "oto2", chronotype, useGumroad: true }),
    }).catch(() => {});

    toast.success("Opening secure checkout...");
    window.open("https://petrmatej.gumroad.com/l/cuhln?wanted=true", "_blank");
    setTimeout(() => setLocation("/upsell/3"), 800);
  };

  const handleDecline = () => {
    // Track decline (was missing before)
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "upsell_decline", page: "upsell2", product: "oto2", ts: Date.now() }),
    }).catch(() => {});
    setLocation("/upsell/3");
  };

  const chronotypeEmoji: Record<string, string> = {
    lion: "🦁", bear: "🐻", wolf: "🐺", dolphin: "🐬",
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        {/* Success + OTO badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-bold mb-4">
          ✅ Step 2 of 3 — One more upgrade for you
        </div>

        {/* Personalized headline */}
        <div className="text-4xl mb-2 animate-float">{chronotypeEmoji[chronotype] || "🎧"}</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Add Audio Sleep Protocols<br />
          <span className="text-[oklch(0.65_0.22_280)]">Designed for Your Chronotype</span>
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-2 text-sm leading-relaxed">
          {CHRONOTYPE_AUDIO_BENEFIT[chronotype] || CHRONOTYPE_AUDIO_BENEFIT.bear}
        </p>

        {/* Urgency timer */}
        {!expired ? (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5 text-xs font-bold"
            style={{ background: "oklch(0.65 0.22 280 / 0.12)", border: "1px solid oklch(0.65 0.22 280 / 0.3)", color: "oklch(0.75 0.18 280)" }}>
            ⏰ This offer expires in <span className="font-mono animate-countdown-tick">{mins}:{secs}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-5 text-xs font-bold bg-red-900/20 border border-red-500/30 text-red-400">
            ⚠️ Offer expired — standard price applies
          </div>
        )}

        {/* Product card */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.5)] rounded-2xl p-6 mb-5 text-left">
          <h2 className="text-lg font-black text-white text-center mb-1">
            Chronotype Audio Mastery Pack
          </h2>
          <p className="text-xs text-center text-[oklch(0.55_0.04_265)] mb-4">4 science-backed audio sessions · Total: 73 minutes</p>

          <div className="space-y-3 mb-5">
            {[
              { icon: "🌙", title: "Deep Sleep Induction (23 min)", desc: "Progressive muscle relaxation + delta wave guidance", badge: "Bears" },
              { icon: "🧠", title: "Mind Quieting Session (18 min)", desc: "For Dolphin & Wolf types — quieting the hyperactive mind", badge: "Wolves & Dolphins" },
              { icon: "🌅", title: "Morning Energy Activation (12 min)", desc: "Morning activation for Lion & Bear types", badge: "Lions & Bears" },
              { icon: "😴", title: "Power Nap Protocol (20 min)", desc: "Ideal nap protocol for maximum afternoon performance", badge: "All types" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[oklch(0.14_0.025_265)]">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{item.title}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[oklch(0.65_0.22_280/0.15)] text-[oklch(0.65_0.22_280)] border border-[oklch(0.65_0.22_280/0.3)]">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[oklch(0.55_0.04_265)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="price-original text-base">$67</span>
            <span className="text-3xl font-black text-white">$12</span>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
              82% OFF
            </span>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-[oklch(0.55_0.04_265)]">
          <div className="flex">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
          </div>
          <span><strong className="text-white">4.8/5</strong> from 1,204 listeners</span>
        </div>

        {/* Micro testimonial */}
        <div className="p-3 rounded-xl bg-[oklch(0.11_0.02_265)] border border-[oklch(0.2_0.03_265)] mb-5 text-left">
          <div className="flex mb-1">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xs">★</span>)}
          </div>
          <p className="text-xs text-[oklch(0.75_0.03_265)] italic">
            "The Mind Quieting session changed everything. I'm a Wolf and I used to lie awake for 2 hours. Now I'm asleep in 15 minutes."
          </p>
          <p className="text-[0.65rem] text-[oklch(0.5_0.04_265)] mt-1">— James K., London 🐺</p>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Processing..." : "Yes! Add Audio Pack — $12 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 One click · Instant download access · 30-day guarantee
        </p>

        <button
          onClick={handleDecline}
          className="text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors underline"
        >
          No thanks, I'll skip the audio pack
        </button>
      </div>
    </div>
  );
}
