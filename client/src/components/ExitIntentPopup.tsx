/*
 * Exit-Intent Popup — DISCOUNT VERSION
 * Design: Midnight Noir — dark overlay with amber accent
 * Strategy: Show $5→$4 discount (20% off) to capture abandoning visitors
 * Triggers when mouse leaves viewport (desktop) or after scroll-up pattern (mobile)
 * Shows only once per session to avoid annoyance
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Clock, Zap, Gift } from "lucide-react";
import { openCheckout } from "@/lib/checkout";
import { trackEvent } from "@/components/MetaPixel";

const SESSION_KEY = "dsr-exit-popup-shown";

export default function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10 * 60);

  const showPopup = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (window.location.pathname !== "/" && !window.location.pathname.startsWith("/es")) return;

    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(true);
    trackEvent("ExitIntentShown");
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) showPopup();
    };

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

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isVisible]);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  const handleClose = () => setIsVisible(false);

  const handleCTA = () => {
    trackEvent("ExitIntentClicked", { discount: true, value: 4 });
    openCheckout("exitDiscount");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90vw] max-w-lg"
          >
            <div className="relative bg-[#0d1220] border border-amber/20 rounded-2xl overflow-hidden shadow-2xl shadow-amber/5">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-foreground/30 hover:text-foreground/60 transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="h-1 bg-gradient-to-r from-amber/0 via-amber to-amber/0" />

              <div className="absolute top-6 left-6">
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  20% OFF
                </div>
              </div>

              <div className="p-8 sm:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-5">
                  <Gift className="w-8 h-8 text-amber" />
                </div>

                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-2">
                  Wait — <span className="text-amber italic">Special Offer</span>
                </h3>
                <p className="text-foreground/40 text-sm mb-5">
                  Just for you, because you almost left...
                </p>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-center">
                    <span className="text-foreground/30 text-sm block">Regular Price</span>
                    <span className="text-foreground/40 line-through text-2xl font-bold">$5</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber/50" />
                  <div className="text-center">
                    <span className="text-amber text-sm block font-semibold">Your Price Now</span>
                    <span className="text-amber text-4xl font-bold font-[var(--font-display)] text-glow">$4</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm mb-6">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">
                    Offer expires in{" "}
                    <span className="font-mono font-bold">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                  </span>
                </div>

                <div className="text-left max-w-xs mx-auto mb-7 space-y-2.5">
                  {[
                    "Full 7-Night Sleep Reset Program",
                    "Guided Audio Sessions",
                    "Printable Sleep Journal",
                    "30-Day Money-Back Guarantee",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-foreground/60 text-sm">
                      <div className="w-4 h-4 rounded-full bg-amber/15 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCTA}
                  className="cta-shimmer w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-4 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Claim My $4 Discount Now
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="mt-2 text-foreground/30 text-xs">
                  You save $1 — instant digital access
                </p>

                <button
                  onClick={handleClose}
                  className="mt-4 text-foreground/25 hover:text-foreground/40 text-xs transition-colors"
                >
                  No thanks, I'd rather pay full price later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
