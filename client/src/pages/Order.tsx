import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const CHRONOTYPE_NAMES: Record<string, string> = {
  lion: "Lion 🦁",
  bear: "Bear 🐻",
  wolf: "Wolf 🐺",
  dolphin: "Dolphin 🐬",
};

function useCountdown(minutes: number) {
  const [seconds, setSeconds] = useState(minutes * 60);
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
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
  const [buyers] = useState(() => Math.floor(Math.random() * 40) + 60);
  const { display: countdown, expired } = useCountdown(15);

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result") || sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(r);

    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "order", ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "checkout_click", page: "order", product: "tripwire", ts: Date.now() }),
    }).catch(() => {});

    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "tripwire", chronotype }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to secure checkout...");
      } else {
        setError("Could not create payment. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto">
        {/* Urgency bar */}
        <div
          className={`rounded-xl p-3 mb-6 text-center text-sm font-bold transition-all ${
            expired
              ? "bg-red-900/30 border border-red-500/40 text-red-400"
              : "bg-[oklch(0.72_0.18_45/0.15)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)]"
          }`}
        >
          {expired ? (
            "⚠️ Offer expired — standard pricing applies"
          ) : (
            <>
              ⏰ This $1 offer expires in{" "}
              <span className="font-mono font-black">{countdown}</span>
              {" "}— then it's $29
            </>
          )}
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-2 mb-5 text-xs text-[oklch(0.55_0.04_265)]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>
            <strong className="text-white">{buyers} people</strong> purchased today
          </span>
        </div>

        {/* Product card */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.4)] rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">🌙</div>
            <div>
              <h2 className="font-black text-white text-lg leading-tight">
                7-Night Deep Sleep Reset
              </h2>
              <p className="text-sm text-[oklch(0.65_0.22_280)]">
                Personalized for {CHRONOTYPE_NAMES[chronotype] || "Your Chronotype"}
              </p>
            </div>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "7-night sleep protocol (instant PDF)",
              "Personalized evening wind-down ritual",
              "Morning recovery routine for your type",
              "Optimal sleep & wake time schedule",
              "Bonus: 5 most common sleep mistakes",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-400">✓</span> {item}
              </li>
            ))}
          </ul>

          {/* Price anchoring */}
          <div className="flex items-center justify-between py-3 border-t border-[oklch(0.22_0.03_265)]">
            <div>
              <span className="text-sm text-[oklch(0.45_0.03_265)] line-through mr-2">$29.00</span>
              <span className="text-xs text-[oklch(0.65_0.22_280)] font-semibold">97% off today</span>
            </div>
            <div className="text-3xl font-black text-white">$1.00</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/30 border border-red-500/40 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-xl bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 disabled:cursor-not-allowed shadow-2xl mb-3"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Preparing checkout...
            </span>
          ) : (
            "Get Instant Access — $1 →"
          )}
        </button>

        <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mb-6">
          🔒 256-bit SSL · Stripe secure checkout · 30-day money back guarantee
        </p>

        {/* Risk reversal */}
        <div className="rounded-xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] p-4 text-center mb-4">
          <div className="text-2xl mb-2">🛡️</div>
          <p className="text-sm font-bold text-white mb-1">30-Day Money Back Guarantee</p>
          <p className="text-xs text-[oklch(0.55_0.04_265)]">
            Follow the 7-night plan. If you don't sleep better, email us for a full refund. No questions asked. You risk nothing.
          </p>
        </div>

        <button
          onClick={() => setLocation("/result")}
          className="w-full text-center text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors"
        >
          ← Back to my result
        </button>
      </div>
    </div>
  );
}
