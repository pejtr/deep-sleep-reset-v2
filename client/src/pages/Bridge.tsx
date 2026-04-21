/*
 * Bridge Page — /bridge
 * Shown after Stripe checkout success, BEFORE upsell chain
 * Purpose: Confirm purchase, build excitement, prime for upsell
 * Solo Ads best practice: Never send cold traffic directly to upsell — warm them up first
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Moon, CheckCircle, ArrowRight, Package, Clock, Zap } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";

const STEPS = [
  {
    icon: Package,
    title: "Your order is confirmed",
    desc: "The 7-Night Deep Sleep Reset protocol is being prepared for you.",
    delay: 0,
  },
  {
    icon: Clock,
    title: "Instant access in your inbox",
    desc: "Check your email — your download link will arrive within 2 minutes.",
    delay: 0.15,
  },
  {
    icon: Zap,
    title: "One special offer — just for buyers",
    desc: "Because you just invested in your sleep, I have one exclusive add-on available only right now.",
    delay: 0.3,
  },
];

export default function Bridge() {
  const [, navigate] = useLocation();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    trackEvent("Purchase", { content_name: "bridge_page" });
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/upsell-1");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-amber/6 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg relative z-10 text-center"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Moon className="w-5 h-5 text-amber" />
          <span className="font-[var(--font-display)] text-lg font-semibold text-amber tracking-wide">
            Deep Sleep Reset
          </span>
        </div>

        {/* Success badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-amber" />
        </motion.div>

        <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-3">
          Payment Confirmed!
        </h1>
        <p className="text-foreground/60 text-base mb-10 leading-relaxed">
          Welcome to the Deep Sleep Reset family. Here's what happens next:
        </p>

        {/* Steps */}
        <div className="space-y-4 mb-10 text-left">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + step.delay }}
              className="flex items-start gap-4 p-4 rounded-xl border border-border/20 bg-card/20"
            >
              <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0">
                <step.icon className="w-5 h-5 text-amber" />
              </div>
              <div>
                <p className="font-semibold text-foreground/90 text-sm mb-0.5">{step.title}</p>
                <p className="text-foreground/50 text-xs leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA with countdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <button
            onClick={() => navigate("/upsell-1")}
            className="w-full bg-amber text-background font-bold py-4 rounded-lg text-base flex items-center justify-center gap-2 hover:bg-amber/90 transition-all duration-300 hover:scale-[1.02]"
          >
            See My Special Offer
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-foreground/30 text-xs mt-3">
            Redirecting automatically in {countdown}s...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
