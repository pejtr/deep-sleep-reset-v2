/*
 * Squeeze Page — /squeeze
 * Solo Ads optimized: single opt-in, zero distractions, curiosity headline
 * Purpose: Capture email BEFORE sending to sales page
 * Design: Midnight Noir, minimal, high-contrast CTA
 *
 * A/B TEST — Headline:
 *   squeeze_a → "3 Sleep Secrets" (curiosity / benefit frame)
 *   squeeze_b → "The Chronotype Method" (science / authority frame)
 *
 * Assignment: 50/50 split, 24h TTL via localStorage
 * Tracking: trpc.ab.trackEvent — impression on mount, conversion on form submit
 */

import React, { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Moon, Lock, ArrowRight, CheckCircle, FlaskConical } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { getSessionId } from "@/lib/ab-hooks";

// ─── A/B Variant Config ──────────────────────────────────────────────────────

type SqueezeVariant = "squeeze_a" | "squeeze_b";

const SQUEEZE_AB_KEY = "dsr-squeeze-headline";
const SQUEEZE_AB_TS_KEY = "dsr-squeeze-assigned-at";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSqueezeVariant(): SqueezeVariant {
  const stored = localStorage.getItem(SQUEEZE_AB_KEY) as SqueezeVariant | null;
  const assignedAt = parseInt(localStorage.getItem(SQUEEZE_AB_TS_KEY) ?? "0", 10);
  const isValid = stored && Date.now() - assignedAt < TTL_MS;
  if (isValid && (stored === "squeeze_a" || stored === "squeeze_b")) return stored;

  const variant: SqueezeVariant = Math.random() < 0.5 ? "squeeze_a" : "squeeze_b";
  localStorage.setItem(SQUEEZE_AB_KEY, variant);
  localStorage.setItem(SQUEEZE_AB_TS_KEY, Date.now().toString());
  return variant;
}

const VARIANTS: Record<SqueezeVariant, {
  badge: string;
  headline: React.ReactNode;
  subheadline: string;
  bullets: string[];
  cta: string;
}> = {
  squeeze_a: {
    badge: "Free Instant Access",
    headline: (
      <>
        Discover the{" "}
        <span className="text-amber italic">3 Sleep Secrets</span> That
        Fixed My Insomnia in 7 Nights
      </>
    ),
    subheadline: "Enter your email below and I'll send you the exact protocol — free.",
    bullets: [
      "The #1 reason you can't fall asleep (it's not what you think)",
      "The 4-minute technique that shuts off your racing mind",
      "Why 8 hours still leaves you exhausted — and how to fix it tonight",
    ],
    cta: "Yes! Send Me the Free Protocol",
  },
  squeeze_b: {
    badge: "Science-Backed Sleep Protocol",
    headline: (
      <>
        <span className="text-amber italic">The Chronotype Method:</span>{" "}
        Sleep Deeper by Working With Your Biology, Not Against It
      </>
    ),
    subheadline: "Discover your sleep type and get a personalized protocol — free in 60 seconds.",
    bullets: [
      "Why generic sleep advice fails 3 out of 4 people (and what to do instead)",
      "The chronotype mismatch that's keeping you awake — and how to fix it",
      "A 7-night protocol built around your biology, not a one-size-fits-all schedule",
    ],
    cta: "Reveal My Chronotype & Get the Protocol",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Squeeze() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [, navigate] = useLocation();
  const [variant] = useState<SqueezeVariant>(() => getSqueezeVariant());
  const [sessionId] = useState(() => getSessionId());

  const v = VARIANTS[variant];

  const trackAbEvent = trpc.ab.trackEvent.useMutation();

  // Track impression on mount
  useEffect(() => {
    trackAbEvent.mutate({
      variant,
      eventType: "impression",
      sessionId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captureLead = trpc.leads.capture.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      // Track conversion (opt-in)
      trackAbEvent.mutate({
        variant,
        eventType: "conversion",
        sessionId,
        email: email.trim(),
      });
      trackEvent("Lead", { content_name: `squeeze_${variant}`, value: 0 });
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
      abVariant: variant,
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

        {/* Headline — A/B tested */}
        <div className="text-center mb-8">
          <p className="text-amber/70 text-xs uppercase tracking-[0.3em] mb-3 font-medium">
            {v.badge}
          </p>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold leading-tight mb-4">
            {v.headline}
          </h1>
          <p className="text-foreground/60 text-base leading-relaxed">
            {v.subheadline}
          </p>
        </div>

        {/* Bullets */}
        <ul className="space-y-3 mb-8">
          {v.bullets.map((b, i) => (
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
                  {v.cta}
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

        {/* A/B test indicator — dev only */}
        {import.meta.env.DEV && (
          <div className="mt-4 flex items-center justify-center gap-2 text-foreground/20 text-[10px]">
            <FlaskConical className="w-3 h-3" />
            <span>A/B: {variant === "squeeze_a" ? "Variant A — 3 Sleep Secrets" : "Variant B — Chronotype Method"}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}
