import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Upsell1() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [chronotype, setChronotype] = useState("bear");

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result") || "bear";
    setChronotype(r);
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "upsell1", ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleAccept = async () => {
    setLoading(true);
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "upsell_accept", page: "upsell1", product: "oto1", ts: Date.now() }),
    }).catch(() => {});
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: "oto1", chronotype }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
        setTimeout(() => setLocation("/upsell/2"), 1500);
      } else {
        setLocation("/upsell/2");
      }
    } catch {
      setLocation("/upsell/2");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "upsell_decline", page: "upsell1", product: "oto1", ts: Date.now() }),
    }).catch(() => {});
    setLocation("/upsell/2");
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        {/* Success + OTO badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-bold mb-6">
          ✅ Payment successful! One special offer before you go...
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Wait — Upgrade to the Full 30-Day Transformation
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-6 text-sm leading-relaxed">
          Because you just purchased the 7-Night Reset, you have a one-time chance to add the complete 30-Day Sleep Transformation Program at a massive discount.
        </p>

        {/* Product card */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.5)] rounded-2xl p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">📅</div>
            <h2 className="text-xl font-black text-white">30-Day Sleep Transformation</h2>
            <p className="text-sm text-[oklch(0.65_0.04_265)] mt-1">
              Complete month-long system for permanent sleep change
            </p>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "30-day daily plan (PDF + printable checklist)",
              "Week-by-week progressive protocols",
              "Habit tracker for consistent sleep",
              "Nutrition timing guide for deeper sleep",
              "Exercise schedule aligned with your chronotype",
              "Bonus: 30-page sleep journal",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="text-sm text-[oklch(0.45_0.03_265)] line-through">$47</span>
            <span className="text-3xl font-black text-white">$7</span>
            <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
              85% OFF
            </span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Processing..." : "Yes! Add 30-Day Program — $7 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 One click · No re-entering card details
        </p>

        <button
          onClick={handleDecline}
          className="text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors underline"
        >
          No thanks, the 7-night reset is enough for me
        </button>
      </div>
    </div>
  );
}
