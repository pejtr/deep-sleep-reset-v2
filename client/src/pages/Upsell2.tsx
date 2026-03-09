/*
 * Upsell #2: The Sleep Optimizer Toolkit ($10)
 * Design: Midnight Noir — consistent with main sales page
 * This page appears after customer accepts or declines Upsell #1
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
  BarChart3,
  Home,
  Pill,
  Smartphone,
  CheckCircle,
  Lock,
  ArrowRight,
  Trophy,
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

const toolkitIcons = [BarChart3, Home, Pill, Smartphone];
const toolkitColors = ["text-amber", "text-lavender", "text-green-400", "text-blue-400"];

export default function Upsell2() {
  const { t, localePath } = useLanguage();
  const u = t.upsell2;
  const hasFiredPurchase = useRef(false);

  // Fire Purchase event for upsell1 ($10 Anxiety Dissolve Audio Pack)
  // This page is reached after accepting upsell1 — check URL param
  useEffect(() => {
    if (hasFiredPurchase.current) return;
    hasFiredPurchase.current = true;
    const params = new URLSearchParams(window.location.search);
    const purchased = params.get("purchased");
    if (purchased === "upsell1") {
      trackEvent("Purchase", {
        value: 10,
        currency: "USD",
        content_name: "Anxiety Dissolve Audio Pack",
        content_type: "product",
        content_ids: ["upsell1"],
      });
    }
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
            <span>{u.finalStep}</span>
          </div>
        </div>
        {/* Progress indicator — full bar on step 2 */}
        <div className="h-0.5 bg-border/20">
          <div className="h-full w-full bg-amber/60 rounded-r-full" />
        </div>
      </div>

      {/* ===== HERO / HEADLINE ===== */}
      <section className="pt-24 pb-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-amber/5 via-background to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 mb-4">
              <Trophy className="w-3.5 h-3.5 text-amber" />
              <span className="text-amber text-sm font-medium">{u.badge}</span>
            </div>

            <div className="mb-6">
              <CountdownTimer minutes={10} storageKey="upsell2-countdown" />
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
                {u.intro}
                <strong className="text-amber">{u.introHighlight}</strong>
                {u.introEnd}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ===== TOOLKIT ITEMS ===== */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/30 to-background" />
        <div className="relative max-w-3xl mx-auto px-4">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-3">
                {u.productTitle}
                <span className="text-amber text-glow">{u.productTitleHighlight}</span>
              </h2>
              <p className="text-foreground/50 max-w-lg mx-auto">{u.productDesc}</p>
            </div>
          </FadeIn>

          {/* Toolkit cards — 2x2 grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {u.items.map((item, i) => {
              const Icon = toolkitIcons[i] ?? Moon;
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="group h-full border border-border/40 rounded-xl p-6 bg-card/30 backdrop-blur-sm hover:border-amber/20 hover:bg-card/50 transition-all duration-400">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-card/60 border border-border/30 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${toolkitColors[i] ?? "text-amber"}`} />
                      </div>
                      <h3 className="font-[var(--font-display)] text-base font-semibold text-foreground/90 leading-snug">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-foreground/50 text-sm leading-relaxed">
                      {item.desc}
                    </p>
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
            <div className="flex justify-center mb-8">
              <CountdownTimer minutes={10} label={u.offerCloses} storageKey="upsell2-countdown" />
            </div>

            {/* Price card */}
            <div className="border border-amber/25 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-8">
              <p className="text-foreground/50 text-sm uppercase tracking-widest mb-3">{u.productTitle}{u.productTitleHighlight}</p>

              {/* What's included summary */}
              <div className="text-left mb-6 space-y-2">
                {u.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-foreground/60 text-sm">
                    <CheckCircle className="w-4 h-4 text-amber/60 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/20 pt-6 mb-6">
                <p className="text-foreground/50 text-sm mb-1">
                  {u.priceLabel}<span className="line-through">{u.priceOriginal}</span>
                </p>
                <span className="font-[var(--font-display)] text-5xl sm:text-6xl font-bold text-amber text-glow">$10</span>
                <p className="text-foreground/40 text-sm mt-1">One-time payment</p>
              </div>

              <button
                onClick={() => openCheckout("upsell2")}
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
              href={localePath("/thank-you")}
              className="text-foreground/25 text-sm hover:text-foreground/40 transition-colors underline underline-offset-4"
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
