/*
 * SleepScoreQuiz — Lead Gen + Personalization Quiz
 *
 * Strategy:
 *  - 5 questions about sleep habits → calculate a "Sleep Score" (0-100)
 *  - Show personalized result with severity label
 *  - Capture email before revealing full results
 *  - CTA leads directly to checkout with urgency
 *
 * Placement: Embedded in Home.tsx between pain section and product intro
 * Design: Midnight Noir — dark card, amber accents, progress bar
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Brain, Clock, Zap, ArrowRight, Mail, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { openCheckout } from "@/lib/checkout";
import { trpc } from "@/lib/trpc";

interface Question {
  id: number;
  icon: React.ElementType;
  text: string;
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    icon: Clock,
    text: "How long does it typically take you to fall asleep?",
    options: [
      { label: "Less than 15 minutes", value: 25 },
      { label: "15–30 minutes", value: 15 },
      { label: "30–60 minutes", value: 8 },
      { label: "Over 1 hour", value: 0 },
    ],
  },
  {
    id: 2,
    icon: Moon,
    text: "How many times do you wake up during the night?",
    options: [
      { label: "Never or rarely", value: 25 },
      { label: "Once", value: 18 },
      { label: "2–3 times", value: 8 },
      { label: "4+ times", value: 0 },
    ],
  },
  {
    id: 3,
    icon: Brain,
    text: "How often do you experience racing thoughts at bedtime?",
    options: [
      { label: "Almost never", value: 25 },
      { label: "A few times a week", value: 15 },
      { label: "Most nights", value: 5 },
      { label: "Every single night", value: 0 },
    ],
  },
  {
    id: 4,
    icon: Zap,
    text: "How do you feel when you wake up in the morning?",
    options: [
      { label: "Refreshed and energized", value: 25 },
      { label: "Okay, but could be better", value: 15 },
      { label: "Groggy and tired", value: 5 },
      { label: "Exhausted — like I never slept", value: 0 },
    ],
  },
  {
    id: 5,
    icon: Clock,
    text: "How long have you been struggling with sleep?",
    options: [
      { label: "Less than a month", value: 25 },
      { label: "1–6 months", value: 18 },
      { label: "6 months – 2 years", value: 8 },
      { label: "More than 2 years", value: 0 },
    ],
  },
];

type QuizState = "intro" | "questions" | "email" | "results";

interface ScoreResult {
  label: string;
  color: string;
  icon: React.ElementType;
  headline: string;
  description: string;
  urgency: string;
}

function getScoreResult(score: number): ScoreResult {
  if (score >= 80) {
    return {
      label: "Mild Sleep Disruption",
      color: "text-yellow-400",
      icon: AlertTriangle,
      headline: "You're close — but not quite there yet.",
      description: "Your sleep is mostly functional, but there are clear patterns holding you back from truly restorative rest. A few targeted adjustments could make a significant difference.",
      urgency: "The good news: mild cases respond fastest to the CBT-I protocol.",
    };
  } else if (score >= 50) {
    return {
      label: "Moderate Insomnia",
      color: "text-orange-400",
      icon: AlertTriangle,
      headline: "Your sleep is significantly impaired.",
      description: "You're losing 1–2 hours of quality sleep every night. Over time, this compounds into serious cognitive and health consequences. This is exactly the pattern the 7-Night Reset was designed to fix.",
      urgency: "Moderate insomnia is highly treatable with CBT-I — most people see results within 3 nights.",
    };
  } else {
    return {
      label: "Severe Insomnia",
      color: "text-red-400",
      icon: XCircle,
      headline: "Your sleep is in crisis mode.",
      description: "Your score indicates chronic, severe insomnia. You're likely running on empty — affecting your mood, focus, relationships, and health. The longer this continues, the harder it becomes to break the cycle.",
      urgency: "Severe insomnia requires a structured protocol, not tips. CBT-I is the #1 clinically-proven treatment.",
    };
  }
}

export default function SleepScoreQuiz() {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const captureLead = trpc.leads.capture.useMutation();

  const totalScore = answers.reduce((sum, v) => sum + v, 0);
  const result = getScoreResult(totalScore);
  const ResultIcon = result.icon;

  const handleAnswer = useCallback((value: number) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All questions answered — go to email capture
      trackEvent("QuizCompleted", { score: newAnswers.reduce((s, v) => s + v, 0) });
      setState("email");
    }
  }, [answers, currentQ]);

  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setIsSubmitting(true);

    try {
      await captureLead.mutateAsync({
        email,
        source: "sleep-quiz",
        abVariant: `score-${totalScore}`,
      });
      trackEvent("Lead", { source: "sleep_quiz", score: totalScore });
    } catch (_) {
      // Non-blocking — proceed even if capture fails
    }

    setIsSubmitting(false);
    setState("results");
  }, [email, totalScore, answers, captureLead]);

  const progress = state === "questions" ? ((currentQ) / QUESTIONS.length) * 100 : 0;
  const question = QUESTIONS[currentQ];
  const QuestionIcon = question?.icon;

  return (
    <section className="py-16 lg:py-20 relative">
      <div className="max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">

          {/* ===== INTRO ===== */}
          {state === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-2 mb-6">
                <Moon className="w-4 h-4 text-amber" />
                <span className="text-amber text-sm font-medium">Free Sleep Assessment</span>
              </div>
              <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
                What's Your <span className="text-amber">Sleep Score?</span>
              </h2>
              <p className="text-foreground/60 text-lg mb-8 leading-relaxed">
                Answer 5 quick questions and discover the severity of your sleep problem — plus a personalized recommendation.
              </p>
              <div className="flex items-center justify-center gap-6 mb-8 text-sm text-foreground/40">
                <span>⏱ Takes 60 seconds</span>
                <span>•</span>
                <span>🔒 100% private</span>
                <span>•</span>
                <span>✓ Free results</span>
              </div>
              <button
                onClick={() => { setState("questions"); trackEvent("QuizStarted", {}); }}
                className="inline-flex items-center gap-3 bg-amber text-background font-semibold px-8 py-4 rounded-lg text-lg hover:bg-amber/90 transition-all duration-300 hover:scale-105"
              >
                Discover My Sleep Score
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {/* ===== QUESTIONS ===== */}
          {state === "questions" && question && (
            <motion.div
              key={`question-${currentQ}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between text-xs text-foreground/40 mb-2">
                  <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
                <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber rounded-full"
                    initial={{ width: `${(currentQ / QUESTIONS.length) * 100}%` }}
                    animate={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="bg-card/30 border border-border/20 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                    <QuestionIcon className="w-5 h-5 text-amber" />
                  </div>
                  <h3 className="font-[var(--font-display)] text-xl font-semibold text-foreground/90">
                    {question.text}
                  </h3>
                </div>
                <div className="space-y-3">
                  {question.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt.value)}
                      className="w-full text-left px-5 py-4 rounded-xl border border-border/20 bg-background/30 hover:border-amber/40 hover:bg-amber/5 transition-all duration-200 text-foreground/80 hover:text-foreground group"
                    >
                      <span className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full border border-border/30 group-hover:border-amber/50 flex items-center justify-center text-xs text-foreground/40 group-hover:text-amber/70 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== EMAIL CAPTURE ===== */}
          {state === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="bg-card/40 border border-amber/20 rounded-2xl p-8 sm:p-10">
                <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-amber" />
                </div>
                <h3 className="font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-3">
                  Your results are ready!
                </h3>
                <p className="text-foreground/60 mb-8">
                  Enter your email to see your personalized Sleep Score and recommendations.
                </p>
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border/30 rounded-xl text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-amber/50 transition-colors"
                      required
                    />
                  </div>
                  {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber text-background font-semibold py-4 rounded-xl text-lg hover:bg-amber/90 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="animate-spin w-5 h-5 border-2 border-background/30 border-t-background rounded-full" />
                    ) : (
                      <>Reveal My Sleep Score <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>
                  <p className="text-foreground/30 text-xs">No spam. Unsubscribe anytime.</p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ===== RESULTS ===== */}
          {state === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-card/40 border border-border/20 rounded-2xl p-8 sm:p-10">
                {/* Score display */}
                <div className="text-center mb-8">
                  <p className="text-foreground/40 text-sm uppercase tracking-widest mb-3">Your Sleep Score</p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
                      <motion.circle
                        cx="60" cy="60" r="50"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeLinecap="round"
                        className="text-amber"
                        strokeDasharray={`${2 * Math.PI * 50}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - totalScore / 100) }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="font-[var(--font-display)] text-3xl font-bold text-amber">{totalScore}</span>
                      <span className="text-foreground/40 text-xs block">/100</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center gap-2 mt-3 ${result.color}`}>
                    <ResultIcon className="w-5 h-5" />
                    <span className="font-semibold">{result.label}</span>
                  </div>
                </div>

                {/* Personalized analysis */}
                <div className="space-y-4 mb-8">
                  <h3 className="font-[var(--font-display)] text-xl font-bold text-foreground/90">
                    {result.headline}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed">{result.description}</p>
                  <div className="flex items-start gap-3 bg-amber/5 border border-amber/15 rounded-xl p-4">
                    <Zap className="w-5 h-5 text-amber shrink-0 mt-0.5" />
                    <p className="text-foreground/70 text-sm leading-relaxed">{result.urgency}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <p className="text-foreground/50 text-sm mb-4">
                    The 7-Night Deep Sleep Reset uses the exact CBT-I protocol recommended for your score.
                  </p>
                  <button
                    onClick={() => {
                      trackEvent("QuizCTAClick", { score: totalScore, label: result.label });
                      openCheckout("frontEnd");
                    }}
                    className="w-full bg-amber text-background font-semibold py-4 rounded-xl text-lg hover:bg-amber/90 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    Start My 7-Night Reset — $5
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-foreground/30 text-xs mt-3">30-day money-back guarantee. Instant access.</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
