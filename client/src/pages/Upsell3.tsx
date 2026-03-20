/*
 * Upsell #3: Advanced Sleep Mastery Protocol ($19)
 * Design: Midnight Noir — consistent with main sales page
 * This page appears after customer accepts or declines Upsell #2
 * ChatGPT recommendation: "Want this to work 3x faster? → Advanced Protocol $19"
 * One-time offer format with 15-min countdown
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountdownTimer from "@/components/CountdownTimer";
import { openCheckout } from "@/lib/checkout";
import { Link } from "wouter";
import {
  Moon,
  Brain,
  Zap,
  Lock,
  ArrowRight,
  CheckCircle,
  Users,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Star,
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

const WHAT_YOU_GET = [
  {
    icon: Brain,
    title: "30-Day CBT-I Deep Dive",
    desc: "The full Cognitive Behavioral Therapy for Insomnia protocol — the same treatment used by sleep clinics, now in a self-guided 30-day format.",
    color: "text-amber",
  },
  {
    icon: TrendingUp,
    title: "Sleep Architecture Optimizer",
    desc: "Understand and optimize your deep sleep, REM, and light sleep cycles. Includes a 4-week tracking system with weekly analysis prompts.",
    color: "text-lavender",
  },
  {
    icon: BookOpen,
    title: "Advanced Sleep Science Library",
    desc: "12 in-depth modules covering circadian biology, sleep pressure, cortisol management, and the neuroscience of sleep — no fluff, all science.",
    color: "text-blue-400",
  },
  {
    icon: Users,
    title: "Lifetime Community Access",
    desc: "Join 3,200+ members in the private Sleep Mastery Community. Share progress, ask questions, and get accountability from people who've been where you are.",
    color: "text-green-400",
  },
  {
    icon: MessageCircle,
    title: "Weekly Live Q&A Sessions",
    desc: "Monthly group coaching calls where you can ask questions and get personalized guidance on your sleep challenges.",
    color: "text-amber",
  },
];

const TESTIMONIALS = [
  { name: "Sarah M.", result: "Went from 4h broken sleep to 7.5h solid in 3 weeks", stars: 5 },
  { name: "James K.", result: "The CBT-I module alone was worth 10x the price", stars: 5 },
  { name: "Priya L.", result: "Finally understand WHY I couldn't sleep. Game changer.", stars: 5 },
];

export default function Upsell3() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber" />
            <span className="font-[var(--font-display)] text-sm text-amber">Deep Sleep Reset</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <span className="text-amber font-medium">Step 3</span>
            <span>/</span>
            <span>Step 3 of 3</span>
            <span className="text-foreground/20 mx-1">|</span>
            <span>Final Upgrade</span>
          </div>
        </div>
        {/* Progress indicator — 75% complete */}
        <div className="h-0.5 bg-border/20">
          <div className="h-full w-3/4 bg-amber/60 rounded-r-full" />
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 via-background to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 mb-4">
              <Zap className="w-3.5 h-3.5 text-amber" />
              <span className="text-amber text-sm font-medium">One-Time Offer — Never Shown Again</span>
            </div>

            <div className="mb-6">
              <CountdownTimer minutes={15} storageKey="upsell3-countdown" />
            </div>

            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              Want This to Work{" "}
              <span className="text-amber text-glow">3× Faster?</span>
            </h1>

            <p className="text-foreground/70 text-xl leading-relaxed max-w-2xl mx-auto mb-4">
              The 7-Night Reset gives you the foundation. The{" "}
              <strong className="text-foreground/90">Advanced Sleep Mastery Protocol</strong>{" "}
              gives you the complete system — so you never struggle with sleep again.
            </p>

            <p className="text-foreground/50 text-base max-w-xl mx-auto">
              This is the same protocol used in $300/session sleep clinics. Today only: <strong className="text-amber">$19</strong>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== WHAT YOU GET ===== */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/30 to-background" />
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold text-center mb-10">
              Everything in the{" "}
              <span className="text-amber">Advanced Protocol</span>
            </h2>
          </FadeIn>

          <div className="space-y-4">
            {WHAT_YOU_GET.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="border border-border/40 rounded-xl p-5 sm:p-6 bg-card/20 backdrop-blur-sm hover:border-amber/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-lg bg-card/40 border border-border/20 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="font-[var(--font-display)] text-lg font-semibold mb-1">{item.title}</h3>
                        <p className="text-foreground/55 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF ===== */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="grid sm:grid-cols-3 gap-4">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="border border-border/30 rounded-xl p-5 bg-card/20">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-amber fill-amber" />
                    ))}
                  </div>
                  <p className="text-foreground/70 text-sm italic mb-3">"{t.result}"</p>
                  <p className="text-foreground/40 text-xs font-medium">{t.name}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== VALUE STACK ===== */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <FadeIn>
            <div className="border border-amber/20 rounded-2xl p-6 sm:p-8 bg-card/30 backdrop-blur-sm">
              <h3 className="font-[var(--font-display)] text-xl font-bold text-center mb-6">What You're Getting</h3>
              <div className="space-y-3 mb-6">
                {[
                  { item: "30-Day CBT-I Deep Dive", value: "$97" },
                  { item: "Sleep Architecture Optimizer", value: "$47" },
                  { item: "Advanced Sleep Science Library", value: "$67" },
                  { item: "Lifetime Community Access", value: "$97/yr" },
                  { item: "Monthly Live Q&A Sessions", value: "$49/mo" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-amber/60 shrink-0" />
                      <span className="text-foreground/70">{row.item}</span>
                    </div>
                    <span className="text-foreground/40 line-through">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/30 pt-4 flex justify-between items-center">
                <span className="text-foreground/50 text-sm">Total value</span>
                <span className="text-foreground/40 line-through text-lg">$357+</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-semibold text-foreground/90">Your price today</span>
                <span className="font-[var(--font-display)] text-4xl font-bold text-amber text-glow">$19</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== PRICING & CTA ===== */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <FadeIn>
            <div className="border border-amber/25 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-8">
              <div className="flex justify-center mb-6">
                <CountdownTimer minutes={15} label="Offer closes in" storageKey="upsell3-countdown" />
              </div>

              <p className="text-foreground/50 text-sm uppercase tracking-widest mb-3">One-Time Add-On</p>
              <div className="mb-6">
                <span className="text-foreground/30 line-through text-xl mr-3">$357</span>
                <span className="font-[var(--font-display)] text-5xl sm:text-6xl font-bold text-amber text-glow">$19</span>
              </div>

              <button
                onClick={() => openCheckout("upsell3")}
                className="cta-pulse w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-5 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02] mb-4"
              >
                Yes — I Want to Master My Sleep
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="text-foreground/35 text-sm flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                Secure checkout · 30-Day Money-Back Guarantee · Instant Access
              </p>
            </div>

            {/* Decline link */}
            <Link
              href="/thank-you?value=25&product=Complete+Bundle"
              className="text-foreground/25 text-sm hover:text-foreground/40 transition-colors underline underline-offset-4"
            >
              No thanks, I'll stick with what I have
            </Link>
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
