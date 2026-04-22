import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import CountdownUrgencyBanner from "../components/CountdownUrgencyBanner";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import LiveSalesNotification from "../components/LiveSalesNotification";
import StickyMobileCTA from "../components/StickyMobileCTA";

// Gumroad product permalink for the main tripwire ($5)
const GUMROAD_PRODUCT_URL = "https://petrmatej.gumroad.com/l/fdtifc";

const CHRONOTYPE_NAMES: Record<string, string> = {
  lion: "Lion 🦁",
  bear: "Bear 🐻",
  wolf: "Wolf 🐺",
  dolphin: "Dolphin 🐬",
};

const CHRONOTYPE_COLORS: Record<string, string> = {
  lion: "oklch(0.75 0.18 65)",
  bear: "oklch(0.65 0.22 280)",
  wolf: "oklch(0.6 0.2 320)",
  dolphin: "oklch(0.6 0.18 200)",
};

// Session-persistent countdown hook
function useSessionCountdown(minutes: number, sessionKey: string) {
  const [seconds, setSeconds] = useState<number>(() => {
    const stored = sessionStorage.getItem(sessionKey);
    if (stored) {
      const endTime = parseInt(stored, 10);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      return remaining;
    }
    const endTime = Date.now() + minutes * 60 * 1000;
    sessionStorage.setItem(sessionKey, String(endTime));
    return minutes * 60;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const stored = sessionStorage.getItem(sessionKey);
      if (stored) {
        const endTime = parseInt(stored, 10);
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setSeconds(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionKey]);

  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { display: `${m}:${s}`, expired: seconds === 0, seconds };
}

export default function Order() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");
  const [buyers] = useState(() => Math.floor(Math.random() * 40) + 80); // 80-120 buyers
  const [viewers] = useState(() => Math.floor(Math.random() * 12) + 8); // 8-20 viewers
  const { display: countdown, expired, seconds } = useSessionCountdown(15, "dsr_offer_timer_end");
  const isUrgent = seconds < 120 && !expired;

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result") || sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(r);
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "page_view", page: "order", ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleCheckout = () => {
    // Track click
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "checkout_click", page: "order", product: "tripwire", ts: Date.now() }),
    }).catch(() => {});

    // Record order locally (fire and forget)
    fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "tripwire", chronotype, useGumroad: true }),
    }).catch(() => {});

    // Open Gumroad overlay or fallback to new tab
    const gumroadUrl = `${GUMROAD_PRODUCT_URL}?wanted=true`;
    const overlay = (window as any).GumroadOverlay;
    if (overlay && typeof overlay.show === "function") {
      overlay.show(gumroadUrl);
    } else {
      toast.success("Opening secure checkout...");
      window.open(gumroadUrl, "_blank");
    }
  };

  const typeColor = CHRONOTYPE_COLORS[chronotype] || CHRONOTYPE_COLORS.bear;

  return (
    <div className="min-h-screen stars-premium px-4 py-10 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="orb orb-purple w-[400px] h-[400px] top-[-100px] right-[-100px]" style={{ opacity: 0.1 }} />
      <div className="orb orb-blue w-[300px] h-[300px] bottom-[-50px] left-[-100px]" style={{ opacity: 0.08 }} />

      {/* FOMO: Live sales notifications */}
      <LiveSalesNotification position="bottom-left" />

      {/* Sticky mobile CTA */}
      <StickyMobileCTA
        label="Get Instant Access — $5 →"
        price="$5"
        originalPrice="$29"
        countdown={countdown}
        countdownExpired={expired}
        onClick={handleCheckout}
        subtext="🔒 Secure · Instant PDF · 30-day guarantee"
      />

      <div className="max-w-lg mx-auto relative z-10">

        {/* Back link */}
        <button
          onClick={() => setLocation("/result")}
          className="text-[oklch(0.5_0.04_265)] hover:text-white transition-colors text-sm flex items-center gap-1 mb-6"
        >
          ← Back to my result
        </button>

        {/* Session-persistent urgency banner */}
        <CountdownUrgencyBanner
          minutes={15}
          activePrefix="⏰ This $5 offer expires in"
          activeSuffix="— then it's $29"
          sessionKey="dsr_offer_timer_end"
        />

        {/* Social proof — live activity */}
        <div className="flex items-center justify-between mb-5 text-sm">
          <div className="flex items-center gap-2 text-[oklch(0.58_0.04_265)]">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span>
              <strong className="text-white">{buyers} people</strong> purchased today
            </span>
          </div>
          <div className="flex items-center gap-2 text-[oklch(0.58_0.04_265)]">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse flex-shrink-0" />
            <span className="text-xs">
              <strong className="text-white">{viewers}</strong> viewing now
            </span>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-base">★</span>)}
          <span className="text-sm font-bold text-white ml-1">4.9</span>
          <span className="text-xs text-[oklch(0.5_0.04_265)]">(2,847 reviews)</span>
        </div>

        {/* Product card — premium glassmorphism */}
        <div className="glass-card rounded-2xl p-6 mb-5 relative overflow-hidden">
          {/* Top accent line matching chronotype color */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${typeColor}, transparent)` }} />

          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-[oklch(0.65_0.22_280/0.15)] border border-[oklch(0.65_0.22_280/0.3)] flex items-center justify-center text-3xl flex-shrink-0">
              🌙
            </div>
            <div>
              <h2 className="font-display font-black text-white text-xl leading-tight mb-1">
                7-Night Deep Sleep Reset
              </h2>
              <p className="text-sm font-semibold" style={{ color: typeColor }}>
                Personalized for {CHRONOTYPE_NAMES[chronotype] || "Your Chronotype"}
              </p>
            </div>
          </div>

          {/* Value stack */}
          <div className="space-y-2 mb-5">
            {[
              { text: "7-night sleep protocol (instant PDF)", value: "$29" },
              { text: "Personalized evening wind-down ritual", value: "$15" },
              { text: "Morning recovery routine for your type", value: "$12" },
              { text: "Optimal sleep & wake time schedule", value: "$19" },
              { text: "Bonus: 5 most common sleep mistakes", value: "$9" },
              { text: "Bonus: Chronotype meal timing guide", value: "$12" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 text-[0.6rem] font-bold flex-shrink-0">✓</span>
                  <span className="text-[oklch(0.78_0.03_265)] text-sm">{item.text}</span>
                </div>
                <span className="text-[oklch(0.42_0.04_265)] text-xs line-through flex-shrink-0 ml-2">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Price reveal */}
          <div className="flex items-center justify-between py-4 border-t border-[oklch(0.22_0.03_265)]">
            <div>
              <p className="text-xs text-[oklch(0.5_0.04_265)] mb-0.5">Total value: <span className="line-through">$96</span></p>
              <p className="text-xs font-bold text-green-400">You save 94.8%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[oklch(0.45_0.03_265)] line-through">$29.00</p>
              <p className="font-display text-4xl font-black text-white">$5<span className="text-lg">.00</span></p>
            </div>
          </div>
        </div>

        {/* Primary CTA — Gumroad overlay trigger */}
        <button
          onClick={handleCheckout}
          className={`cta-premium cta-shimmer w-full py-5 rounded-2xl font-black text-xl text-white mb-3 ${isUrgent ? "animate-pulse-glow" : ""}`}
        >
          Get Instant Access — $5 →
        </button>

        {/* Payment methods */}
        <div className="flex items-center justify-center gap-2 mb-4 text-xs text-[oklch(0.5_0.04_265)]">
          <span>💳</span>
          <span>Visa · Mastercard · PayPal · Apple Pay · Google Pay</span>
          <span>🔒</span>
        </div>

        {/* Trust row */}
        <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
          <span className="trust-badge">🔒 SSL Secure</span>
          <span className="trust-badge">⚡ Instant delivery</span>
          <span className="trust-badge">↩ 30-day guarantee</span>
          <span className="trust-badge">🌍 47 countries</span>
        </div>

        {/* Risk reversal — premium version */}
        <div className="glass-card rounded-2xl p-5 text-center mb-6">
          <div className="text-3xl mb-2">🛡️</div>
          <p className="font-bold text-white mb-1">30-Day Money Back Guarantee</p>
          <p className="text-sm text-[oklch(0.58_0.04_265)] leading-relaxed">
            Follow the 7-night plan. If you don't sleep better, email us for a full refund.
            <strong className="text-white"> No questions asked. You risk nothing.</strong>
          </p>
        </div>

        {/* Testimonials carousel */}
        <div className="mb-6">
          <TestimonialsCarousel chronotype={chronotype} count={3} autoPlay={true} />
        </div>

        {/* Premium upsell teaser */}
        <div className="glass-card rounded-xl p-4 mb-6 flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">⚡</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[oklch(0.75_0.18_280)] mb-0.5">After purchase: Unlock Sleep Optimizers Pro</p>
            <p className="text-xs text-[oklch(0.55_0.04_265)]">Monthly protocols + AI sleep reports + community. From $9.99/mo.</p>
          </div>
        </div>

        {/* Secondary CTA — for those who scrolled to bottom */}
        <button
          onClick={handleCheckout}
          className="w-full py-4 rounded-2xl font-black text-base text-white mb-3 transition-all hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 295))",
          }}
        >
          Yes, Fix My Sleep Tonight — $5 →
        </button>
        <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mb-8">
          Join 12,847+ people who already fixed their sleep
        </p>

      </div>
    </div>
  );
}
