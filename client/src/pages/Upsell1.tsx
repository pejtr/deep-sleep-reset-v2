/*
 * Upsell #1: The Anxiety Dissolve Audio Pack ($10)
 * Design: Midnight Noir — consistent with main sales page
 * This page appears immediately after purchase of the $5 front-end
 * Urgency-driven, one-click upsell format
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountdownTimer from "@/components/CountdownTimer";
import { openCheckout } from "@/lib/checkout";
import { Link } from "wouter";
import {
  Moon,
  AlertTriangle,
  Headphones,
  Shield,
  Sunrise,
  Clock,
  RefreshCw,
  CheckCircle,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const audioSessions = [
  {
    icon: AlertTriangle,
    title: "The \"Emergency Calm\" Audio",
    duration: "5 mins",
    desc: "For when you feel a panic attack or a wave of anxiety coming on. This is your emergency brake.",
    color: "text-red-400",
  },
  {
    icon: Moon,
    title: "The \"Sleep Onset\" Meditation",
    duration: "15 mins",
    desc: "Listen to this IN BED to effortlessly drift from anxious wakefulness into a deep, peaceful sleep.",
    color: "text-amber",
  },
  {
    icon: Sunrise,
    title: "The \"Morning Anxiety Shield\"",
    duration: "10 mins",
    desc: "Start your day grounded and calm, creating a shield against stress that lasts until evening.",
    color: "text-amber-light",
  },
  {
    icon: Clock,
    title: "The \"Afternoon Reset\"",
    duration: "10 mins",
    desc: "Prevent the daily buildup of stress and tension with this quick and powerful midday session.",
    color: "text-lavender",
  },
  {
    icon: RefreshCw,
    title: "The \"Deep Sunday Reset\"",
    duration: "20 mins",
    desc: "A full nervous system reset to prepare you for a calm and productive week ahead.",
    color: "text-blue-400",
  },
];

export default function Upsell1() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber" />
            <span className="font-[var(--font-display)] text-sm text-amber">Deep Sleep Reset</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <span className="text-amber font-medium">Step 1</span>
            <span>/</span>
            <span>2</span>
            <span className="text-foreground/20 mx-1">|</span>
            <span>Complete Your Order</span>
          </div>
        </div>
        {/* Progress indicator */}
        <div className="h-0.5 bg-border/20">
          <div className="h-full w-1/2 bg-amber/60 rounded-r-full" />
        </div>
      </div>

      {/* ===== HERO / HEADLINE ===== */}
      <section className="pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-background to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span className="text-red-400 text-sm font-medium">WAIT! Your Order Is Almost Complete...</span>
            </div>

            <div className="mb-6">
              <CountdownTimer minutes={15} storageKey="upsell1-countdown" />
            </div>

            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              You Just Took a Powerful Step to Fix Your Sleep.{" "}
              <span className="text-amber text-glow">But If Anxiety Is The Real Reason You Can't Sleep, You Absolutely Need This...</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* ===== BODY COPY ===== */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <FadeIn>
            <div className="space-y-5 text-lg leading-relaxed">
              <p className="text-foreground/80">
                First off, <strong className="text-amber">congratulations!</strong> You've just secured The 7-Night Deep Sleep Reset
                and you're already on your way to reclaiming your nights.
              </p>
              <p className="text-foreground/70">
                But let me ask you a quick, honest question...
              </p>
              <p className="text-foreground/80">
                When you're lying in bed, what's the <em>real</em> reason you can't switch off?
              </p>
              <p className="text-foreground/70">
                Is it just a busy mind... or is it that familiar, tight-chested feeling of{" "}
                <strong className="text-red-400">anxiety</strong>?
              </p>
              <p className="text-foreground/60">
                That constant, low-level hum of worry about work, finances, health, or your family?
                That sudden jolt of panic just as you're about to drift off?
              </p>

              <div className="border-l-2 border-amber/30 pl-6 py-2 my-8">
                <p className="text-foreground/80 font-medium">
                  For 9 out of 10 people with sleep problems, anxiety is the root cause.
                  The sleep issue is just a symptom.
                </p>
              </div>

              <p className="text-foreground/60">
                And while the 7-Night Reset is incredible for rebuilding your sleep habits,
                you can <strong className="text-foreground/80">supercharge your results</strong> by directly targeting the anxiety
                that's fueling the fire.
              </p>
              <p className="text-foreground/70">
                That's why I want to offer you a <strong className="text-amber">one-time-only opportunity</strong> to add...
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== PRODUCT REVEAL ===== */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/40 to-background" />
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <Headphones className="w-6 h-6 text-amber" />
              </div>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
                The Anxiety Dissolve{" "}
                <span className="text-amber text-glow">Audio Pack</span>
              </h2>
              <p className="text-foreground/60 text-lg max-w-xl mx-auto">
                A curated collection of 5 powerful, guided audio sessions designed to melt away
                stress and anxiety on demand.
              </p>
              <p className="text-foreground/50 mt-4">
                These aren't just "relaxing sounds." Each audio uses specific guided meditation and
                NLP techniques to calm your nervous system and quiet your mind in minutes.
              </p>
            </div>
          </FadeIn>

          {/* Audio sessions */}
          <div className="space-y-4">
            {audioSessions.map((session, i) => {
              const Icon = session.icon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group border border-border/40 rounded-xl p-5 sm:p-6 bg-card/30 backdrop-blur-sm hover:border-amber/20 hover:bg-card/50 transition-all duration-400">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="shrink-0 w-11 h-11 rounded-lg bg-card/60 border border-border/30 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${session.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-[var(--font-display)] text-lg font-semibold text-foreground/90">
                            {session.title}
                          </h3>
                          <span className="text-xs text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded-full">
                            {session.duration}
                          </span>
                        </div>
                        <p className="text-foreground/55 leading-relaxed text-sm sm:text-base">
                          {session.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PRICING & CTA ===== */}
      <section className="py-20 relative">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <FadeIn>
            <p className="text-foreground/50 mb-2">
              Normally, we sell this audio pack for <span className="line-through">$37</span>.
            </p>
            <p className="text-foreground/70 text-lg mb-8">
              But because you've just invested in the Deep Sleep Reset, here's a special, one-time deal:
            </p>

            {/* Price card */}
            <div className="border border-amber/25 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-8">
              <div className="flex justify-center mb-4">
                <CountdownTimer minutes={15} label="Offer closes in:" storageKey="upsell1-countdown" />
              </div>
              <p className="text-foreground/50 text-sm uppercase tracking-widest mb-3">Add to your order</p>
              <div className="mb-6">
                <span className="text-foreground/30 line-through text-xl mr-3">$37</span>
                <span className="font-[var(--font-display)] text-5xl sm:text-6xl font-bold text-amber text-glow">$10</span>
              </div>

              <button
                onClick={() => openCheckout("upsell1")}
                className="cta-pulse w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-5 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
              >
                YES! ADD THE AUDIO PACK FOR JUST $10
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="mt-4 text-foreground/35 text-sm flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                One-click upsell. You will not be asked for your payment details again.
              </p>
            </div>

            {/* Decline link */}
            <a
              href="/upsell-2"
              className="text-foreground/25 text-sm hover:text-foreground/40 transition-colors underline underline-offset-4"
            >
              No thanks, I don't want to target the root cause of my sleep issues. Take me to my purchase.
            </a>
          </FadeIn>
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
