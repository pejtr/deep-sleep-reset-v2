/*
 * PreCheckoutPopup — GuruGo-style "Wait! Unlock a Special Limited-Time Offer!"
 * Shown when user clicks main CTA on Home page, before opening Stripe checkout.
 * Features:
 *  - Swipeable carousel of add-on products (touch + mouse drag)
 *  - Live total counter that updates as user adds/removes items
 *  - Email capture field (pre-fills Stripe checkout)
 *  - "Proceed to Checkout" → opens Stripe with selected products
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Check, Lock, ShoppingCart } from "lucide-react";
import { openBundleCheckout, openCheckout } from "@/lib/checkout";
import { toast } from "sonner";

interface AddOn {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
}

const ADD_ONS: AddOn[] = [
  {
    id: "upsell1",
    title: "Anxiety Dissolve Audio Pack",
    subtitle: "3 guided audio sessions to silence racing thoughts in minutes",
    price: 9,
    originalPrice: 47,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
    badge: "Most Popular",
  },
  {
    id: "upsell2",
    title: "Sleep Optimizer Toolkit",
    subtitle: "4-week sleep tracking system + habit builder + environment checklist",
    price: 9,
    originalPrice: 47,
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&q=80",
    badge: "Best Value",
  },
  {
    id: "upsell3",
    title: "Advanced Sleep Mastery Protocol",
    subtitle: "30-day CBT-I deep dive + sleep coach access + lifetime updates",
    price: 19,
    originalPrice: 97,
    image: "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400&q=80",
    badge: "Premium",
  },
];

const BASE_PRICE = 5;

interface PreCheckoutPopupProps {
  isOpen: boolean;
  onClose: () => void;
  abVariant?: string;
}

export function PreCheckoutPopup({ isOpen, onClose, abVariant }: PreCheckoutPopupProps) {
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [email, setEmail] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAddOns(new Set());
      setEmail("");
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const totalPrice = BASE_PRICE + ADD_ONS
    .filter(a => selectedAddOns.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  const totalOriginal = BASE_PRICE + ADD_ONS
    .filter(a => selectedAddOns.has(a.id))
    .reduce((sum, a) => sum + a.originalPrice, 0);

  const savings = totalOriginal - totalPrice;

  const handleProceed = async () => {
    setIsLoading(true);
    try {
      // Store email for Stripe prefill if provided
      if (email) {
        sessionStorage.setItem("checkout_email", email);
      }

      const selectedIds = Array.from(selectedAddOns);

      if (selectedIds.length === 0) {
        // Just base product
        openCheckout("frontEnd");
      } else if (selectedIds.length === 1) {
        // Base + one add-on — use bundle checkout
        openBundleCheckout(["frontEnd", selectedIds[0] as "upsell1" | "upsell2" | "upsell3"]);
      } else {
        // Base + multiple add-ons
        openBundleCheckout(["frontEnd", ...selectedIds as ("upsell1" | "upsell2" | "upsell3")[]]);
      }
      onClose();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const prevSlide = () => setCurrentSlide(p => Math.max(0, p - 1));
  const nextSlide = () => setCurrentSlide(p => Math.min(ADD_ONS.length - 1, p + 1));

  // Touch/mouse drag support
  const handleDragStart = (clientX: number) => {
    dragStartX.current = clientX;
  };
  const handleDragEnd = (clientX: number) => {
    if (dragStartX.current === null) return;
    const diff = dragStartX.current - clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    dragStartX.current = null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-[101] w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight pr-8">
                Wait! Unlock a Special<br />
                <span className="text-pink-500">Limited-Time Offer!</span>
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                Before you complete your purchase, grab these exclusive add-ons at <strong>90% off</strong>!
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 mx-6" />

            {/* Swipe hint */}
            <div className="flex items-center justify-center gap-2 py-3 text-gray-400 text-sm">
              <span>👆</span>
              <span>Swipe to see more</span>
              <span>→</span>
            </div>

            {/* Carousel */}
            <div className="relative px-4">
              {/* Prev/Next buttons */}
              {currentSlide > 0 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {currentSlide < ADD_ONS.length - 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Slides container */}
              <div
                ref={carouselRef}
                className="overflow-hidden"
                onMouseDown={e => handleDragStart(e.clientX)}
                onMouseUp={e => handleDragEnd(e.clientX)}
                onTouchStart={e => handleDragStart(e.touches[0].clientX)}
                onTouchEnd={e => handleDragEnd(e.changedTouches[0].clientX)}
              >
                <motion.div
                  className="flex"
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                >
                  {ADD_ONS.map((addon) => {
                    const isSelected = selectedAddOns.has(addon.id);
                    return (
                      <div key={addon.id} className="min-w-full px-2">
                        <div
                          className={`relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-pink-500 bg-pink-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                          onClick={() => toggleAddOn(addon.id)}
                        >
                          {/* Badge */}
                          <div className="absolute top-2 left-2 z-10">
                            <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {addon.badge}
                            </span>
                          </div>

                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}

                          {/* Image */}
                          <div className="h-36 overflow-hidden">
                            <img
                              src={addon.image}
                              alt={addon.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1">
                              {addon.title}
                            </h3>
                            <p className="text-gray-500 text-xs leading-relaxed mb-3">
                              {addon.subtitle}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-gray-900">${addon.price}</span>
                                <span className="text-sm text-gray-400 line-through">${addon.originalPrice}</span>
                              </div>
                              <button
                                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                                  isSelected
                                    ? "bg-pink-500 text-white"
                                    : "bg-gray-900 text-white hover:bg-gray-700"
                                }`}
                              >
                                {isSelected ? "✓ ADDED" : "ADD TO ORDER"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5 mt-3">
                {ADD_ONS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentSlide ? "bg-pink-500 w-4" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 mx-6 mt-4" />

            {/* Live Total */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 font-medium">Total:</span>
                <div className="flex items-center gap-2">
                  {savings > 0 && (
                    <span className="text-gray-400 text-sm line-through">${totalOriginal}</span>
                  )}
                  <motion.span
                    key={totalPrice}
                    initial={{ scale: 1.2, color: "#ec4899" }}
                    animate={{ scale: 1, color: "#111827" }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl font-bold"
                  >
                    ${totalPrice}
                  </motion.span>
                </div>
              </div>
              {savings > 0 && (
                <p className="text-green-600 text-xs font-medium text-right">
                  You save ${savings}!
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="px-6 pb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@site.com"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              />
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <button
                onClick={handleProceed}
                disabled={isLoading}
                className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    PROCEED TO CHECKOUT
                  </>
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" />
                Secure checkout · 30-day money-back guarantee
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
