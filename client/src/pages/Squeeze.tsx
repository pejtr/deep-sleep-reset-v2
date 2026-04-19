/*
 * Squeeze Page — /squeeze
 * Solo Ads optimized: single opt-in, zero distractions, curiosity headline
 * Purpose: Capture email BEFORE sending to sales page
 * Design: Midnight Noir, minimal, high-contrast CTA
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Moon, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";

const BULLETS = [
  "The #1 reason you can't fall asleep (it's not what you think)",
  "The 4-minute technique that shuts off your racing mind",
  "Why 8 hours still leaves you exhausted — and how to fix it tonight",
];

export default function Squeeze() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();

  const captureLead = trpc.leads.capture.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      trackEvent("Lead", { content_name: "squeeze_page", value: 0 });
      setTimeout(() => {
        navigate("/order");
      }, 1800);
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    captureLead.mutate({
      email: email.trim(),
      source: "squeeze_page",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Progress bar — Step 1 of 3 */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-foreground/40 mb-2">
            <span className="font-medium text-amber/80">Step 1 of 3</span>
            <span>Claim Your Free Protocol</span>
          </div>
          <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "33%" }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-amber rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2">
            {["Free Protocol", "Full Guide", "Bonus Resources"].map((label, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${i === 0 ? "bg-amber" : "bg-foreground/15"}`} />
                <span className={`text-[10px] ${i === 0 ? "text-amber/70" : "text-foreground/25"}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Moon className="w-5 h-5 text-amber" />
          <span className="font-[var(--font-display)] text-lg font-semibold text-amber tracking-wide">
            Deep Sleep Reset
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <p className="text-amber/70 text-xs uppercase tracking-[0.3em] mb-3 font-medium">
            Free Instant Access
          </p>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold leading-tight mb-4">
            Discover the{" "}
            <span className="text-amber italic">3 Sleep Secrets</span> That
            Fixed My Insomnia in 7 Nights
          </h1>
          <p className="text-foreground/60 text-base leading-relaxed">
            Enter your email below and I'll send you the exact protocol — free.
          </p>
        </div>

        {/* Bullets */}
        <ul className="space-y-3 mb-8">
          {BULLETS.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-amber/70 shrink-0 mt-0.5" />
              <span className="text-foreground/75 text-sm leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        {/* Form */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Your first name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-card/30 border border-border/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:border-amber/50 transition-colors text-sm"
            />
            <input
              type="email"
              placeholder="Your best email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-card/30 border border-border/30 rounded-lg px-4 py-3 text-foreground placeholder-foreground/30 focus:outline-none focus:border-amber/50 transition-colors text-sm"
            />
            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}
            <button
              type="submit"
              disabled={captureLead.isPending}
              className="w-full bg-amber text-background font-bold py-4 rounded-lg text-base flex items-center justify-center gap-2 hover:bg-amber/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {captureLead.isPending ? (
                "Sending..."
              ) : (
                <>
                  Yes! Send Me the Free Protocol
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-foreground/30 text-xs flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" />
              100% private. No spam. Unsubscribe anytime.
            </p>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 border border-amber/20 rounded-xl bg-card/30"
          >
            <CheckCircle className="w-12 h-12 text-amber mx-auto mb-3" />
            <h2 className="font-[var(--font-display)] text-xl font-bold text-amber mb-2">
              You're in!
            </h2>
            <p className="text-foreground/60 text-sm">
              Taking you to the full protocol now...
            </p>
          </motion.div>
        )}

        {/* Trust bar */}
        <div className="mt-8 pt-6 border-t border-border/20 flex items-center justify-center gap-6 text-foreground/30 text-xs">
          <span>⭐ 4.9/5 from 847 reviews</span>
          <span>🔒 SSL Secured</span>
          <span>✓ No spam ever</span>
        </div>
      </motion.div>
    </div>
  );
}
