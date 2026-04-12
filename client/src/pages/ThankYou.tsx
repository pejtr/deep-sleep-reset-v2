import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showPremiumPulse, setShowPremiumPulse] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(c);
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "purchase_complete", page: "thank-you", ts: Date.now() }),
    }).catch(() => {});
    // Show review after 3s
    setTimeout(() => setShowReview(true), 3000);
    // Show premium pulse after 8s (after they've read the page)
    setTimeout(() => setShowPremiumPulse(true), 8000);
  }, []);

  const chronotypeNames: Record<string, string> = {
    lion: "Lion 🦁", bear: "Bear 🐻", wolf: "Wolf 🐺", dolphin: "Dolphin 🐬",
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) return;
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "review_submit", page: "thank-you", result: `${rating}stars`, ts: Date.now() }),
    }).catch(() => {});
    setReviewSubmitted(true);
  };

  return (
    <div className="min-h-screen stars-premium px-4 py-12 relative overflow-hidden">
      {/* Floating orbs */}
      <div className="orb orb-purple w-[400px] h-[400px] top-[-100px] right-[-100px]" style={{ opacity: 0.1 }} />
      <div className="orb orb-gold w-[300px] h-[300px] bottom-[10%] left-[-100px]" style={{ opacity: 0.08 }} />

      <div className="max-w-lg mx-auto relative z-10">

        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500/40 flex items-center justify-center text-4xl mx-auto mb-5 glow-purple animate-float">
            ✅
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
            ✓ Purchase Confirmed
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-3">
            Welcome to Deep Sleep Reset!
          </h1>
          <p className="text-[oklch(0.65_0.04_265)] mb-2">
            Your order has been processed. Check your email — your materials are on the way.
          </p>
          <p className="text-sm text-[oklch(0.5_0.04_265)]">
            (If you don't see it within 5 minutes, check your spam folder)
          </p>
        </div>

        {/* Downloads — premium card */}
        <div className="glass-card rounded-2xl p-6 mb-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <span>📥</span> Your Downloads
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: "📄",
                title: `7-Night Reset — ${chronotypeNames[chronotype] || "Bear 🐻"}`,
                sub: "Your personalized sleep protocol",
                href: "/api/downloads/tripwire",
              },
              {
                icon: "📊",
                title: "Sleep Score Tracker",
                sub: "Bonus PDF (included in your guide)",
                href: "/api/downloads/tripwire",
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 rounded-xl bg-[oklch(0.14_0.025_265)] border border-[oklch(0.22_0.03_265)] hover:border-[oklch(0.65_0.22_280/0.5)] transition-all group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-[oklch(0.5_0.04_265)]">{item.sub}</p>
                </div>
                <span className="text-[oklch(0.65_0.22_280)] text-sm group-hover:translate-x-1 transition-transform">↓ Download</span>
              </a>
            ))}
          </div>
        </div>

        {/* Start tonight — implementation intention */}
        <div className="glass-card rounded-2xl p-5 mb-5 border-l-2 border-[oklch(0.65_0.22_280/0.6)]">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <span>🌙</span> Start Tonight:
          </h3>
          <ol className="space-y-2.5">
            {[
              "Download your personalized plan above",
              "Read Night 1 protocol (5 minutes)",
              "Set your alarm to the time recommended for your chronotype",
              "Track your Sleep Score every morning",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[oklch(0.75_0.03_265)]">
                <span className="w-5 h-5 rounded-full bg-[oklch(0.65_0.22_280/0.2)] border border-[oklch(0.65_0.22_280/0.4)] flex items-center justify-center text-xs font-black text-[oklch(0.75_0.18_280)] flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Review prompt — shown after 3s */}
        {showReview && !reviewSubmitted && (
          <div className="glass-card rounded-2xl p-5 mb-5 animate-slide-up">
            <h3 className="font-bold text-white mb-1">How excited are you to try this?</h3>
            <p className="text-xs text-[oklch(0.55_0.04_265)] mb-4">
              Takes 10 seconds — helps others find better sleep too
            </p>
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-all hover:scale-125 ${
                    star <= rating ? "text-yellow-400" : "text-[oklch(0.3_0.03_265)]"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating >= 4 && (
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What made you decide to try this? (optional)"
                className="w-full px-3 py-2 rounded-xl bg-[oklch(0.15_0.025_265)] border border-[oklch(0.25_0.03_265)] text-white placeholder-[oklch(0.4_0.03_265)] text-xs focus:outline-none focus:border-[oklch(0.65_0.22_280)] transition-colors resize-none mb-3"
                rows={2}
              />
            )}
            {rating > 0 && (
              <button
                onClick={handleReviewSubmit}
                className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)] text-white hover:opacity-90 transition-all"
              >
                Submit →
              </button>
            )}
          </div>
        )}

        {reviewSubmitted && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-5 animate-slide-up">
            <p className="text-green-400 font-bold text-sm text-center">🙏 Thank you! Your feedback helps others sleep better.</p>
          </div>
        )}

        {/* Klein principle: Premium identity upsell — shown after 8s */}
        <div className={`subscription-card-pro rounded-2xl p-6 mb-5 transition-all duration-500 ${showPremiumPulse ? "animate-reveal" : "opacity-0"}`}>
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">⚡</span>
            <div>
              <div className="badge-popular mb-2">Exclusive for new customers</div>
              <h3 className="font-display font-black text-white text-lg leading-tight">
                You've started your journey.<br />
                <span className="text-gradient-animated">Now go all the way.</span>
              </h3>
            </div>
          </div>
          <p className="text-sm text-[oklch(0.65_0.04_265)] mb-4 leading-relaxed">
            The 7-night plan is your foundation. Sleep Optimizers Pro gives you the monthly protocols, 
            AI sleep reports, and community to make this a permanent lifestyle — not just a 7-day experiment.
          </p>
          <div className="space-y-1.5 mb-4">
            {[
              "Monthly Sleep Protocol Update",
              "Weekly AI Sleep Score Report",
              "Private Sleep Optimizers Community",
              "Monthly Q&A Recording",
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[oklch(0.75_0.03_265)]">
                <span className="text-green-400 text-xs">✓</span> {f}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-[oklch(0.5_0.04_265)]">Total value: <span className="line-through">$275/mo</span></p>
              <p className="font-display text-2xl font-black text-white">$27<span className="text-sm font-normal text-[oklch(0.55_0.04_265)]">/month</span></p>
            </div>
            <p className="text-xs text-green-400 font-bold">Cancel anytime</p>
          </div>
          <button
            onClick={() => setLocation("/premium")}
            className="cta-premium cta-shimmer w-full py-3.5 rounded-xl font-bold text-sm text-white"
          >
            Join Sleep Optimizers Pro →
          </button>
          <p className="text-center text-[0.65rem] text-[oklch(0.4_0.03_265)] mt-2">7-day free trial · No commitment · Instant access</p>
        </div>

        {/* Share prompt — viral loop */}
        <div className="glass-card rounded-2xl p-5 mb-6">
          <p className="text-sm text-[oklch(0.65_0.04_265)] mb-3 text-center">
            Know someone who struggles with sleep? Share the free quiz:
          </p>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://deepsleepre.set"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[oklch(0.35_0.1_265)] text-white hover:opacity-80 transition-all text-center"
            >
              Share on Facebook
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[oklch(0.6_0.2_0)] to-[oklch(0.6_0.2_300)] text-white hover:opacity-80 transition-all text-center"
            >
              Share on Instagram
            </a>
          </div>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="w-full text-center text-sm text-[oklch(0.5_0.04_265)] hover:text-[oklch(0.7_0.04_265)] transition-colors"
        >
          ← Back to homepage
        </button>
      </div>
    </div>
  );
}
