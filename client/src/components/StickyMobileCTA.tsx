import { useState, useEffect } from "react";

// ─── Sticky Mobile CTA Bar ────────────────────────────────────────────────────
// Performance: Mobile users often miss the main CTA when scrolling.
// This sticky bar appears after 3s or 400px scroll, dramatically increasing mobile CVR.
// Updated 2026-04-22: Added urgency countdown, personalized price display, dismiss button

interface StickyMobileCTAProps {
  label: string;
  subtext?: string;
  price?: string;
  originalPrice?: string;
  onClick: () => void;
  countdown?: string; // Optional countdown display
  countdownExpired?: boolean;
}

export default function StickyMobileCTA({
  label,
  subtext,
  price,
  originalPrice,
  onClick,
  countdown,
  countdownExpired,
}: StickyMobileCTAProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Show after 3 seconds
    const timer = setTimeout(() => setVisible(true), 3000);

    // Also show on scroll
    const handleScroll = () => {
      if (window.scrollY > 400) setVisible(true);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [dismissed]);

  if (!visible || dismissed) return null;

  return (
    // Only visible on mobile (md:hidden)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-4 pt-2"
      style={{
        background: "linear-gradient(to top, oklch(0.07 0.02 265) 60%, transparent)",
      }}
    >
      <div
        className="rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: "oklch(0.12 0.025 265 / 0.98)",
          border: "1px solid oklch(0.65 0.22 280 / 0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Urgency strip */}
        {countdown && !countdownExpired && (
          <div
            className="text-center py-1.5 text-xs font-bold"
            style={{ background: "oklch(0.65 0.22 280 / 0.15)", color: "oklch(0.85 0.15 280)" }}
          >
            ⏰ Offer expires in <span className="font-mono animate-countdown-tick">{countdown}</span>
          </div>
        )}
        {countdownExpired && (
          <div className="text-center py-1.5 text-xs font-bold bg-red-900/30 text-red-400">
            ⚠️ Offer expired — standard pricing applies
          </div>
        )}

        <div className="flex items-center gap-3 px-4 py-3">
          {/* Price */}
          {price && (
            <div className="flex-shrink-0 text-center">
              {originalPrice && (
                <p className="text-[10px] text-[oklch(0.45_0.03_265)] line-through">{originalPrice}</p>
              )}
              <p className="text-2xl font-black text-white leading-none">{price}</p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={onClick}
            className="flex-1 py-3.5 rounded-xl font-black text-sm text-white cta-shimmer"
            style={{
              background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 295))",
              boxShadow: "0 4px 20px oklch(0.65 0.22 280 / 0.4)",
            }}
          >
            {label}
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-[oklch(0.35_0.03_265)] hover:text-[oklch(0.55_0.04_265)] transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {subtext && (
          <p className="text-center text-[10px] text-[oklch(0.45_0.03_265)] pb-2 px-4">{subtext}</p>
        )}
      </div>
    </div>
  );
}
