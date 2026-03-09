/*
 * Design: "Midnight Noir" — Cinematic Dark Immersion
 * Palette: Deep navy (#0a0e1a), amber/gold (#d4a853), lavender (#b8a9c9), warm white (#f0ece4)
 * Fonts: Playfair Display (display), Source Sans 3 (body)
 * Philosophy: The page itself feels like nighttime — calming, immersive, cinematic
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { openCheckout } from "@/lib/checkout";
import { getHeadline } from "@/lib/ab-test";
import { Link } from "wouter";
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
  Star,
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

// Animated section wrapper
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Night module data
const nights = [
  { night: 1, title: "The Sleep Pressure Reset", desc: "Learn the counterintuitive method to build powerful, natural sleep drive, making your body crave sleep.", icon: Moon },
  { night: 2, title: "The Racing Mind Shutdown", desc: "A 10-minute \"cognitive offload\" technique to dump your anxieties and stop the mental chatter.", icon: Brain },
  { night: 3, title: "The Body Scan Meltdown", desc: "A guided audio that systematically melts tension from your body, making it physically impossible to hold onto stress.", icon: Zap },
  { night: 4, title: "The Breath Pattern Switch", desc: "Master the 4-7-8 breathing technique used by Navy SEALs to instantly calm the nervous system.", icon: Wind },
  { night: 5, title: "The Light & Dark Protocol", desc: "Learn how to use light to reset your internal clock so you feel sleepy at the right time.", icon: Sun },
  { night: 6, title: "The Stimulus Control Method", desc: "A powerful psychological technique to re-train your brain to associate your bed with deep, restful sleep.", icon: Bed },
  { night: 7, title: "The Sleep Confidence Lock-In", desc: "Combine everything into a simple, personalized nightly ritual that makes deep sleep automatic.", icon: Lock },
];

const painPoints = [
  "Melatonin gummies that leave you groggy and give you weird dreams.",
  "Expensive sleeping pills that you know aren't a long-term solution.",
  "\"Sleepytime\" tea that does absolutely nothing.",
  "Endless YouTube videos of rain sounds that just make you need to pee.",
  "The classic, useless advice: \"Just relax,\" \"Clear your mind,\" \"Don't look at your phone.\"",
];

const forYouIf = [
  "You can't fall asleep, no matter how tired you are.",
  "You wake up multiple times a night and can't get back to sleep.",
  "You wake up feeling like you haven't slept at all.",
  "You rely on caffeine to get through the day.",
  "You're sick of feeling tired, anxious, and irritable.",
  "You want a real, lasting solution, not another quick fix.",
];

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
  const headline = useMemo(() => getHeadline(), []);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToOffer = () => {
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
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
              Deep Sleep Reset
            </span>
          </div>
          <button
            onClick={scrollToOffer}
            className="bg-amber/10 hover:bg-amber/20 text-amber border border-amber/30 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300"
          >
            Get the Reset — $5
          </button>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center pt-24 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <p className="text-amber/80 text-sm uppercase tracking-[0.3em] mb-6 font-medium">
              The 7-Night Protocol
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
              onClick={scrollToOffer}
              className="cta-pulse inline-flex items-center gap-3 bg-amber text-background font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:bg-amber-light"
            >
              Yes, I Want to Sleep Tonight
              <ChevronDown className="w-5 h-5 animate-bounce" />
            </button>
          </motion.div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
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
                  <span className="font-medium">3:17 AM — Another sleepless night</span>
                </div>
              </div>
            </FadeInSection>

            {/* Right: Copy */}
            <FadeInSection delay={0.2}>
              <div>
                <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                  It's the middle of the night. The house is silent. Everyone else is asleep.
                </p>
                <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                  But you're not.
                </p>
                <p className="text-foreground/60 leading-relaxed mb-8">
                  You're wide awake, your mind racing with a toxic cocktail of tomorrow's to-do list,
                  yesterday's regrets, and a constant, buzzing anxiety that just won't shut off.
                </p>
                <p className="text-foreground/50 text-sm uppercase tracking-widest mb-4">
                  You've tried everything, haven't you?
                </p>
                <ul className="space-y-3">
                  {painPoints.map((point, i) => (
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
                The brutal truth is, you're not just tired.{" "}
                <span className="text-amber text-glow">You're being robbed.</span>
              </p>
              <p className="text-foreground/60 text-lg leading-relaxed">
                Robbed of your energy. Robbed of your focus. Robbed of your health.
                Robbed of your ability to be present with your family and friends.
              </p>
              <div className="mt-8 w-16 h-px bg-amber/30 mx-auto" />
              <p className="mt-8 text-foreground/70 text-lg leading-relaxed">
                And the worst part? You start to believe this is just... how it is now.
              </p>
              <p className="mt-6 font-[var(--font-display)] text-2xl font-semibold text-amber">
                But what if it wasn't?
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

      {/* ===== PRODUCT INTRODUCTION ===== */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Copy */}
            <FadeInSection>
              <div>
                <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
                  Introducing
                </p>
                <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                  The 7-Night{" "}
                  <span className="text-amber text-glow">Deep Sleep Reset</span>
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-6">
                  The science-backed, step-by-step protocol designed to fix your broken sleep cycle
                  and give you back your nights — <strong className="text-foreground/90">for good.</strong>
                </p>
                <p className="text-foreground/60 leading-relaxed mb-6">
                  This isn't another flimsy PDF ebook filled with generic advice. This is a structured,
                  interactive 7-day program that gives you <strong className="text-foreground/80">one simple,
                  powerful action to take each night.</strong>
                </p>
                <p className="text-foreground/60 leading-relaxed">
                  We've taken the most effective, clinically-proven techniques from Cognitive Behavioral
                  Therapy for Insomnia (CBT-I) — the method doctors and sleep scientists call the
                  "gold standard" for treating sleep problems — and distilled them into an easy-to-follow,
                  night-by-night reset.
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
                Your 7-Night Journey
              </p>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold">
                Here's Exactly What You'll Do
              </h2>
            </div>
          </FadeInSection>

          <div className="space-y-4">
            {nights.map((night, i) => {
              const Icon = night.icon;
              return (
                <FadeInSection key={i} delay={i * 0.08}>
                  <div className="group relative border border-border/50 rounded-xl p-6 sm:p-8 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:border-amber/20 transition-all duration-500">
                    <div className="flex items-start gap-5 sm:gap-8">
                      {/* Night number */}
                      <div className="shrink-0 w-14 h-14 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center group-hover:bg-amber/20 transition-all duration-500">
                        <span className="font-[var(--font-display)] text-amber font-bold text-lg">
                          {night.night}
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
              By the end of the 7 nights, you won't just have had a good week of sleep.
              You will have installed a <strong className="text-amber">new operating system for sleep</strong> in your brain.
            </p>
          </FadeInSection>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / WHO IT'S FOR ===== */}
      <section className="py-24 lg:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <FadeInSection>
            <div className="text-center mb-12">
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-6">
                You Are Not Alone.{" "}
                <span className="text-lavender">And This Is Not Your Fault.</span>
              </h2>
            </div>
          </FadeInSection>

          {/* Stats */}
          <FadeInSection delay={0.15}>
            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              {[
                { stat: "30%+", label: "of adults worldwide suffer from insomnia" },
                { stat: "$65B+", label: "global market for sleep aids" },
                { stat: "#1", label: "CBT-I is the gold standard treatment" },
              ].map((item, i) => (
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
                This program is for you if:
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {forYouIf.map((item, i) => (
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
              Real People. Real Results.
            </p>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              Hear From People Who{" "}
              <span className="text-amber italic">Finally Sleep</span>
            </h2>
            <p className="text-foreground/50 text-center max-w-2xl mx-auto mb-16">
              Thousands of people have used the 7-Night Deep Sleep Reset to transform their nights. Here are just a few of their stories.
            </p>
          </FadeInSection>

          {/* Video Embed Placeholder */}
          <FadeInSection delay={0.1}>
            <div className="max-w-3xl mx-auto mb-16">
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/30 bg-navy-light/30 group">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-amber/20 flex items-center justify-center group-hover:bg-amber/30 transition-colors duration-300">
                    <div className="w-0 h-0 border-l-[20px] border-l-amber border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1.5" />
                  </div>
                  <p className="text-foreground/40 text-sm">Watch: How Sarah Fixed 10 Years of Insomnia in 7 Nights</p>
                </div>
                {/* Replace this div with actual video embed:
                <iframe
                  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                /> */}
              </div>
            </div>
          </FadeInSection>

          {/* Written Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                location: "Austin, TX",
                stars: 5,
                text: "I've struggled with insomnia for over 10 years. By Night 4, I was falling asleep within 15 minutes. I actually cried the first morning I woke up feeling rested. This program changed my life.",
                highlight: "falling asleep within 15 minutes",
              },
              {
                name: "James K.",
                location: "London, UK",
                stars: 5,
                text: "I was skeptical — $5 for something that actually works? But the breathing technique on Night 4 was a game-changer. I've stopped taking melatonin completely. My wife noticed the difference before I did.",
                highlight: "stopped taking melatonin completely",
              },
              {
                name: "Maria L.",
                location: "Toronto, CA",
                stars: 5,
                text: "As a nurse working night shifts, my sleep was destroyed. The Light & Dark Protocol on Night 5 helped me reset my circadian rhythm. I now sleep 7+ hours even after a night shift. Incredible.",
                highlight: "sleep 7+ hours even after a night shift",
              },
            ].map((testimonial, i) => (
              <FadeInSection key={i} delay={0.15 * (i + 1)}>
                <div className="bg-navy-light/30 border border-border/20 rounded-xl p-6 h-full flex flex-col hover:border-amber/20 transition-colors duration-500">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.stars }).map((_, j) => (
                      <svg key={j} className="w-4 h-4 text-amber" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-foreground/60 leading-relaxed flex-1 mb-4 text-sm">
                    "{testimonial.text}"
                  </p>
                  {/* Author */}
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

          {/* Trust bar */}
          <FadeInSection delay={0.5}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-foreground/30 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber/50" />
                <span>10,000+ Happy Sleepers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber/50" />
                <span>4.9/5 Average Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber/50" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ===== THE OFFER ===== */}
      <section id="offer" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/40 to-background" />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeInSection>
            <p className="text-amber/70 text-sm uppercase tracking-[0.2em] mb-4 font-medium">
              Limited Time Offer
            </p>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
              Get The Entire 7-Night Deep Sleep Reset Today For Just...
            </h2>

            {/* Price */}
            <div className="my-10">
              <span className="text-foreground/30 line-through text-2xl mr-4">$47</span>
              <span className="font-[var(--font-display)] text-6xl sm:text-7xl font-bold text-amber text-glow">
                $5
              </span>
            </div>

            <p className="text-foreground/60 text-lg mb-10 max-w-xl mx-auto">
              Why so low? Because I know you're skeptical. You've been burned before.
              I want to remove any and all risk for you to try this. For the price of a single cup of coffee,
              you can get the tools to reclaim your nights, your energy, and your life.
            </p>
          </FadeInSection>

          {/* What you get */}
          <FadeInSection delay={0.2}>
            <div className="border border-amber/20 rounded-2xl p-8 sm:p-10 bg-card/40 backdrop-blur-sm mb-10 text-left">
              <h3 className="font-[var(--font-display)] text-xl font-semibold mb-6 text-center text-foreground/90">
                Here's Everything You Get:
              </h3>
              <div className="space-y-4">
                {[
                  { item: "The Full 7-Night Deep Sleep Reset Program", value: "$47" },
                  { item: "Interactive Web-Based Modules (access anywhere, anytime)", value: "$27" },
                  { item: "Daily Guided Audio Sessions (for relaxation and techniques)", value: "$19" },
                  { item: "BONUS: The Printable Sleep Journal Template", value: "$17" },
                ].map((pkg, i) => (
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
                <span className="text-foreground/50">Total Value:</span>
                <span className="text-foreground/40 line-through">$110</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="font-[var(--font-display)] text-xl font-bold text-foreground/90">Your Price Today:</span>
                <span className="font-[var(--font-display)] text-3xl font-bold text-amber text-glow">Just $5</span>
              </div>
            </div>
          </FadeInSection>

          {/* CTA Button */}
          <FadeInSection delay={0.4}>
            <button
              onClick={() => openCheckout("frontEnd")}
              className="cta-pulse w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 hover:scale-105"
            >
              YES, I WANT TO SLEEP TONIGHT! GIVE ME THE $5 RESET NOW
            </button>
            <p className="mt-4 text-foreground/40 text-sm flex items-center justify-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              Secure checkout. Instant digital access.
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
                  className="w-32 h-32 md:w-40 md:h-40 object-contain"
                  loading="lazy"
                />
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-4">
                  The "Sleep Soundly or It's Free"{" "}
                  <span className="text-amber">Guarantee</span>
                </h2>
                <p className="text-foreground/70 text-lg leading-relaxed mb-4">
                  Try the entire 7-Night Deep Sleep Reset. If you don't experience a dramatic
                  improvement in your sleep within 30 days, just send us an email and we'll
                  refund your $5. No questions asked.
                </p>
                <p className="text-foreground/50 leading-relaxed">
                  That's how confident we are in this program. You either get the results
                  you're looking for, or you pay nothing.
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
                Frequently Asked Questions
              </h2>
            </div>
          </FadeInSection>

          <div className="space-y-3">
            {[
              {
                q: "Is this just another ebook with generic sleep tips?",
                a: "No. This is a structured, interactive 7-night program based on Cognitive Behavioral Therapy for Insomnia (CBT-I) — the clinically-proven \"gold standard\" treatment recommended by doctors and sleep scientists. Each night gives you one specific, powerful action to take.",
              },
              {
                q: "How is this different from melatonin or sleeping pills?",
                a: "Melatonin and sleeping pills mask the symptoms without fixing the root cause. The Deep Sleep Reset retrains your brain's natural sleep mechanisms so you can fall asleep and stay asleep without any external aids. The results are permanent, not temporary.",
              },
              {
                q: "What if I've tried everything and nothing works?",
                a: "That's exactly who this program is designed for. CBT-I has been shown to be effective even for people with chronic insomnia who have tried multiple other treatments. The techniques work with your body's biology, not against it.",
              },
              {
                q: "How quickly will I see results?",
                a: "Many people report noticeable improvements by Night 3 or 4. By the end of the 7-night protocol, most users experience significantly deeper, more restful sleep. The full benefits compound over the following weeks.",
              },
              {
                q: "Do I need any special equipment or apps?",
                a: "No. Everything you need is included in the program. All you need is a quiet space, a bed, and 15-20 minutes before bedtime each night. The guided audio sessions can be played on any device.",
              },
              {
                q: "What if it doesn't work for me?",
                a: "You're covered by our 30-day \"Sleep Soundly or It's Free\" guarantee. If you don't experience a dramatic improvement in your sleep, just email us and we'll refund every penny. No questions asked.",
              },
              {
                q: "Is my payment secure?",
                a: "Absolutely. We use industry-standard 256-bit SSL encryption for all transactions. Your payment information is never stored on our servers.",
              },
            ].map((faq, i) => (
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
              What's It Going To Be?
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed mb-4">
              Another night of tossing and turning, staring at the clock, and dreading the morning?
            </p>
            <p className="text-foreground/70 text-lg leading-relaxed mb-10">
              Or are you ready to try something different? Something that{" "}
              <strong className="text-amber">works.</strong>
            </p>

            <button
              onClick={() => openCheckout("frontEnd")}
              className="cta-pulse w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 hover:scale-105"
            >
              CLICK HERE TO GET INSTANT ACCESS FOR JUST $5
            </button>

            <div className="mt-12 max-w-xl mx-auto border-t border-border/30 pt-8">
              <p className="text-foreground/50 leading-relaxed italic">
                <strong className="text-foreground/70 not-italic">P.S.</strong> Think about it. You've probably spent more than $5 on a single coffee
                just to deal with the <em>symptoms</em> of poor sleep. For that same price, you can start
                treating the <em>cause</em>. Don't you owe it to yourself to at least try?
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
          <p className="text-center text-foreground/20 text-xs mt-6 max-w-2xl mx-auto">
            Disclaimer: Results may vary. This product is not intended to diagnose, treat, cure, or prevent any disease.
            Consult your healthcare provider before starting any new health program.
          </p>
        </div>
      </footer>
    </div>
  );
}
