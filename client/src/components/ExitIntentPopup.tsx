/*
 * Exit-Intent Popup — COUPON VERSION (SLEEP20)
 * Design: Midnight Noir — dark overlay with amber accent
 * Strategy: Show SLEEP20 coupon (20% off) to capture abandoning visitors
 * Triggers when mouse leaves viewport (desktop) or after scroll-up pattern (mobile)
 * Shows only once per session to avoid annoyance
 * i18n: All strings from useLanguage()
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Clock, Zap, Copy, Check } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

const SESSION_KEY = "dsr-exit-popup-shown";
const REVEAL_DELAY_S = 3; // seconds before coupon code appears

interface ExitIntentPopupProps {
  /** If true, only shows on the current path (e.g. /order). If false, shows on home too. */
  orderPageOnly?: boolean;
}

export default function ExitIntentPopup({ orderPageOnly = false }: ExitIntentPopupProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(10 * 60); // 10-min offer countdown
  const [revealCountdown, setRevealCountdown] = useState(REVEAL_DELAY_S);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const hasShown = useRef(false);

  const showPopup = useCallback(() => {
    if (hasShown.current) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    // If orderPageOnly, only show on /order paths
    if (orderPageOnly) {
      const path = window.location.pathname;
      if (!path.includes("/order")) return;
    } else {
      // Default: show on home and /es home only
      const path = window.location.pathname;
      if (path !== "/" && path !== "/es" && !path.startsWith("/es/") && !path.includes("/order")) return;
    }

    hasShown.current = true;
    sessionStorage.setItem(SESSION_KEY, "true");
    setIsVisible(true);
    trackEvent("ExitIntentShown");

    // Start reveal countdown
    let r = REVEAL_DELAY_S;
    setRevealCountdown(r);
    const revealIv = setInterval(() => {
      r -= 1;
      setRevealCountdown(r);
      if (r <= 0) {
        clearInterval(revealIv);
        setRevealed(true);
      }
    }, 1000);
  }, [orderPageOnly]);

  // Desktop: exit intent via mouseleave toward top
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) showPopup();
    };

    // Delay attaching listener by 10s to avoid premature triggers
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [showPopup]);

  // Mobile: trigger on scroll-up pattern (user going back to top = exit intent)
  useEffect(() => {
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
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 10000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showPopup]);

  // Offer countdown (10 minutes)
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

  const handleCopy = () => {
    const code = t.exitPopup.couponCode ?? "SLEEP20";
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCTA = () => {
    trackEvent("ExitIntentClicked", { coupon: "SLEEP20" });
    handleCopy();
    // Navigate to order page if not already there
    const path = window.location.pathname;
    if (!path.includes("/order")) {
      navigate("/order");
    }
    setTimeout(() => setIsVisible(false), 600);
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

          {/* Modal */}
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

              {/* Top accent line */}
              <div className="h-1 bg-gradient-to-r from-amber/0 via-amber to-amber/0" />

              {/* Badge */}
              <div className="absolute top-6 left-6">
                <div className="flex items-center gap-1.5 bg-amber/15 border border-amber/30 text-amber px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  {t.exitPopup.badge}
                </div>
              </div>

              <div className="p-8 sm:p-10 text-center pt-16">
                {/* Headline */}
                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-2 leading-tight">
                  {t.exitPopup.title}
                  <span className="text-amber italic">{t.exitPopup.titleHighlight}</span>
                </h3>
                <p className="text-foreground/50 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
                  {t.exitPopup.subtitle}
                </p>

                {/* Coupon reveal */}
                <AnimatePresence mode="wait">
                  {!revealed ? (
                    <motion.div
                      key="reveal-countdown"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-2 mb-6"
                    >
                      <p className="text-foreground/40 text-xs uppercase tracking-widest">
                        Your discount code unlocks in
                      </p>
                      <span className="font-mono text-5xl font-bold text-amber tabular-nums">
                        {revealCountdown}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="coupon-block"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="mb-6"
                    >
                      <p className="text-foreground/40 text-xs uppercase tracking-widest mb-2">
                        {t.exitPopup.couponLabel ?? "Your exclusive discount code:"}
                      </p>
                      <button
                        onClick={handleCopy}
                        className="group inline-flex items-center gap-3 bg-amber/10 border-2 border-amber/40 hover:border-amber/70 rounded-xl px-6 py-3 transition-all duration-200 hover:bg-amber/15 mx-auto"
                      >
                        <span className="font-mono text-2xl font-bold text-amber tracking-widest">
                          {t.exitPopup.couponCode ?? "SLEEP20"}
                        </span>
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400 shrink-0" />
                        ) : (
                          <Copy className="w-5 h-5 text-amber/50 group-hover:text-amber/80 shrink-0 transition-colors" />
                        )}
                      </button>
                      {copied && (
                        <p className="text-green-400 text-xs mt-2 font-medium">
                          {t.exitPopup.couponCopied ?? "Copied to clipboard!"}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Offer countdown */}
                <div className="flex items-center justify-center gap-2 text-sm mb-5">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">
                    {t.exitPopup.offerExpires}{" "}
                    <span className="font-mono font-bold">
                      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                    </span>
                  </span>
                </div>

                {/* What you get */}
                <div className="text-left max-w-xs mx-auto mb-7 space-y-2.5">
                  {t.exitPopup.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-foreground/60 text-sm">
                      <div className="w-4 h-4 rounded-full bg-amber/15 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>

                {/* CTA button */}
                <button
                  onClick={handleCTA}
                  disabled={!revealed}
                  className="cta-shimmer w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-4 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {revealed ? t.exitPopup.ctaButton : "Preparing your discount..."}
                  {revealed && <ArrowRight className="w-5 h-5" />}
                </button>

                <p className="mt-2 text-foreground/30 text-xs">
                  {t.exitPopup.savings}
                </p>

                <button
                  onClick={handleClose}
                  className="mt-4 text-foreground/25 hover:text-foreground/40 text-xs transition-colors"
                >
                  {t.exitPopup.decline}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
