/*
 * Thank You Page — shown after successful purchase
 * Design: Midnight Noir — consistent with all pages
 * Fires Meta Pixel "Purchase" event on load
 * Displays access instructions and next steps
 * i18n: All strings from useLanguage()
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
import { useLanguage } from "@/contexts/LanguageContext";

const stepIcons = [Mail, Download, Moon];

export default function ThankYou() {
  const { t, localePath } = useLanguage();
  const ty = t.thankYou;
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
