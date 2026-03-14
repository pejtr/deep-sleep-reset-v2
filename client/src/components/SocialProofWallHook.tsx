/*
 * Variant C: Social Proof Wall Hook
 *
 * Design: A compact bottom-center bar that slides up after 3 seconds.
 * Shows a rotating testimonial ticker (one at a time, auto-cycling every 5s)
 * plus a live "X people changed their sleep this week" counter.
 * A CTA button anchors to the offer section.
 *
 * Conversion event: fired when user clicks the CTA.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Users, ChevronRight } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { getSessionId } from "@/lib/ab-hooks";
import { trpc } from "@/lib/trpc";
import type { HookVariant } from "@/lib/ab-hooks";

const TESTIMONIALS = [
  { name: "Sarah M.", location: "Austin, TX", text: "I cried the morning after Night 4. I'd forgotten what rested felt like.", stars: 5 },
  { name: "James K.", location: "London, UK", text: "The Night 4 breathing technique alone was worth 100x the price.", stars: 5 },
  { name: "Maria L.", location: "Toronto, CA", text: "4 years of broken sleep. Fixed in 7 nights. This is not normal for me.", stars: 5 },
  { name: "David R.", location: "Sydney, AU", text: "Woke up this morning and thought: 'That was the best sleep in years.'", stars: 5 },
  { name: "Emma T.", location: "Berlin, DE", text: "I was the biggest skeptic. Now I recommend this to everyone I know.", stars: 5 },
];

// Simulated live counter — starts at a base and fluctuates slightly
function useLiveCounter(base: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3)); // +0, +1, or +2 every 45s
    }, 45000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

interface SocialProofWallHookProps {
  onConversion?: () => void;
}

export default function SocialProofWallHook({ onConversion }: SocialProofWallHookProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const weeklyCount = useLiveCounter(847);

  const trackAbEvent = trpc.ab.trackEvent.useMutation();

  const trackImpression = useCallback(() => {
    trackAbEvent.mutate({
      variant: "social" as HookVariant,
      eventType: "impression",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookImpression", { variant: "social" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      trackImpression();
    }, 3000);
    return () => clearTimeout(t);
  }, [trackImpression]);

  // Cycle testimonials every 5 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible]);

  const handleCTAClick = () => {
    trackAbEvent.mutate({
      variant: "social" as HookVariant,
      eventType: "conversion",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookConversion", { variant: "social" });
    onConversion?.();
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
    setDismissed(true);
  };

  const testimonial = TESTIMONIALS[currentIdx];

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 28 }}
          className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4"
        >
          <div className="w-full max-w-2xl bg-[#0d1220]/95 backdrop-blur-md border border-amber/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
            {/* Top gradient line */}
            <div className="h-0.5 bg-gradient-to-r from-amber/0 via-amber/50 to-amber/0" />

            <div className="flex items-stretch gap-0">
              {/* Left: Live counter */}
              <div className="flex flex-col items-center justify-center px-4 py-3 border-r border-border/10 min-w-[90px] shrink-0">
                <Users className="w-4 h-4 text-amber/70 mb-1" />
                <motion.span
                  key={weeklyCount}
                  initial={{ scale: 1.2, color: "oklch(0.75 0.15 85)" }}
                  animate={{ scale: 1, color: "oklch(0.9 0.05 85)" }}
                  className="text-xl font-bold text-foreground/90 tabular-nums"
                >
                  {weeklyCount.toLocaleString()}
                </motion.span>
                <span className="text-[10px] text-foreground/40 text-center leading-tight mt-0.5">
                  lives changed<br />this week
                </span>
              </div>

              {/* Center: Rotating testimonial */}
              <div className="flex-1 px-4 py-3 min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-1">
                      {Array.from({ length: testimonial.stars }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="text-foreground/80 text-xs sm:text-sm leading-snug line-clamp-2">
                      "{testimonial.text}"
                    </p>
                    {/* Attribution */}
                    <p className="text-foreground/40 text-[10px] mt-1">
                      — {testimonial.name}, {testimonial.location}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right: CTA */}
              <div className="flex flex-col items-center justify-center px-3 py-3 shrink-0 gap-2">
                <button
                  onClick={handleCTAClick}
                  className="flex items-center gap-1 bg-amber text-background text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber/90 transition-colors whitespace-nowrap"
                >
                  Try for $5
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDismissed(true)}
                  className="text-foreground/25 hover:text-foreground/50 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
