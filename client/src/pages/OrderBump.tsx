/*
 * Order Bump Page — /order
 * 
 * Shown when user clicks the main CTA on the homepage.
 * Lets them add optional modules before going to Stripe checkout.
 * 
 * Products:
 *   - Base: 7-Night Deep Sleep Reset ($5) — always included
 *   - Bump 1: Anxiety Dissolve Audio Pack ($10) — optional
 *   - Bump 2: Sleep Optimizer Toolkit ($10) — optional
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, CheckCircle, Headphones, BarChart3, Lock, ArrowRight, Star, Zap, AlertTriangle } from "lucide-react";
import { openBundleCheckout, openCheckout, type ProductKey } from "@/lib/checkout";
import { Link, useSearch } from "wouter";
import { trackEvent } from "@/components/MetaPixel";
import ReturningCustomerBanner from "@/components/ReturningCustomerBanner";

const AUDIO_SESSIONS = [
  { title: "The Emergency Calm Audio", duration: "5 min", desc: "Instant relief when anxiety spikes — use it anywhere, anytime." },
  { title: "The Sleep Onset Meditation", duration: "15 min", desc: "Guides you from wakefulness into deep sleep within minutes." },
  { title: "The Morning Anxiety Shield", duration: "10 min", desc: "Start every day with a protective layer of calm." },
  { title: "The Afternoon Reset", duration: "10 min", desc: "Prevent stress buildup before it ruins your night." },
  { title: "The Deep Sunday Reset", duration: "20 min", desc: "Full nervous system reset to prepare for the week ahead." },
];

const TOOLKIT_ITEMS = [
  { title: "Sleep Score Tracker", desc: "Track your sleep quality night by night and see your progress." },
  { title: "Bedroom Audit Checklist", desc: "Identify and fix the hidden factors sabotaging your sleep environment." },
  { title: "Supplement Guide", desc: "Evidence-based guide to natural sleep supplements (and what to avoid)." },
  { title: "Screen Detox Protocol", desc: "A 7-day plan to reset your relationship with blue light and devices." },
];

export default function OrderBump() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const isExitDiscount = searchParams.get("discount") === "exit";

  // Default-checked per ChatGPT recommendation — bundle pre-selected
  const [addAudio, setAddAudio] = useState(true);
  const [addToolkit, setAddToolkit] = useState(true);
  const [loading, setLoading] = useState(false);

  const basePrice = isExitDiscount ? 4 : 5;
  const audioPrice = 10;
  const toolkitPrice = 10;
  const totalPrice = basePrice + (addAudio ? audioPrice : 0) + (addToolkit ? toolkitPrice : 0);
  const primaryKey: ProductKey = isExitDiscount ? "exitDiscount" : "frontEnd";

  const handleCheckout = async () => {
    setLoading(true);
    const products: ProductKey[] = [primaryKey];
    if (addAudio) products.push("upsell1");
    if (addToolkit) products.push("upsell2");

    // Fire InitiateCheckout event before redirecting to Stripe
    trackEvent("InitiateCheckout", {
      value: totalPrice,
      currency: "USD",
      num_items: products.length,
      content_ids: products,
    });

    if (products.length === 1) {
      await openCheckout(primaryKey);
    } else {
      await openBundleCheckout(products);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/20 py-4 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold text-amber">
              Deep Sleep Reset
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <Lock className="w-3 h-3" />
            Secure Checkout
          </div>
        </div>
      </header>

      {/* Progress bar — Step 2 of 3 */}
      <div className="w-full bg-border/10 py-3 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-background text-xs font-bold">
                ✓
              </div>
              <span className="text-[10px] text-amber font-medium hidden sm:block">Your Info</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-amber" />
            {/* Step 2 — current */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-amber flex items-center justify-center text-background text-xs font-bold ring-2 ring-amber ring-offset-2 ring-offset-background">
                2
              </div>
              <span className="text-[10px] text-amber font-medium hidden sm:block">Customize</span>
            </div>
            {/* Connector */}
            <div className="flex-1 h-0.5 bg-border/30" />
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-border/30 flex items-center justify-center text-foreground/40 text-xs font-bold">
                3
              </div>
              <span className="text-[10px] text-foreground/40 hidden sm:block">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Returning customer one-click upgrade banner */}
        <ReturningCustomerBanner />

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          {isExitDiscount && (
            <div className="inline-flex items-center gap-2 bg-amber/20 border border-amber/30 text-amber px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🎁 Special Offer Applied — 20% Off ($5 → $4)
            </div>
          )}
          {/* ChatGPT-recommended urgency banner */}
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <AlertTriangle className="w-4 h-4" />
            Don't Stop at 60% — Unlock Full Sleep Reset
          </div>
          <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-3 font-medium">
            Step 2 of 3 — Upgrade Your Order
          </p>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
            Most users who skip this take{" "}
            <span className="text-amber italic">2–3× longer</span>{" "}to fix their sleep.
          </h1>
          <p className="text-foreground/60 text-lg max-w-xl mx-auto">
            Both upgrades are pre-selected below at a special one-time price. 
            Uncheck anything you don't want — or grab the bundle and save $14.
          </p>
        </motion.div>

        {/* Base Product — always included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="border border-amber/30 rounded-2xl p-6 bg-card/40 mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5 text-amber" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                  Included
                </span>
              </div>
              <h3 className="font-[var(--font-display)] text-xl font-semibold mb-1">
                The 7-Night Deep Sleep Reset
              </h3>
              <p className="text-foreground/60 text-sm mb-3">
                The complete 7-night CBT-I protocol. One powerful technique per night. 
                Fixes your sleep permanently — not just tonight.
              </p>
              <div className="flex flex-wrap gap-2">
                {["7 Nightly Modules", "Guided Audio", "Sleep Journal", "CBT-I Based"].map((tag) => (
                  <span key={tag} className="text-xs text-foreground/50 border border-border/30 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-foreground/40 line-through text-sm">$47</span>
              {isExitDiscount && <span className="text-foreground/40 line-through text-sm ml-2">$5</span>}
              <div className="font-[var(--font-display)] text-2xl font-bold text-amber">${basePrice}</div>
            </div>
          </div>
        </motion.div>

        {/* Order Bump 1 — Anxiety Dissolve Audio Pack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`border-2 rounded-2xl p-6 mb-6 cursor-pointer transition-all duration-300 ${
            addAudio
              ? "border-amber bg-amber/5"
              : "border-border/40 bg-card/20 hover:border-amber/40 hover:bg-card/30"
          }`}
          onClick={() => setAddAudio(!addAudio)}
        >
          {/* Bump badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-amber text-background px-3 py-1 rounded-full font-bold uppercase tracking-wide">
              ⚡ One-Time Add-On
            </span>
            <span className="text-xs text-foreground/40">Only available here</span>
          </div>

          <div className="flex items-start gap-4">
            {/* Checkbox */}
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                addAudio ? "border-amber bg-amber" : "border-border/50"
              }`}
            >
              {addAudio && <CheckCircle className="w-4 h-4 text-background" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Headphones className="w-5 h-5 text-amber/70" />
                <h3 className="font-[var(--font-display)] text-xl font-semibold">
                  🧠 Anxiety Shutdown Audio
                </h3>
                <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full font-medium">Most Popular</span>
              </div>
              <p className="text-foreground/60 text-sm mb-1 font-medium text-foreground/80">
                Stops racing thoughts in under 10 minutes.
              </p>
              <p className="text-foreground/50 text-xs mb-4">
                Used by 3,200+ users — 5 professionally guided sessions that shut down anxiety on demand.
              </p>

              {/* Audio sessions list */}
              <div className="space-y-2 mb-4">
                {AUDIO_SESSIONS.map((session, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-amber text-[10px] font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-foreground/70 text-sm font-medium">{session.title}</span>
                        <span className="text-foreground/40 text-xs">({session.duration})</span>
                        <span className="text-xs text-amber/70 bg-amber/10 border border-amber/20 px-1.5 py-0.5 rounded-full font-medium">Coming Soon</span>
                      </div>
                      <p className="text-foreground/40 text-xs">{session.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber fill-amber" />
                ))}
                <span className="text-foreground/40 text-xs ml-1">60 minutes of guided audio</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-foreground/40 line-through text-sm">$29</span>
              <div className="font-[var(--font-display)] text-2xl font-bold text-amber">+$10</div>
              <span className="text-xs text-amber/60">today only</span>
            </div>
          </div>

          {addAudio && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-amber/20"
            >
              <p className="text-amber/80 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Added to your order! You'll get instant access after purchase.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Order Bump 2 — Sleep Optimizer Toolkit */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`border-2 rounded-2xl p-6 mb-8 cursor-pointer transition-all duration-300 ${
            addToolkit
              ? "border-amber bg-amber/5"
              : "border-border/40 bg-card/20 hover:border-amber/40 hover:bg-card/30"
          }`}
          onClick={() => setAddToolkit(!addToolkit)}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-amber text-background px-3 py-1 rounded-full font-bold uppercase tracking-wide">
              ⚡ One-Time Add-On
            </span>
            <span className="text-xs text-foreground/40">Only available here</span>
          </div>

          <div className="flex items-start gap-4">
            <div
              className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                addToolkit ? "border-amber bg-amber" : "border-border/50"
              }`}
            >
              {addToolkit && <CheckCircle className="w-4 h-4 text-background" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-amber/70" />
                <h3 className="font-[var(--font-display)] text-xl font-semibold">
                  📊 Sleep Optimizer Toolkit
                </h3>
              </div>
              <p className="text-foreground/60 text-sm mb-1 font-medium text-foreground/80">
                Fix your sleep environment in 1 night.
              </p>
              <p className="text-foreground/50 text-xs mb-4">
                4 powerful tools to optimize every aspect of your sleep environment and habits.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                {TOOLKIT_ITEMS.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber/60 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-foreground/80 text-sm font-medium">{item.title}</p>
                      <p className="text-foreground/50 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber fill-amber" />
                ))}
                <span className="text-foreground/40 text-xs ml-1">4 digital tools included</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-foreground/40 line-through text-sm">$27</span>
              <div className="font-[var(--font-display)] text-2xl font-bold text-amber">+$10</div>
              <span className="text-xs text-amber/60">today only</span>
            </div>
          </div>

          {addToolkit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-amber/20"
            >
              <p className="text-amber/80 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Added to your order! You'll get instant access after purchase.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Order Summary + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border border-amber/20 rounded-2xl p-6 bg-card/40 backdrop-blur-sm"
        >
          {/* Bundle savings callout */}
          {addAudio && addToolkit && (
            <div className="flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-xl p-3 mb-4">
              <Zap className="w-4 h-4 text-amber shrink-0" />
              <p className="text-amber text-sm font-semibold">
                🔥 Complete Sleep Upgrade — Get BOTH for just $14 (saving $6 vs. separate)
              </p>
            </div>
          )}
          <h3 className="font-[var(--font-display)] text-lg font-semibold mb-4">Order Summary</h3>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/70">7-Night Deep Sleep Reset</span>
              <span className="text-foreground/70">$5.00</span>
            </div>
            {addAudio && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Anxiety Dissolve Audio Pack</span>
                <span className="text-foreground/70">$10.00</span>
              </div>
            )}
            {addToolkit && (
              <div className="flex justify-between text-sm">
                <span className="text-foreground/70">Sleep Optimizer Toolkit</span>
                <span className="text-foreground/70">$10.00</span>
              </div>
            )}
          </div>

          <div className="border-t border-border/30 pt-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground/90">Total Today</span>
              <span className="font-[var(--font-display)] text-3xl font-bold text-amber">
                ${totalPrice}.00
              </span>
            </div>
            {(addAudio || addToolkit) && (
              <p className="text-foreground/40 text-xs mt-1 text-right">
                You save ${(addAudio ? 17 : 0) + (addToolkit ? 17 : 0)} vs. regular price
              </p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-amber hover:bg-amber-light text-background font-bold py-4 px-6 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>Processing...</>
            ) : (
              <>
                Complete My Order — ${totalPrice}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-2 text-foreground/40 text-xs">
            <Lock className="w-3 h-3" />
            <span>Secure checkout · 30-Day Money-Back Guarantee · Instant Access</span>
          </div>
        </motion.div>

        {/* Footer links */}
        <div className="mt-8 text-center text-foreground/30 text-xs flex flex-wrap items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground/60 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground/60 transition-colors">Terms of Service</Link>
          <a href="mailto:support@deepsleepreset.com" className="hover:text-foreground/60 transition-colors">Contact</a>
        </div>
      </div>
    </div>
  );
}
