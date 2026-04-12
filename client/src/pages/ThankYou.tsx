import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    const c = sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(c);
    // Track purchase completion
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "purchase_complete", page: "thank-you", ts: Date.now() }),
    }).catch(() => {});
    // Show review prompt after 3 seconds (commitment/consistency principle)
    setTimeout(() => setShowReview(true), 3000);
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
    <div className="min-h-screen stars-bg px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse-glow">
          ✅
        </div>

        <h1 className="text-3xl font-black text-white mb-3">
          Welcome to Deep Sleep Reset!
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-2">
          Your order has been processed. Check your email — your materials are on the way.
        </p>
        <p className="text-sm text-[oklch(0.55_0.04_265)] mb-8">
          (If you don't see it within 5 minutes, check your spam folder)
        </p>

        {/* Downloads */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-6 mb-6 text-left">
          <h2 className="font-bold text-white mb-4 text-center">📥 Your Downloads</h2>
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
                className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.14_0.025_265)] border border-[oklch(0.22_0.03_265)] hover:border-[oklch(0.65_0.22_280/0.5)] transition-all group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-[oklch(0.5_0.04_265)]">{item.sub}</p>
                </div>
                <span className="text-[oklch(0.65_0.22_280)] text-sm group-hover:translate-x-1 transition-transform">↓</span>
              </a>
            ))}
          </div>
        </div>

        {/* Next steps — implementation intention (behavioral psych) */}
        <div className="bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.3)] rounded-2xl p-5 mb-6 text-left">
          <h3 className="font-bold text-white mb-3">🌙 Start Tonight:</h3>
          <ol className="space-y-2 text-sm text-[oklch(0.75_0.03_265)]">
            <li className="flex items-start gap-2">
              <span className="text-[oklch(0.65_0.22_280)] font-bold">1.</span>
              Download your personalized plan above
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[oklch(0.65_0.22_280)] font-bold">2.</span>
              Read Night 1 protocol (5 minutes)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[oklch(0.65_0.22_280)] font-bold">3.</span>
              Set your alarm to the time recommended for your chronotype
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[oklch(0.65_0.22_280)] font-bold">4.</span>
              Track your Sleep Score every morning
            </li>
          </ol>
        </div>

        {/* Review prompt — social proof collection (shown after 3s) */}
        {showReview && !reviewSubmitted && (
          <div className="bg-[oklch(0.72_0.18_45/0.1)] border border-[oklch(0.72_0.18_45/0.3)] rounded-2xl p-5 mb-6 animate-slide-up">
            <h3 className="font-bold text-white mb-1">How excited are you to try this?</h3>
            <p className="text-xs text-[oklch(0.55_0.04_265)] mb-3">
              Takes 10 seconds — helps others find better sleep too
            </p>
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 ${
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
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 animate-slide-up">
            <p className="text-green-400 font-bold text-sm">🙏 Thank you! Your feedback helps others sleep better.</p>
          </div>
        )}

        {/* Share prompt — viral loop */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-4 mb-6">
          <p className="text-sm text-[oklch(0.65_0.04_265)] mb-3">
            Know someone who struggles with sleep? Share the free quiz:
          </p>
          <div className="flex gap-2">
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https://deepsleepre.set"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-[oklch(0.35_0.1_265)] text-white hover:opacity-80 transition-all text-center"
            >
              Share on Facebook
            </a>
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[oklch(0.6_0.2_0)] to-[oklch(0.6_0.2_300)] text-white hover:opacity-80 transition-all text-center"
            >
              Share on Instagram
            </a>
          </div>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="text-sm text-[oklch(0.55_0.04_265)] hover:text-[oklch(0.75_0.04_265)] transition-colors"
        >
          ← Back to homepage
        </button>
      </div>
    </div>
  );
}
