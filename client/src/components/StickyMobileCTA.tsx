/*
 * Sticky Mobile CTA Bar
 * Design: Midnight Noir — fixed bottom bar, visible only on mobile/tablet
 * Appears after user scrolls past the hero section (~600px)
 * Hides when user is near the main offer section to avoid overlap
 * i18n: Strings from useLanguage()
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

export default function StickyMobileCTA() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      // Show after scrolling past hero (~600px)
      // Hide when near bottom (last 20% of page — near offer/footer)
      const pastHero = scrollY > 600;
      const nearBottom = scrollY + viewportHeight > docHeight * 0.8;

      setIsVisible(pastHero && !nearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Only show on mobile/tablet — hidden on lg+ via CSS
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          {/* Top shadow gradient */}
          <div className="h-6 bg-gradient-to-t from-[#0a0e1a] to-transparent" />

          <div className="bg-[#0a0e1a]/95 backdrop-blur-md border-t border-amber/10 px-4 pb-[env(safe-area-inset-bottom,8px)] pt-3">
            <div className="flex items-center gap-3">
              {/* Price info */}
              <div className="flex-1 min-w-0">
                <p className="text-foreground/90 font-semibold text-sm truncate">
                  7-Night Deep Sleep Reset
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-amber font-bold text-lg">$5</span>
                  <span className="text-foreground/30 line-through text-xs">$47</span>
                  <span className="text-green-400/80 text-xs font-medium">89% OFF</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/order")}
                className="shrink-0 inline-flex items-center gap-2 bg-amber hover:bg-amber-light text-background font-bold px-5 py-3 rounded-xl text-sm transition-all duration-300 active:scale-95"
              >
                {t.stickyCta.text}{t.stickyCta.price}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
