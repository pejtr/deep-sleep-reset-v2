/*
 * Upsell #1: The Anxiety Dissolve Audio Pack ($10)
 * Design: Midnight Noir — consistent with main sales page
 * This page appears immediately after purchase of the $5 front-end
 * Urgency-driven, one-click upsell format
 * i18n: All strings from useLanguage()
 */

import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountdownTimer from "@/components/CountdownTimer";
import { openCheckout } from "@/lib/checkout";
import { Link } from "wouter";
import { trackEvent } from "@/components/MetaPixel";
import {
  Moon,
  AlertTriangle,
  Headphones,
  Sunrise,
  Clock,
  RefreshCw,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

const sessionIcons = [AlertTriangle, Moon, Sunrise, Clock, RefreshCw];
const sessionColors = ["text-red-400", "text-amber", "text-amber-light", "text-lavender", "text-blue-400"];

export default function Upsell1() {
  const { t, localePath } = useLanguage();
  const u = t.upsell1;
  const hasFiredPurchase = useRef(false);

  // Fire Purchase event for the $5 front-end product
  // This page is reached only after a successful payment
  useEffect(() => {
    if (hasFiredPurchase.current) return;
    hasFiredPurchase.current = true;
    const params = new URLSearchParams(window.location.search);
    const value = parseFloat(params.get("value") || "5");
    const currency = params.get("currency") || "USD";
    trackEvent("Purchase", {
      value,
      currency,
      content_name: "7-Night Deep Sleep Reset",
      content_type: "product",
      content_ids: ["frontEnd"],
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Progress bar at top */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-amber" />
            <span className="font-[var(--font-display)] text-sm text-amber">{t.common.brandName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/40">
            <span className="text-amber font-medium">{u.step}</span>
            <span>/</span>
            <span>{u.stepOf}</span>
            <span className="text-foreground/20 mx-1">|</span>
            <span>{u.completeOrder}</span>
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
              <span className="text-red-400 text-sm font-medium">{u.badge}</span>
            </div>

            <div className="mb-6">
              <CountdownTimer minutes={15} storageKey="upsell1-countdown" />
            </div>

            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
              {u.headline}
              <span className="text-amber text-glow">{u.headlineHighlight}</span>
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
                <strong className="text-amber">{u.congrats}</strong>{u.congratsText}
              </p>
              <p className="text-foreground/70">{u.question}</p>
              <p className="text-foreground/80">{u.realReason}</p>
              <p className="text-foreground/70">
                {u.anxiety}
                <strong className="text-red-400">{u.anxietyHighlight}</strong>
                {u.anxietyQuestion}
              </p>
              <p className="text-foreground/60">{u.anxietyDesc}</p>

              <div className="border-l-2 border-amber/30 pl-6 py-2 my-8">
                <p className="text-foreground/80 font-medium">{u.statistic}</p>
              </div>

              <p className="text-foreground/60">
                {u.supercharge}
                <strong className="text-foreground/80">{u.superchargeHighlight}</strong>
                {u.superchargeEnd}
              </p>
              <p className="text-foreground/70">
                {u.oneTimeOffer}
                <strong className="text-amber">{u.oneTimeOfferHighlight}</strong>
                {u.oneTimeOfferEnd}
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
                {u.productTitle}
                <span className="text-amber text-glow">{u.productTitleHighlight}</span>
              </h2>
              <p className="text-foreground/60 text-lg max-w-xl mx-auto">{u.productDesc}</p>
              <p className="text-foreground/50 mt-4">{u.productNote}</p>
            </div>
          </FadeIn>

          {/* Audio sessions */}
          <div className="space-y-4">
            {u.audioSessions.map((session, i) => {
              const Icon = sessionIcons[i] ?? Moon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group border border-border/40 rounded-xl p-5 sm:p-6 bg-card/20 backdrop-blur-sm opacity-70">
                    <div className="flex items-start gap-4 sm:gap-5">
                      <div className="shrink-0 w-11 h-11 rounded-lg bg-card/40 border border-border/20 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${sessionColors[i] ?? "text-amber"} opacity-50`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-[var(--font-display)] text-lg font-semibold text-foreground/60">
                            {session.title}
                          </h3>
                          <span className="text-xs text-foreground/30 bg-foreground/5 px-2 py-0.5 rounded-full">
                            {session.duration}
                          </span>
                          <span className="text-xs text-amber/70 bg-amber/10 border border-amber/20 px-2 py-0.5 rounded-full font-medium">
                            Coming Soon
                          </span>
                        </div>
                        <p className="text-foreground/35 leading-relaxed text-sm sm:text-base">
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
              {u.priceLabel}<span className="line-through">{u.priceOriginal}</span>.
            </p>
            <p className="text-foreground/70 text-lg mb-8">{u.priceDesc}</p>

            {/* Price card */}
            <div className="border border-amber/25 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-8">
              <div className="flex justify-center mb-4">
                <CountdownTimer minutes={15} label={u.offerCloses} storageKey="upsell1-countdown" />
              </div>
              <p className="text-foreground/50 text-sm uppercase tracking-widest mb-3">{u.addToOrder}</p>
              <div className="mb-6">
                <span className="text-foreground/30 line-through text-xl mr-3">{u.priceOriginal}</span>
                <span className="font-[var(--font-display)] text-5xl sm:text-6xl font-bold text-amber text-glow">$10</span>
              </div>

              <button
                onClick={() => openCheckout("upsell1")}
                className="cta-pulse w-full inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-8 py-5 rounded-xl text-lg transition-all duration-300 hover:scale-[1.02]"
              >
                {u.ctaButton}
                <ArrowRight className="w-5 h-5" />
              </button>

              <p className="mt-4 text-foreground/35 text-sm flex items-center justify-center gap-2">
                <Lock className="w-3.5 h-3.5" />
                {u.oneClick}
              </p>
            </div>

            {/* Decline link */}
            <Link
              href={localePath("/upsell-2")}
              className="text-foreground/25 text-sm hover:text-foreground/40 transition-colors underline underline-offset-4"
              onClick={() => {
                // Mark audio as skipped so thank-you page can show post-purchase upsell
                sessionStorage.setItem("skipped_audio_upsell", "1");
              }}
            >
              {u.decline}
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
