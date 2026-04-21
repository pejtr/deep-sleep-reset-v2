import { useState } from "react";
import { useLocation } from "wouter";

export default function Upsell2() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "oto2" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLocation("/upsell/3");
      }
    } catch {
      setLocation("/upsell/3");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => setLocation("/upsell/3");

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-4 animate-float">🎧</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Fall Asleep Faster With Guided Audio
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-6 text-sm">
          4 audio sessions designed for your chronotype. Science-backed techniques
          for fast sleep onset and deep, restorative sleep.
        </p>

        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.5)] rounded-2xl p-6 mb-6 text-left">
          <h2 className="text-lg font-black text-white text-center mb-4">
            Chronotype Audio Mastery Pack
          </h2>

          <div className="space-y-3 mb-5">
            {[
              { icon: "🌙", title: "Deep Sleep Induction (23 min)", desc: "Progressive muscle relaxation + delta wave guidance" },
              { icon: "🧠", title: "Mind Quieting Session (18 min)", desc: "For Dolphin & Wolf types — quieting the hyperactive mind" },
              { icon: "🌅", title: "Morning Energy Activation (12 min)", desc: "Morning activation for Lion & Bear types" },
              { icon: "😴", title: "Power Nap Protocol (20 min)", desc: "Ideal nap protocol for maximum afternoon performance" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[oklch(0.14_0.025_265)]">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-[oklch(0.55_0.04_265)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="price-original text-base">$67</span>
            <span className="text-3xl font-black text-white">$17</span>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
              75% OFF
            </span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Processing..." : "Yes! Add Audio Pack — $17 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 One click · Instant download access
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
