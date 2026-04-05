/**
 * StickyUpsellBar — GuruGo-style sticky bottom CTA bar for upsell pages
 * Shows after 3s or 300px scroll, with:
 * - Product name + price
 * - "Yes, Add to My Program" CTA button
 * - "I decline this offer" link
 * - Smooth slide-up animation
 */

import { useEffect, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";

interface StickyUpsellBarProps {
  productName: string;
  price: string;
  originalPrice?: string;
  ctaLabel?: string;
  declineLabel?: string;
  onAccept: () => void;
  onDecline: () => void;
  /** Accent color class for the CTA button background */
  accentClass?: string;
}

export default function StickyUpsellBar({
  productName,
  price,
  originalPrice,
  ctaLabel = "Yes, Add to My Program",
  declineLabel = "I decline this offer",
  onAccept,
  onDecline,
  accentClass = "bg-amber hover:bg-amber-light",
}: StickyUpsellBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show after 3 seconds OR after scrolling 300px — whichever comes first
    const timer = setTimeout(() => setVisible(true), 3000);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
        clearTimeout(timer);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ease-out ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Gradient fade above the bar */}
      <div className="h-8 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />

      {/* Main bar */}
      <div className="bg-background/95 backdrop-blur-md border-t border-border/30 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 py-3 sm:py-4">
          {/* Product info row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-foreground/50 text-xs uppercase tracking-wider mb-0.5">Special One-Time Offer</p>
              <p className="text-foreground/80 text-sm font-medium truncate">{productName}</p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              {originalPrice && (
                <span className="text-foreground/30 line-through text-sm">{originalPrice}</span>
              )}
              <span className="text-amber font-bold text-xl">{price}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onAccept}
            className={`w-full inline-flex items-center justify-center gap-2 ${accentClass} text-background font-bold px-6 py-3.5 rounded-xl text-base transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg mb-2`}
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Decline link */}
          <div className="text-center">
            <button
              onClick={onDecline}
              className="text-foreground/25 text-xs hover:text-foreground/45 transition-colors underline underline-offset-2 py-1"
            >
              {declineLabel}
            </button>
          </div>

          {/* Security note */}
          <p className="text-center text-foreground/25 text-xs flex items-center justify-center gap-1 mt-1">
            <Lock className="w-3 h-3" />
            One-click add — no re-entering payment info
          </p>
        </div>
      </div>
    </div>
  );
}
