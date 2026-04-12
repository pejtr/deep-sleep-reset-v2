import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const CHRONOTYPE_NAMES: Record<string, string> = {
  lion: "Lev 🦁",
  bear: "Medvěd 🐻",
  wolf: "Vlk 🐺",
  dolphin: "Delfín 🐬",
};

function useCountdown(minutes: number) {
  const [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: seconds === 0 };
}

export default function Order() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { display: countdown, expired } = useCountdown(15);

  useEffect(() => {
    const c = sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(c);
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "tripwire", chronotype }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Nepodařilo se vytvořit platbu. Zkus to znovu.");
      }
    } catch {
      setError("Chyba připojení. Zkus to znovu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* Urgency bar */}
        <div className={`rounded-xl p-3 mb-6 text-center text-sm font-bold transition-all ${expired ? "bg-red-900/30 border border-red-500/40 text-red-400" : "bg-[oklch(0.72_0.18_45/0.15)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)]"}`}>
          {expired ? (
            "⚠️ Nabídka vypršela — objednávka za standardní cenu"
          ) : (
            <>
              ⏰ Tato nabídka vyprší za{" "}
              <span className="animate-countdown-tick font-mono">{countdown}</span>
              {" "}— pak se cena vrátí na $27
            </>
          )}
        </div>

        {/* Product summary */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.4)] rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">🌙</div>
            <div>
              <h2 className="font-black text-white text-lg leading-tight">
                7-Night Deep Sleep Reset
              </h2>
              <p className="text-sm text-[oklch(0.65_0.04_265)]">
                Personalizovaný pro {CHRONOTYPE_NAMES[chronotype]}
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "7-denní spánkový protokol (PDF)",
              "Personalizovaný večerní rituál",
              "Ranní rutina pro tvůj chronotyp",
              "Sleep Score tracker",
              "Bonus: 5 nejčastějších spánkových chyb",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {item}
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="flex items-center justify-between py-3 border-t border-[oklch(0.22_0.03_265)]">
            <div>
              <span className="price-original text-sm mr-2">$27.00</span>
              <span className="text-xs text-[oklch(0.65_0.22_280)] font-semibold">Speciální cena</span>
            </div>
            <div className="text-3xl font-black text-white">$1.00</div>
          </div>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 mb-5 text-xs text-[oklch(0.55_0.04_265)]">
          <div className="flex -space-x-2">
            {["M", "T", "L", "P"].map((l, i) => (
              <div
                key={i}
                className="w-7 h-7 rounded-full bg-[oklch(0.65_0.22_280/0.3)] border-2 border-[oklch(0.12_0.025_265)] flex items-center justify-center text-xs font-bold text-[oklch(0.8_0.12_280)]"
              >
                {l}
              </div>
            ))}
          </div>
          <span>
            <strong className="text-white">247 lidí</strong> si koupilo tento týden
          </span>
        </div>

        {/* CTA */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl mb-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Připravuji platbu...
            </span>
          ) : (
            "Získat přístup za $1 →"
          )}
        </button>

        <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mb-6">
          🔒 256-bit SSL šifrování · Stripe · 30denní záruka vrácení peněz
        </p>

        {/* Guarantee */}
        <div className="rounded-xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] p-4 text-center">
          <div className="text-2xl mb-2">🛡️</div>
          <p className="text-sm font-bold text-white mb-1">30denní záruka vrácení peněz</p>
          <p className="text-xs text-[oklch(0.55_0.04_265)]">
            Pokud nebudeš spokojený z jakéhokoli důvodu, vrátíme ti $1 zpět. Bez otázek.
          </p>
        </div>

        {/* Back link */}
        <button
          onClick={() => setLocation("/result")}
          className="w-full mt-4 text-center text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors"
        >
          ← Zpět na výsledek
        </button>
      </div>
    </div>
  );
}
