import { useState } from "react";

interface Props {
  onClose: () => void;
  onCTA: () => void;
}

export default function EmailCapturePopup({ onClose, onCTA }: Props) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "email_popup" }),
      });
      setDone(true);
      setTimeout(() => { onCTA(); }, 1200);
    } catch {
      onCTA();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.4)] rounded-3xl p-6 shadow-2xl animate-slide-up relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[oklch(0.2_0.03_265)] flex items-center justify-center text-[oklch(0.6_0.04_265)] hover:text-white transition-colors text-sm"
        >
          ✕
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-bold">Taking you to your quiz...</p>
          </div>
        ) : (
          <>
            {/* Reciprocity trigger — give before asking */}
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🎁</div>
              <h3 className="text-lg font-black text-white mb-1">
                Get Your Free Sleep Score
              </h3>
              <p className="text-sm text-[oklch(0.65_0.04_265)]">
                Enter your email and we'll send your personalized chronotype report + bonus sleep tips.
              </p>
            </div>

            {/* Micro-commitment — small ask first */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.18_0.03_265)] border border-[oklch(0.28_0.04_265)] text-white placeholder-[oklch(0.45_0.03_265)] text-sm focus:outline-none focus:border-[oklch(0.65_0.22_280)] transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="cta-shimmer w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white hover:opacity-90 transition-all disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send My Free Report →"}
              </button>
            </form>

            <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mt-3">
              🔒 No spam. Unsubscribe anytime.
            </p>

            {/* Skip option — reduce friction */}
            <button
              onClick={onCTA}
              className="w-full text-center text-xs text-[oklch(0.4_0.03_265)] mt-2 hover:text-[oklch(0.6_0.04_265)] transition-colors"
            >
              Skip and take the quiz →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
