import { useState } from "react";
import { useLocation } from "wouter";

export default function Upsell1() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upsell: "oto1", price: 7 }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setLocation("/upsell/2");
      }
    } catch {
      setLocation("/upsell/2");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => setLocation("/upsell/2");

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-bold mb-6">
          ✅ Platba proběhla úspěšně!
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Počkej — speciální nabídka jen pro tebe
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-6 text-sm">
          Protože jsi právě koupil 7-Night Reset, máš jednorázovou šanci získat kompletní 30-denní program za zlomek ceny.
        </p>

        {/* Product card */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.5)] rounded-2xl p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📅</div>
            <h2 className="text-xl font-black text-white">30-Day Sleep Transformation</h2>
            <p className="text-sm text-[oklch(0.65_0.04_265)] mt-1">
              Kompletní měsíční program pro trvalou změnu spánku
            </p>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "30-denní denní plán (PDF + checklist)",
              "Týdenní progresivní protokoly",
              "Habit tracker pro spánek",
              "Stravovací tipy pro lepší spánek",
              "Cvičební plán kompatibilní s tvým chronotypem",
              "Bonus: Spánkový deník (30 stran)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="price-original text-base">$47</span>
            <span className="text-3xl font-black text-white">$7</span>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
              85% SLEVA
            </span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Zpracovávám..." : "Ano! Chci 30-denní program za $7 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 Jeden klik · Žádné nové zadávání karty
        </p>

        <button
          onClick={handleDecline}
          className="text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors underline"
        >
          Ne, děkuji — stačí mi 7-Night Reset
        </button>
      </div>
    </div>
  );
}
