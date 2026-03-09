/*
 * Exit-Intent Popup
 * Design: Midnight Noir — dark overlay with amber accent
 * Triggers when mouse leaves viewport (desktop) or after scroll-up pattern (mobile)
 * Shows only once per session to avoid annoyance
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Moon, ArrowRight, Clock } from "lucide-react";
import { openCheckout } from "@/lib/checkout";
import { trackEvent } from "@/components/MetaPixel";

const SESSION_KEY = "dsr-exit-popup-shown";

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);

  const showPopup = useCallback(() => {
    // Only show once per session
    if (sessionStorage.getItem(SESSION_KEY)) return;
    // Don't show on upsell or thank-you pages
    if (window.location.pathname !== "/") return;

    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(true);
    trackEvent("ExitIntentShown");
  }, []);

  useEffect(() => {
    // Desktop: detect mouse leaving viewport
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // Mobile: detect rapid scroll up (back-to-top gesture)
    let lastScrollY = window.scrollY;
    let scrollUpDistance = 0;

    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastScrollY) {
        scrollUpDistance += lastScrollY - currentY;
        if (scrollUpDistance > 300 && currentY > 500) {
          scrollUpDistance = 0;
          showPopup();
        }
      } else {
        scrollUpDistance = 0;
      }
      lastScrollY = currentY;
    };

    // Delay activation by 10 seconds so it doesn't fire immediately
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showPopup]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    trackEvent("ExitIntentClicked");
    openCheckout("frontEnd");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-lg"
          >
            <div className="relative bg-[#0d1220] border border-amber/20 rounded-2xl overflow-hidden shadow-2xl shadow-amber/5">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-foreground/30 hover:text-foreground/60 transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top accent bar */}
              <div className="h-1 bg-gradient-to-r from-amber/0 via-amber to-amber/0" />

              <div className="p-8 sm:p-10 text-center">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
                  <Moon className="w-8 h-8 text-amber" />
                </div>

                {/* Headline */}
                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-3">
                  Wait — Don't Leave{" "}
                  <span className="text-amber italic">Sleepless</span>
                </h3>

                <p className="text-foreground/50 leading-relaxed mb-6 max-w-sm mx-auto">
                  You're one click away from the best sleep of your life.
                  The 7-Night Deep Sleep Reset is just <strong className="text-amber">$5</strong> — less than a cup of coffee.
                </p>

                {/* Urgency element */}
                <div className="flex items-center justify-center gap-2 text-amber/70 text-sm mb-6">
                  <Clock className="w-4 h-4" />
                  <span>This price won't last forever</span>
                </div>

                {/* What you get mini-list */}
                <div className="text-left max-w-xs mx-auto mb-8 space-y-2.5">
                  {[
                    "Full 7-Night Sleep Reset Program",
                    "Guided Audio Sessions",
                    "Printable Sleep Journal",
                    "30-Day Money-Back Guarantee",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-foreground/55 text-sm">
                      <div className="w-4 h-4 rounded-full bg-amber/15 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={handleCTA}
                  className="w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Get Instant Access — $5
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* No thanks */}
                <button
                  onClick={handleClose}
                  className="mt-4 text-foreground/25 hover:text-foreground/40 text-xs transition-colors"
                >
                  No thanks, I'll keep counting sheep
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
