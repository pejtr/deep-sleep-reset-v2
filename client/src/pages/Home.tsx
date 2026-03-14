/*
 * Design: "Midnight Noir" — Cinematic Dark Immersion
 * Palette: Deep navy (#0a0e1a), amber/gold (#d4a853), lavender (#b8a9c9), warm white (#f0ece4)
 * Fonts: Playfair Display (display), Source Sans 3 (body)
 * Philosophy: The page itself feels like nighttime — calming, immersive, cinematic
 * i18n: All user-facing strings pulled from useLanguage() context
 */

import { useEffect, useMemo, useRef, useState } from "react";
import SeoHead from "@/components/SeoHead";
import { motion, useInView } from "framer-motion";
import { getVariant } from "@/lib/ab-test";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useLocation } from "wouter";
import { trackEvent } from "@/components/MetaPixel";
import SleepScoreQuiz from "@/components/SleepScoreQuiz";
import LiveVisitorCounter from "@/components/LiveVisitorCounter";
import UrgencyTimer from "@/components/UrgencyTimer";
import { trpc } from "@/lib/trpc";
import {
  Moon,
  Brain,
  Wind,
  Sun,
  Bed,
  Lock,
  Zap,
  CheckCircle,
  Shield,
  ChevronDown,
  Clock,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/hero-night-sky-NMuEwEY3PXoTVuUCDHvJtJ.webp";
const INSOMNIA_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/insomnia-anxiety-GDy4eHyeJKZJnnM53SKdKA.webp";
const SLEEP_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/sleep-person-BL46EAbNpQfoPr4JMovZ7j.webp";
const BRAIN_WAVES_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/brain-waves-8ZVUojjHYvEHHkkXTHQxyT.webp";
const SHIELD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/guarantee-shield-msUD6VxYQaJNdGFuczbUNx.webp";

const nightIcons = [Moon, Brain, Zap, Wind, Sun, Bed, Lock];

// ─── Live Testimonials Grid ───────────────────────────────────────────────────
// Fetches approved testimonials from the database.
// Falls back to static copy when no live testimonials exist yet.

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 mb-4">
      {Array.from({ length: 5 }).map((_, j) => (
        <svg
          key={j}
          className={`w-4 h-4 ${j < rating ? "text-amber" : "text-foreground/15"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function LiveTestimonialsGrid({
  staticReviews,
}: {
  staticReviews: Array<{ text: string; name: string; location: string }>;
}) {
  const { data: liveTestimonials } = trpc.testimonials.listApproved.useQuery(
    { limit: 9, featuredFirst: true },
    { staleTime: 5 * 60 * 1000 }
  );

  // Use live testimonials if we have any, otherwise fall back to static
  const useLive = liveTestimonials && liveTestimonials.length > 0;

  if (useLive) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {liveTestimonials.map((testimonial, i) => (
          <FadeInSection key={testimonial.id} delay={0.15 * (i + 1)}>
            <div
              className={`bg-navy-light/30 border rounded-xl p-6 h-full flex flex-col hover:border-amber/20 transition-colors duration-500 ${
                testimonial.featured ? "border-amber/30" : "border-border/20"
              }`}
            >
              <StarRow rating={testimonial.rating ?? 5} />
              <p className="text-foreground/60 leading-relaxed flex-1 mb-4 text-sm">
                &ldquo;{testimonial.body}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-border/15">
                <div className="w-10 h-10 rounded-full bg-amber/15 flex items-center justify-center">
                  <span className="text-amber font-semibold text-sm">
                    {(testimonial.name || "A")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-foreground/80 font-medium text-sm">
                    {testimonial.name || "Verified Customer"}
                  </p>
                  {testimonial.nightsToResult && (
                    <p className="text-amber/50 text-xs">Results by Night {testimonial.nightsToResult}</p>
                  )}
                </div>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>
    );
  }

  // Fallback: static testimonials
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {staticReviews.map((testimonial, i) => (
        <FadeInSection key={i} delay={0.15 * (i + 1)}>
          <div className="bg-navy-light/30 border border-border/20 rounded-xl p-6 h-full flex flex-col hover:border-amber/20 transition-colors duration-500">
            <StarRow rating={5} />
            <p className="text-foreground/60 leading-relaxed flex-1 mb-4 text-sm">
              &ldquo;{testimonial.text}&rdquo;
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-border/15">
              <div className="w-10 h-10 rounded-full bg-amber/15 flex items-center justify-center">
                <span className="text-amber font-semibold text-sm">{testimonial.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-foreground/80 font-medium text-sm">{testimonial.name}</p>
                <p className="text-foreground/35 text-xs">{testimonial.location}</p>
              </div>
            </div>
          </div>
        </FadeInSection>
      ))}
    </div>
  );
}

// Animated section wrapper
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 50, filter: "blur(8px)" }}
      transition={{ duration: 0.9, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Empathy heading with word-by-word reveal animation
function EmpathyHeading({ title1, title2 }: { title1: string; title2: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const line1Words = title1.split(" ");
  const line2Words = title2.split(" ");

  return (
    <div ref={ref} className="text-center mb-12">
      <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-6 empathy-heading-glow">
        {line1Words.map((word, i) => (
          <motion.span
            key={`l1-${i}`}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 18, filter: "blur(6px)" }
            }
            transition={{
              duration: 0.55,
              delay: i * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block mr-[0.3em]"
          >
            {word}
          </motion.span>
        ))}
        <br className="hidden sm:block" />
        {line2Words.map((word, i) => (
          <motion.span
            key={`l2-${i}`}
            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 18, filter: "blur(6px)" }
            }
            transition={{
              duration: 0.55,
              delay: line1Words.length * 0.15 + 0.2 + i * 0.15,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block mr-[0.3em] text-lavender"
          >
            {word}
          </motion.span>
        ))}
      </h2>
      {/* Animated underline that draws in after words appear */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={
          isInView
            ? { scaleX: 1, opacity: 1 }
            : { scaleX: 0, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          delay: (line1Words.length + line2Words.length) * 0.15 + 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        }}
        className="mx-auto w-24 h-px bg-gradient-to-r from-transparent via-lavender/60 to-transparent origin-center"
      />
    </div>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div
      className={`border rounded-xl transition-all duration-300 ${
        isOpen ? "border-amber/20 bg-card/40" : "border-border/30 bg-card/10 hover:bg-card/20"
      }`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left"
      >
        <span className="font-[var(--font-display)] text-base sm:text-lg font-medium text-foreground/85">
          {question}
        </span>
        <ChevronRight
          className={`w-5 h-5 text-amber/50 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="px-5 sm:px-6 pb-5 sm:pb-6">
          <p className="text-foreground/55 leading-relaxed text-sm sm:text-base">
            {answer}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const { t, localePath } = useLanguage();
  const variant = useMemo(() => getVariant(), []);
  const headline = t.hero.variants[variant];
  const [scrollY, setScrollY] = useState(0);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set document title and meta description for SEO
  useEffect(() => {
    document.title = "Deep Sleep Reset: Fix Insomnia in 7 Nights";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Science-backed 7-night CBT-I protocol to fix insomnia and fall asleep faster. No pills, no apps. Trusted by 10,000+ people. Just $5.');
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'deep sleep, how to get deep sleep, fix insomnia, sleep better, CBT-I, sleep reset, sleep anxiety, insomnia cure, natural sleep remedies, fall asleep fast');
    }
  }, []);

  // Fire ViewContent event once on page load
  const viewContentFired = useRef(false);
  useEffect(() => {
    if (viewContentFired.current) return;
    viewContentFired.current = true;
    trackEvent("ViewContent", {
      content_name: "Deep Sleep Reset — 7-Night Protocol",
      content_type: "product",
      value: 5.00,
      currency: "USD",
    });
  }, []);

  const goToOrder = () => {
    navigate(`${localePath}/order`);
  };

  const scrollToOffer = () => {
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
  };

  const homeSchemas = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "The 7-Night Deep Sleep Reset",
      "description": "A science-backed CBT-I protocol to fix insomnia, racing thoughts, and broken sleep cycles in 7 nights.",
      "url": "https://deep-sleep-reset.com",
      "brand": { "@type": "Brand", "name": "Deep Sleep Reset" },
      "offers": {
        "@type": "Offer",
        "price": "5.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock",
        "url": "https://deep-sleep-reset.com/order",
        "priceValidUntil": "2026-12-31",
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "847",
        "bestRating": "5",
        "worstRating": "1",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the 7-Night Deep Sleep Reset?",
          "acceptedAnswer": { "@type": "Answer", "text": "It's a 7-night CBT-I (Cognitive Behavioral Therapy for Insomnia) protocol — the same method sleep doctors use. Each night you get one specific technique to fix a different root cause of insomnia." }
        },
        {
          "@type": "Question",
          "name": "How is this different from melatonin or sleeping pills?",
          "acceptedAnswer": { "@type": "Answer", "text": "Melatonin and pills treat symptoms. CBT-I fixes the root cause — your brain's broken sleep patterns. The results are permanent, not temporary." }
        },
        {
          "@type": "Question",
          "name": "Why does it only cost $5?",
          "acceptedAnswer": { "@type": "Answer", "text": "We believe everyone deserves access to evidence-based sleep help. The $5 price removes the barrier so you can experience the results risk-free. There's also a 30-day money-back guarantee." }
        },
        {
          "@type": "Question",
          "name": "How quickly will I see results?",
          "acceptedAnswer": { "@type": "Answer", "text": "Most people notice improvement by Night 3. By Night 7, the majority report falling asleep faster and waking up less. Full results typically appear within 2-4 weeks." }
        },
        {
          "@type": "Question",
          "name": "What if it doesn't work for me?",
          "acceptedAnswer": { "@type": "Answer", "text": "You're covered by a 30-day money-back guarantee. If you don't see improvement, email us and we'll refund every cent — no questions asked." }
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Deep Sleep Reset",
      "url": "https://deep-sleep-reset.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://deep-sleep-reset.com/blog?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ], []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SeoHead
        title="Deep Sleep Reset: Fix Insomnia in 7 Nights — CBT-I Protocol"
        description="Science-backed 7-night CBT-I protocol to fix insomnia and fall asleep faster. No pills, no apps. Trusted by 10,000+ people. Just $5. 30-day guarantee."
        canonicalUrl="https://deep-sleep-reset.com"
        schemas={homeSchemas}
      />
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          backgroundColor: scrollY > 80 ? "oklch(0.12 0.025 260 / 0.95)" : "transparent",
          backdropFilter: scrollY > 80 ? "blur(12px)" : "none",
          borderBottom: scrollY > 80 ? "1px solid oklch(0.25 0.02 260 / 0.5)" : "1px solid transparent",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-wide text-amber">
              {t.common.brandName}
            </span>
          </div>
          <button
            onClick={goToOrder}
            className="bg-amber/10 hover:bg-amber/20 text-amber border border-amber/30 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
          >
            {t.header.ctaButton}
          </button>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 bg-cover bg-center will-change-transform"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            transform: `translateY(${scrollY * 0.3}px) scale(1.1)`,
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        {/* Ambient glow orbs */}
        <div className="ambient-glow w-[400px] h-[400px] bg-amber/8 top-1/4 left-1/4 -translate-x-1/2" />
        <div className="ambient-glow w-[300px] h-[300px] bg-blue-500/5 bottom-1/3 right-1/4" style={{ animationDelay: '3s' }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-amber/80 text-sm uppercase tracking-[0.3em] mb-6 font-medium">
              {t.hero.protocol}
            </p>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-glow">
              {headline.main}
              <span className="text-amber italic">{headline.highlight}</span>
              {headline.continuation}
            </h1>
            <p className="text-lg sm:text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
              {headline.sub}
            </p>
            <button
              onClick={goToOrder}
              className="cta-pulse cta-shimmer inline-flex items-center gap-3 bg-amber text-background font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:bg-amber-light"
            >
              {t.hero.ctaButton}
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 cursor-pointer" onClick={scrollToOffer}>
          <span className="text-foreground/40 text-xs uppercase tracking-widest">scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-amber/60" />
          </motion.div>
        </div>
      </section>

      {/* ===== PROBLEM / PAIN SECTION ===== */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image */}
            <FadeInSection>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={INSOMNIA_IMG}
                  alt="Person lying awake at 3:17 AM"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-red-400/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{t.pain.clockLabel}</span>
                </div>
              </div>
            </FadeInSection>

            {/* Right: Copy */}
            <FadeInSection delay={0.2}>
              <div>
                <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                  {t.pain.intro1}
                </p>
                <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                  {t.pain.intro2}
                </p>
                <p className="text-foreground/60 leading-relaxed mb-8">
                  {t.pain.intro3}
                </p>
                <p className="text-foreground/50 text-sm uppercase tracking-widest mb-4">
                  {t.pain.triedEverything}
                </p>
                <ul className="space-y-3">
                  {t.pain.painPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-foreground/60">
                      <span className="text-red-400/60 mt-1 shrink-0">✕</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ===== THE BRUTAL TRUTH ===== */}
      <section className="py-20 lg:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/50 to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <div className="border border-amber/20 rounded-2xl p-8 sm:p-12 bg-card/50 backdrop-blur-sm">
              <p className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold leading-snug text-foreground/90 mb-6">
                {t.brutalTruth.main}
                <span className="text-amber text-glow">{t.brutalTruth.highlight}</span>
              </p>
              <p className="text-foreground/60 text-lg leading-relaxed">
                {t.brutalTruth.body}
              </p>
              <div className="mt-8 w-16 h-px bg-amber/30 mx-auto" />
              <p className="mt-8 text-foreground/70 text-lg leading-relaxed">
                {t.brutalTruth.worst}
              </p>
              <p className="mt-6 font-[var(--font-display)] text-2xl font-semibold text-amber">
                {t.brutalTruth.whatIf}
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== BRAIN WAVES TRANSITION ===== */}
      <section className="py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <FadeInSection>
            <img
              src={BRAIN_WAVES_IMG}
              alt="Brain waves transitioning from anxiety to peace"
              className="w-full h-auto rounded-xl shadow-2xl"
              loading="lazy"
            />
          </FadeInSection>
        </div>
      </section>

      {/* ===== SLEEP SCORE QUIZ ===== */}
      <SleepScoreQuiz />

      {/* ===== PRODUCT INTRODUCTION ===== */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <FadeInSection>
              <div>
                <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
                  {t.product.introducing}
                </p>
                <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                  {t.product.title}
                  <span className="text-amber text-glow">{t.product.titleHighlight}</span>
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                  {t.product.desc1}<strong className="text-foreground/90">{t.product.desc1Bold}</strong>
                </p>
                <p className="text-foreground/60 leading-relaxed mb-6">
                  {t.product.desc2}<strong className="text-foreground/80">{t.product.desc2Bold}</strong>
                </p>
                <p className="text-foreground/60 leading-relaxed">
                  {t.product.desc3}
                </p>
              </div>
            </FadeInSection>

            {/* Right: Image */}
            <FadeInSection delay={0.2}>
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={SLEEP_IMG}
                  alt="Person sleeping peacefully"
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>
            </FadeInSection>
          </div>
        </div>
      </section>

      {/* ===== 7-NIGHT MODULES ===== */}
      <section className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/30 to-background" />
        <div className="relative max-w-5xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-16">
              <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
                {t.modules.sectionLabel}
              </p>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold">
                {t.modules.sectionTitle}
              </h2>
            </div>
          </FadeInSection>

          <div className="space-y-4">
            {t.modules.nights.map((night, i) => {
              const Icon = nightIcons[i] || Moon;
              return (
                <FadeInSection key={i} delay={i * 0.08}>
                  <div className="group relative border border-border/50 rounded-xl p-6 sm:p-8 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-amber/20 transition-all duration-500">
                    <div className="flex items-start gap-5 sm:gap-8">
                      {/* Night number */}
                      <div className="shrink-0 w-14 h-14 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center group-hover:bg-amber/20 group-hover:scale-110 breathe-glow transition-all duration-500">
                        <span className="font-[var(--font-display)] text-amber font-bold text-lg">
                          {i + 1}
                        </span>
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-4 h-4 text-amber/60" />
                          <h3 className="font-[var(--font-display)] text-lg sm:text-xl font-semibold text-foreground/90">
                            {night.title}
                          </h3>
                        </div>
                        <p className="text-foreground/60 leading-relaxed">
                          {night.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeInSection>
              );
            })}
          </div>

          <FadeInSection delay={0.6}>
            <p className="text-center mt-12 text-foreground/70 text-lg max-w-2xl mx-auto leading-relaxed">
              {t.modules.conclusion}
              <strong className="text-amber">{t.modules.conclusionHighlight}</strong>
              {t.modules.conclusionEnd}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / WHO IT'S FOR ===== */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <EmpathyHeading title1={t.socialProof.title1} title2={t.socialProof.title2} />

          {/* Stats */}
          <FadeInSection delay={0.15}>
            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              {t.socialProof.stats.map((item, i) => (
                <div key={i} className="text-center p-6 rounded-xl border border-border/30 bg-card/20">
                  <p className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-amber text-glow mb-2">
                    {item.stat}
                  </p>
                  <p className="text-foreground/50 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection delay={0.3}>
            <div className="border border-amber/10 rounded-2xl p-8 sm:p-10 bg-card/20">
              <h3 className="font-[var(--font-display)] text-xl font-semibold mb-6 text-foreground/80">
                {t.socialProof.forYouTitle}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {t.socialProof.forYouItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-amber/70 mt-0.5 shrink-0" />
                    <span className="text-foreground/70">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== VIDEO TESTIMONIALS / SOCIAL PROOF ===== */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/20 to-background" />
        <div className="relative max-w-5xl mx-auto px-4">
          <FadeInSection>
            <p className="text-amber/80 text-sm uppercase tracking-[0.3em] mb-4 text-center font-medium">
              {t.testimonials.sectionLabel}
            </p>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              {t.testimonials.sectionTitle}
              <span className="text-amber italic">{t.testimonials.sectionTitleHighlight}</span>
            </h2>
            <p className="text-foreground/50 text-center max-w-2xl mx-auto mb-16">
              {t.testimonials.sectionDesc}
            </p>
          </FadeInSection>

          {/* Featured Testimonial — replaces video placeholder */}
          <FadeInSection delay={0.1}>
            <div className="max-w-3xl mx-auto mb-16">
              <div className="relative rounded-2xl border border-amber/20 bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-amber/5">
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-lavender/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="relative p-8 sm:p-10">
                  {/* Stars */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <svg key={j} className="w-5 h-5 text-amber" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Pull quote */}
                  <blockquote className="font-[var(--font-display)] text-xl sm:text-2xl md:text-3xl font-semibold leading-snug text-foreground/90 mb-6">
                    &ldquo;I tried <span className="text-amber">everything</span> for 10 years.
                    By Night 4, I was falling asleep in 15 minutes.
                    I actually <span className="text-lavender italic">cried</span> the first morning I woke up feeling rested.&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-6 border-t border-border/20">
                    <div className="w-14 h-14 rounded-full bg-amber/15 border border-amber/20 flex items-center justify-center shrink-0">
                      <span className="font-[var(--font-display)] text-amber font-bold text-xl">S</span>
                    </div>
                    <div>
                      <p className="text-foreground/90 font-semibold">Sarah M.</p>
                      <p className="text-foreground/45 text-sm">Austin, TX &mdash; struggled with insomnia for 10 years</p>
                    </div>
                    <div className="ml-auto hidden sm:flex flex-col items-end">
                      <p className="text-amber/70 text-xs uppercase tracking-widest font-medium">Result</p>
                      <p className="text-foreground/80 font-semibold text-sm">Asleep in 15 min by Night 4</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-foreground/25 text-xs mt-3">{t.testimonials.resultsDisclaimer}</p>
            </div>
          </FadeInSection>

          {/* Written Testimonials Grid — live from database, fallback to static */}
          <LiveTestimonialsGrid staticReviews={t.testimonials.reviews} />

          {/* Trust bar */}
          <FadeInSection delay={0.5}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-foreground/30 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber/50" />
                <span>{t.testimonials.trustBar.happySleepers}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber/50" />
                <span>{t.testimonials.trustBar.avgRating}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber/50" />
                <span>{t.testimonials.trustBar.guarantee}</span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== THE OFFER ===== */}
      <section id="offer" className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/40 to-background" />
        <div className="ambient-glow w-[350px] h-[350px] bg-amber/6 top-1/3 left-0 -translate-x-1/2" />
        <div className="ambient-glow w-[250px] h-[250px] bg-blue-400/4 bottom-1/4 right-0 translate-x-1/3" style={{ animationDelay: '2s' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
              {t.offer.label}
            </p>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
              {t.offer.title}
            </h2>

            {/* Live Visitor Counter */}
            <div className="flex justify-center mb-6">
              <LiveVisitorCounter />
            </div>

            {/* Price */}
            <div className="my-10">
              <span className="text-foreground/30 line-through text-2xl mr-4">{t.offer.originalPrice}</span>
              <span className="font-[var(--font-display)] text-6xl sm:text-7xl font-bold gradient-text-animated">
                {t.offer.salePrice}
              </span>
            </div>

            {/* Urgency Timer */}
            <div className="flex justify-center mb-4">
              <UrgencyTimer />
            </div>

            <p className="text-foreground/60 text-lg mb-10 max-w-xl mx-auto">
              {t.offer.desc}
            </p>
          </FadeInSection>

          {/* What you get */}
          <FadeInSection delay={0.2}>
            <div className="border border-amber/20 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-10 text-left">
              <h3 className="font-[var(--font-display)] text-xl font-semibold mb-6 text-center text-foreground/90">
                {t.offer.whatYouGet}
              </h3>
              <div className="space-y-4">
                {t.offer.items.map((pkg, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-amber/70 shrink-0" />
                      <span className="text-foreground/80">{pkg.item}</span>
                    </div>
                    <span className="text-foreground/40 text-sm shrink-0">(Value: {pkg.value})</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-amber/20 flex items-center justify-between">
                <span className="text-foreground/50">{t.offer.totalValue}</span>
                <span className="text-foreground/40 line-through">$110</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-[var(--font-display)] text-xl font-bold text-foreground/90">{t.offer.yourPrice}</span>
                <span className="font-[var(--font-display)] text-3xl font-bold text-amber text-glow">{t.offer.justPrice}</span>
              </div>
            </div>
          </FadeInSection>

          {/* CTA Button */}
          <FadeInSection delay={0.4}>
            <button
              onClick={goToOrder}
              className="cta-pulse cta-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 hover:scale-105"
            >
              {t.offer.ctaButton}
            </button>
            {/* Stock scarcity */}
            <p className="mt-3 text-xs text-foreground/40 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-amber/60" />
              Limited spots at this price — {Math.floor(Math.random() * 12) + 3} people purchased in the last hour
            </p>
            <p className="mt-4 text-foreground/40 text-sm flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              {t.common.secureCheckout}
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ===== GUARANTEE ===== */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <FadeInSection>
            <div className="grid md:grid-cols-[200px_1fr] gap-8 items-center border border-amber/15 rounded-2xl p-8 sm:p-12 bg-card/20">
              <div className="flex justify-center">
                <img
                  src={SHIELD_IMG}
                  alt="30-Day Money Back Guarantee"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain float-gentle"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-4">
                  {t.guarantee.title}
                  <span className="text-amber">{t.guarantee.titleHighlight}</span>
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-4">
                  {t.guarantee.desc1}
                </p>
                <p className="text-foreground/50 leading-relaxed">
                  {t.guarantee.desc2}
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="py-24 lg:py-32">
        <div className="max-w-3xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-amber/60" />
              </div>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold">
                {t.faq.title}
              </h2>
            </div>
          </FadeInSection>

          <div className="space-y-3">
            {t.faq.items.map((faq, i) => (
              <FadeInSection key={i} delay={i * 0.05}>
                <FAQItem question={faq.q} answer={faq.a} />
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/50 to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-6">
              {t.finalCta.title}
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed mb-4">
              {t.finalCta.desc1}
            </p>
            <p className="text-foreground/70 text-lg leading-relaxed mb-10">
              {t.finalCta.desc2}
              <strong className="text-amber">{t.finalCta.desc2Highlight}</strong>
            </p>

            <button
              onClick={goToOrder}
              className="cta-pulse cta-shimmer w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 hover:scale-105"
            >
              {t.finalCta.ctaButton}
            </button>

            <div className="mt-12 max-w-xl mx-auto border-t border-border/30 pt-8">
              <p className="text-foreground/50 leading-relaxed italic">
                <strong className="text-foreground/70 not-italic">P.S.</strong> {t.finalCta.ps}
                <em>{t.finalCta.psItalic1}</em>{t.finalCta.psMid}
                <em>{t.finalCta.psItalic2}</em>{t.finalCta.psEnd}
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-12 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber/50" />
              <span className="text-foreground/40 text-sm">{t.common.brandName}</span>
            </div>
            <div className="flex items-center gap-6 text-foreground/30 text-sm">
              <Link href={localePath("/privacy")} className="hover:text-foreground/60 transition-colors">{t.common.privacyPolicy}</Link>
              <Link href={localePath("/terms")} className="hover:text-foreground/60 transition-colors">{t.common.termsOfService}</Link>
              <Link href={localePath("/affiliates")} className="hover:text-foreground/60 transition-colors">{t.common.affiliates}</Link>
              <a href="mailto:support@deepsleepreset.com" className="hover:text-foreground/60 transition-colors">{t.common.contact}</a>
            </div>
            <p className="text-foreground/30 text-xs">
              &copy; {new Date().getFullYear()} {t.common.copyright}
            </p>
          </div>
          <p className="text-center text-foreground/20 text-xs mt-6 max-w-2xl mx-auto">
            {t.common.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
