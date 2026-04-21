import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Upsell3() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);
  const [chronotype, setChronotype] = useState("bear");

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result") || "bear";
    setChronotype(r);
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "page_view", page: "upsell3", ts: Date.now() }) }).catch(() => {});
  }, []);

  const handleAccept = () => {
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "upsell_accept", page: "upsell3", product: "oto3", ts: Date.now() }) }).catch(() => {});
    // Record locally (fire and forget)
    fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "oto3", chronotype, useGumroad: true }),
    }).catch(() => {});
    toast.success("Opening secure checkout...");
    window.open("https://petrmatej.gumroad.com/l/ubsxk?wanted=true", "_blank");
    setTimeout(() => setLocation("/thank-you"), 800);
  };

  const handleDecline = () => {
    fetch("/api/behavior/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event: "upsell_decline", page: "upsell3", product: "oto3", ts: Date.now() }) }).catch(() => {});
    setLocation("/thank-you");
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-10">
      <div className="max-w-md mx-auto text-center">
        <div className="text-5xl mb-4 animate-float">🧰</div>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
          Complete Your Sleep Transformation — Full Toolkit
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-6 text-sm">
          Everything you need for perfect sleep in one place — sleep journal, habit tracker, recipe book, supplement guide, and bonus materials.
        </p>

        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.72_0.18_45/0.5)] rounded-2xl p-6 mb-6 text-left">
          <div className="text-center mb-4">
            <span className="px-3 py-1 rounded-full bg-[oklch(0.72_0.18_45/0.2)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)] text-xs font-bold">
              BEST VALUE
            </span>
          </div>

          <ul className="space-y-2 text-sm text-[oklch(0.75_0.03_265)] mb-5">
            {[
              "📔 90-Day Sleep Journal (printable PDF)",
              "📊 Habit Tracker — sleep, stress, energy",
              "🥗 Sleep-Boosting Recipe Book (27 recipes)",
              "💊 Supplement Guide — what works, what doesn't",
              "📱 Top sleep tracking app recommendations",
              "🎁 Bonus: Sleep Environment Optimization Checklist",
              "🎁 Bonus: Partner Sleep Alignment Guide",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-[oklch(0.72_0.18_45)] mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-center gap-3 py-3 border-t border-[oklch(0.22_0.03_265)]">
            <span className="price-original text-base">$97</span>
            <span className="text-3xl font-black text-white">$19</span>
            <span className="px-2 py-1 rounded-lg bg-[oklch(0.72_0.18_45/0.2)] border border-[oklch(0.72_0.18_45/0.4)] text-[oklch(0.85_0.15_45)] text-xs font-bold">
              80% OFF
            </span>
          </div>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="cta-shimmer w-full py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)] text-white hover:scale-[1.02] transition-transform disabled:opacity-70 shadow-2xl mb-3"
        >
          {loading ? "Processing..." : "Yes! Add the Full Toolkit — $19 →"}
        </button>

        <p className="text-xs text-[oklch(0.4_0.03_265)] mb-4">
          🔒 One click · Instant access
        </p>

        <button
          onClick={handleDecline}
          className="text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors underline"
        >
          No thanks, I'll skip the toolkit
        </button>
      </div>
    </div>
  );
}
