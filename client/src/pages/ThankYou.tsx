/*
 * Thank You Page — shown after successful purchase
 * Design: Midnight Noir — consistent with all pages
 * Fires Meta Pixel "Purchase" event on load
 * Displays access instructions and next steps
 */

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Moon,
  CheckCircle,
  Mail,
  Download,
  ArrowRight,
  Sparkles,
  Heart,
  Star,
} from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";

export default function ThankYou() {
  const hasFired = useRef(false);

  // Fire Purchase event once on page load
  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    // Parse purchase value from URL params if available
    const params = new URLSearchParams(window.location.search);
    const value = parseFloat(params.get("value") || "5");
    const currency = params.get("currency") || "USD";
    const product = params.get("product") || "Deep Sleep Reset";

    trackEvent("Purchase", {
      value,
      currency,
      content_name: product,
      content_type: "product",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-wide text-amber">
              Deep Sleep Reset
            </span>
          </div>
        </div>
      </header>

      {/* ===== SUCCESS HERO ===== */}
      <section className="pt-16 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-background to-background" />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Success checkmark */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              Welcome to Your{" "}
              <span className="text-amber text-glow">New Sleep Life</span>
            </h1>
            <p className="text-foreground/60 text-lg max-w-lg mx-auto">
              Your purchase is confirmed. You're about to experience the best sleep of your life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== WHAT HAPPENS NEXT ===== */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <h2 className="font-[var(--font-display)] text-2xl font-bold mb-8 text-center">
              What Happens Next?
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  step: "1",
                  title: "Check Your Email",
                  desc: "We've sent your login details and access link to the email you used at checkout. Check your inbox (and spam folder, just in case).",
                },
                {
                  icon: Download,
                  step: "2",
                  title: "Access Your Program",
                  desc: "Click the link in your email to access the full 7-Night Deep Sleep Reset program. You can start Night 1 tonight.",
                },
                {
                  icon: Moon,
                  step: "3",
                  title: "Start Tonight",
                  desc: "Follow the Night 1 protocol before bed tonight. Each night builds on the last, creating a powerful compounding effect.",
                },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-5 p-6 rounded-xl border border-border/30 bg-card/20 hover:bg-card/40 transition-all duration-300"
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-amber" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-amber/50 text-xs font-medium uppercase tracking-wider">
                          Step {item.step}
                        </span>
                      </div>
                      <h3 className="font-[var(--font-display)] text-lg font-semibold text-foreground/90 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-foreground/55 leading-relaxed text-sm">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PRO TIPS ===== */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="border border-amber/15 rounded-2xl p-8 bg-card/20">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-amber" />
                <h3 className="font-[var(--font-display)] text-xl font-semibold">
                  Pro Tips for Maximum Results
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Complete each night's protocol in order — they build on each other.",
                  "Do the exercises at least 30 minutes before your intended bedtime.",
                  "Keep a glass of water by your bed and your phone in another room.",
                  "Be patient with yourself — lasting change takes 7 nights, not 1.",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Star className="w-4 h-4 text-amber/50 mt-0.5 shrink-0" />
                    <p className="text-foreground/60 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CLOSING MESSAGE ===== */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <Heart className="w-8 h-8 text-amber/40 mx-auto mb-4" />
            <p className="text-foreground/70 text-lg leading-relaxed mb-6">
              Thank you for trusting us with something as important as your sleep.
              We're genuinely excited for you to experience the transformation.
            </p>
            <p className="font-[var(--font-display)] text-xl font-semibold text-amber mb-8">
              Tonight, you sleep.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-amber/10 hover:bg-amber/20 text-amber border border-amber/30 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
            >
              Access Your Program Now
              <ArrowRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber/50" />
              <span className="text-foreground/40 text-sm">Deep Sleep Reset</span>
            </div>
            <div className="flex items-center gap-6 text-foreground/30 text-sm">
              <Link href="/privacy" className="hover:text-foreground/60 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground/60 transition-colors">Terms of Service</Link>
              <a href="mailto:support@deepsleepreset.com" className="hover:text-foreground/60 transition-colors">Contact</a>
            </div>
            <p className="text-foreground/30 text-xs">
              &copy; {new Date().getFullYear()} Deep Sleep Reset. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
