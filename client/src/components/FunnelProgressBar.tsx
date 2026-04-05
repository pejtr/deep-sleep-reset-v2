/**
 * FunnelProgressBar — GuruGo-style sticky top bar
 * Shows "Don't close — complete your order" with animated progress fill.
 * Steps: landing(5%) → order(35%) → upsell1(65%) → upsell2(85%) → thankyou(100%)
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface FunnelProgressBarProps {
  step: "landing" | "order" | "upsell1" | "upsell2" | "upsell3" | "thankyou";
}

const STEP_CONFIG = {
  landing:  { pct: 5,   label: "Start your sleep transformation" },
  order:    { pct: 35,  label: "Almost there — complete your order" },
  upsell1:  { pct: 65,  label: "Great choice! Enhance your results" },
  upsell2:  { pct: 75,  label: "One last step — you're almost done!" },
  upsell3:  { pct: 90,  label: "Final upgrade — maximize your results!" },
  thankyou: { pct: 100, label: "Welcome to the Deep Sleep Reset family!" },
};

export function FunnelProgressBar({ step }: FunnelProgressBarProps) {
  const { pct, label } = STEP_CONFIG[step];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay so the bar animates in visibly
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  const isComplete = pct === 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-[#1a1a2e] shadow-lg">
      {/* Label row */}
      <div className="flex items-center justify-between px-4 py-1.5">
        <p className="text-xs font-semibold text-amber/90 tracking-wide truncate">
          {isComplete ? "✓ Order complete!" : `⚡ Don't close — ${label}`}
        </p>
        <span className="text-xs font-bold text-amber ml-2 shrink-0">
          {pct}%
        </span>
      </div>

      {/* Progress track */}
      <div className="h-1.5 w-full bg-white/10">
        <motion.div
          className={`h-full rounded-r-full ${isComplete ? "bg-green-400" : "bg-amber"}`}
          initial={{ width: "0%" }}
          animate={{ width: mounted ? `${pct}%` : "0%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
