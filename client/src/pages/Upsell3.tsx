import { useState } from "react";
import { useLocation } from "wouter";

export default function Upsell3() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upsell: "oto3", price: 27 }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLocation("/thank-you");
      }
    } catch {
      setLocation("/thank-you");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => setLocation("/thank-you");

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-4 animate-float">🧰</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Kompletní Deep Sleep Toolkit
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-6 text-sm">
          Vše, co potřebuješ pro dokonalý spánek na jednom místě.
          Spánkový deník, habit tracker, recepty a bonusové materiály.
        </p>

        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.72_0.18_45/0.5)] rounded-2xl p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[oklch(0.72_0.18_45/0.2)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)] text-xs font-bold">
              NEJLEPŠÍ HODNOTA
            </span>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "📔 Spánkový deník (90 dní, printable PDF)",
              "📊 Habit Tracker — spánek, stres, energie",
              "🥗 Sleep-Boosting Recipe Book (27 receptů)",
              "💊 Supplement Guide — co funguje a co ne",
              "📱 App doporučení pro tracking spánku",
              "🎁 Bonus: Sleep Environment Checklist",
              "🎁 Bonus: Partner Sleep Guide",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[oklch(0.72_0.18_45)] mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="price-original text-base">$97</span>
            <span className="text-3xl font-black text-white">$27</span>
            <span className="px-2 py-1 rounded-lg bg-[oklch(0.72_0.18_45/0.2)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)] text-xs font-bold">
              72% SLEVA
            </span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)] text-white hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Zpracovávám..." : "Ano! Chci Toolkit za $27 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 Jeden klik · Okamžitý přístup
        </p>

        <button
          onClick={handleDecline}
          className="text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors underline"
        >
          Ne, děkuji — přejít na stažení
        </button>
      </div>
    </div>
  );
}
