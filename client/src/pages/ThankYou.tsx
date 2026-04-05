/*
 * Thank You Page — shown after successful purchase
 * Design: Midnight Noir — consistent with all pages
 * Fires Meta Pixel "Purchase" event on load
 * Displays access instructions and next steps
 * i18n: All strings from useLanguage()
 */

import { useEffect, useRef, useState } from "react";
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
  Headphones,
  Zap,
  Lock,
} from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { useLanguage } from "@/contexts/LanguageContext";
import { openCheckout } from "@/lib/checkout";
import { FunnelProgressBar } from "@/components/FunnelProgressBar";

const stepIcons = [Mail, Download, Moon];

const COUNTDOWN_SECONDS = 15 * 60; // 15 minutes

export default function ThankYou() {
  const { t, localePath } = useLanguage();
  const ty = t.thankYou;
  const hasFired = useRef(false);
  const [showAudioUpsell, setShowAudioUpsell] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown when audio upsell becomes visible
  useEffect(() => {
    if (!showAudioUpsell) return;
    setSecondsLeft(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setShowAudioUpsell(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [showAudioUpsell]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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

    // Show audio upsell if user skipped it on the order page
    const skippedAudio = sessionStorage.getItem("skipped_audio_upsell") === "1";
    if (skippedAudio) {
      setShowAudioUpsell(true);
      // Clean up so it doesn't show again on refresh
      sessionStorage.removeItem("skipped_audio_upsell");
    }
  }, []);

  const handleAudioUpsell = async () => {
    setAudioLoading(true);
    await openCheckout("upsell1");
    setAudioLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <FunnelProgressBar step="thankyou" />
      {/* Header */}
      <header className="border-b border-border/20 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-wide text-amber">
              {t.common.brandName}
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

            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-green-400 text-sm font-medium uppercase tracking-wider">{ty.badge}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
              {ty.title}
              <span className="text-amber text-glow">{ty.titleHighlight}</span>
            </h1>
            <p className="text-foreground/60 text-lg max-w-lg mx-auto">
              {ty.desc}
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
            <div className="space-y-4">
              {ty.steps.map((item, i) => {
                const Icon = stepIcons[i] ?? Moon;
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
                          {i + 1}
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

      {/* ===== POST-PURCHASE AUDIO UPSELL ===== */}
      {showAudioUpsell && (
        <section className="py-8">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6 }}
            >
              <div className="relative border-2 border-amber/40 rounded-2xl p-6 sm:p-8 bg-amber/5 overflow-hidden">
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Badge + Countdown */}
                <div className="flex items-center justify-between gap-2 mb-5 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-amber text-background px-3 py-1 rounded-full font-bold uppercase tracking-wide">
                      ⚡ One-Time Offer
                    </span>
                    <span className="text-xs text-foreground/40">Only available right now</span>
                  </div>
                  {/* Countdown timer */}
                  <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-400 text-xs font-mono font-bold tabular-nums">
                      {formatCountdown(secondsLeft)}
                    </span>
                    <span className="text-red-400/60 text-xs">left</span>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-amber/15 border border-amber/25 flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6 text-amber" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-[var(--font-display)] text-xl sm:text-2xl font-bold mb-1">
                      🧠 Wait — You Forgot Something
                    </h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      The <strong className="text-foreground/80">Anxiety Shutdown Audio Pack</strong> works best alongside your 7-Night Reset.
                      5 guided sessions that silence racing thoughts in under 10 minutes — on demand.
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <span className="text-foreground/35 line-through text-sm">$29</span>
                    <div className="font-[var(--font-display)] text-3xl font-bold text-amber">$10</div>
                    <span className="text-xs text-amber/60">today only</span>
                  </div>
                </div>

                {/* Sessions list */}
                <div className="space-y-2 mb-5 pl-16">
                  {[
                    { title: "The Emergency Calm Audio", duration: "5 min", desc: "Instant relief when anxiety spikes" },
                    { title: "The Sleep Onset Meditation", duration: "15 min", desc: "Guides you from wakefulness into deep sleep" },
                    { title: "The Morning Anxiety Shield", duration: "10 min", desc: "Start every day with a layer of calm" },
                    { title: "The Afternoon Reset", duration: "10 min", desc: "Prevent stress buildup before it ruins your night" },
                    { title: "The Deep Sunday Reset", duration: "20 min", desc: "Full nervous system reset for the week ahead" },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-3.5 h-3.5 text-amber/60 shrink-0" />
                      <span className="text-foreground/70 font-medium">{s.title}</span>
                      <span className="text-foreground/35 text-xs">({s.duration})</span>
                    </div>
                  ))}
                </div>

                {/* Mobile price */}
                <div className="sm:hidden flex items-center gap-3 mb-5 pl-16">
                  <span className="text-foreground/35 line-through text-sm">$29</span>
                  <span className="font-[var(--font-display)] text-2xl font-bold text-amber">$10</span>
                  <span className="text-xs text-amber/60">today only</span>
                </div>

                {/* CTA */}
                <button
                  onClick={handleAudioUpsell}
                  disabled={audioLoading}
                  className="w-full bg-amber hover:bg-amber/90 text-background font-bold py-4 px-6 rounded-xl text-base transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {audioLoading ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Yes, Add the Audio Pack — $10
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-foreground/35 text-xs">
                  <Lock className="w-3 h-3" />
                  <span>Secure checkout · 30-Day Money-Back Guarantee</span>
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => setShowAudioUpsell(false)}
                  className="mt-4 w-full text-center text-foreground/25 text-xs hover:text-foreground/40 transition-colors"
                >
                  No thanks, I don't need help with anxiety
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ===== REMINDER BOX ===== */}
      <section className="py-12">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="border border-amber/15 rounded-2xl p-8 bg-card/20">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-amber" />
                <h3 className="font-[var(--font-display)] text-xl font-semibold">
                  {ty.reminderTitle}
                </h3>
              </div>
              <p className="text-foreground/60 leading-relaxed">{ty.reminderText}</p>

              <div className="mt-6 pt-6 border-t border-border/20">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-4 h-4 text-amber/50" />
                  <h4 className="font-semibold text-foreground/80 text-sm">{ty.supportTitle}</h4>
                </div>
                <p className="text-foreground/50 text-sm">
                  {ty.supportText}
                  <a href="mailto:support@deepsleepreset.com" className="text-amber/70 hover:text-amber transition-colors">
                    support@deepsleepreset.com
                  </a>
                </p>
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
            <p className="font-[var(--font-display)] text-xl font-semibold text-amber mb-8">
              Tonight, you sleep.
            </p>
            <Link
              href={localePath("/")}
              className="inline-flex items-center gap-2 bg-amber/10 hover:bg-amber/20 text-amber border border-amber/30 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300"
            >
              {ty.backHome}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-10 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber/50" />
              <span className="text-foreground/40 text-sm">{t.common.brandName}</span>
            </div>
            <div className="flex items-center gap-6 text-foreground/30 text-sm">
              <Link href={localePath("/privacy")} className="hover:text-foreground/60 transition-colors">{t.common.privacyPolicy}</Link>
              <Link href={localePath("/terms")} className="hover:text-foreground/60 transition-colors">{t.common.termsOfService}</Link>
              <a href="mailto:support@deepsleepreset.com" className="hover:text-foreground/60 transition-colors">{t.common.contact}</a>
            </div>
            <p className="text-foreground/30 text-xs">
              &copy; {new Date().getFullYear()} {t.common.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
