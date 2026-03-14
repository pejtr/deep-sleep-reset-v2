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

import { useState, useCallback, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Brain, Clock, Zap, ArrowRight, Mail, CheckCircle, AlertTriangle, XCircle, Share2, Copy, Check, TrendingUp } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { openCheckout } from "@/lib/checkout";
import { trpc } from "@/lib/trpc";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

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

// ─── Social Share Buttons ────────────────────────────────────────────────────
function SocialShareButtons({ score, label }: { score: number; label: string }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://deepsleepreset.com";
  const shareText = `I just took the Deep Sleep Assessment and scored ${score}/100 (${label}). Turns out there's a 7-night science protocol that can fix it for $5. Curious? 👇`;

  const shareTwitter = () => {
    trackEvent("QuizShare", { platform: "twitter", score });
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank", "noopener");
  };

  const shareFacebook = () => {
    trackEvent("QuizShare", { platform: "facebook", score });
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, "_blank", "noopener");
  };

  const shareWhatsApp = () => {
    trackEvent("QuizShare", { platform: "whatsapp", score });
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`, "_blank", "noopener");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      trackEvent("QuizShare", { platform: "copy", score });
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      // fallback: do nothing
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-foreground/40" />
        <p className="text-foreground/40 text-xs uppercase tracking-widest">Share your result</p>
      </div>
      <div className="flex gap-2 flex-wrap">
        {/* Twitter / X */}
        <button
          onClick={shareTwitter}
          className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#1d9bf0]/15 border border-[#1d9bf0]/20 hover:border-[#1d9bf0]/40 text-[#1d9bf0]/80 hover:text-[#1d9bf0] text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
          aria-label="Share on X / Twitter"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          X / Twitter
        </button>

        {/* Facebook */}
        <button
          onClick={shareFacebook}
          className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#1877f2]/15 border border-[#1877f2]/20 hover:border-[#1877f2]/40 text-[#1877f2]/80 hover:text-[#1877f2] text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
          aria-label="Share on Facebook"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Facebook
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#25d366]/15 border border-[#25d366]/20 hover:border-[#25d366]/40 text-[#25d366]/80 hover:text-[#25d366] text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </button>

        {/* Copy link */}
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-foreground/5 border border-border/20 hover:border-border/40 text-foreground/50 hover:text-foreground/80 text-xs font-medium px-3 py-2 rounded-lg transition-all duration-200"
          aria-label="Copy link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

// ─── Score Trend Chart ───────────────────────────────────────────────────────
function ScoreTrendChart({ sessionId, currentScore, currentLabel }: { sessionId: string; currentScore: number; currentLabel: string }) {
  const historyQ = trpc.quiz.getHistory.useQuery({ sessionId }, { staleTime: 0 });
  const history = historyQ.data ?? [];
  const updateNote = trpc.quiz.updateNote.useMutation({
    onSuccess: () => historyQ.refetch(),
  });

  // Note editor state: which attempt id is being edited
  const [editingId, setEditingId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  if (history.length < 2) return null;

  const chartData = history.map((h, i) => ({
    attempt: `#${i + 1}`,
    score: h.score,
    label: h.label,
    id: h.id,
    note: h.note,
    date: new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  const firstScore = history[0].score;
  const latestScore = history[history.length - 1].score;
  const delta = latestScore - firstScore;
  const improving = delta > 0;

  const startEdit = (id: number, existing: string | null) => {
    setEditingId(id);
    setNoteText(existing ?? "");
  };

  const saveNote = (id: number) => {
    updateNote.mutate({ id, sessionId, note: noteText.trim() });
    setEditingId(null);
  };

  return (
    <div className="mb-8 bg-background/30 border border-border/20 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${improving ? 'text-green-400' : 'text-foreground/40'}`} />
          <span className="text-sm font-medium text-foreground/70">Your Sleep Score Trend</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          improving ? 'bg-green-400/10 text-green-400' : delta === 0 ? 'bg-foreground/5 text-foreground/40' : 'bg-red-400/10 text-red-400'
        }`}>
          {improving ? `+${delta}` : delta === 0 ? '±0' : `${delta}`} pts
        </span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
          <XAxis dataKey="attempt" tick={{ fontSize: 11, fill: 'oklch(1 0 0 / 0.35)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'oklch(1 0 0 / 0.35)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'oklch(0.14 0.02 260)', border: '1px solid oklch(1 0 0 / 0.1)', borderRadius: '8px', fontSize: 12 }}
            formatter={(value: number, _name: string, entry: { payload?: { label?: string; note?: string | null } }) => [
              <span key="v" style={{ color: 'oklch(0.78 0.13 65)' }}>
                {value}/100{entry.payload?.label ? ` — ${entry.payload.label}` : ''}
                {entry.payload?.note ? <><br /><span style={{ color: 'oklch(1 0 0 / 0.45)', fontStyle: 'italic' }}>📝 {entry.payload.note}</span></> : null}
              </span>,
              'Score'
            ]}
            labelFormatter={(label) => `Attempt ${label}`}
          />
          <ReferenceLine y={50} stroke="oklch(1 0 0 / 0.1)" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="score"
            stroke="oklch(0.78 0.13 65)"
            strokeWidth={2}
            dot={{ fill: 'oklch(0.78 0.13 65)', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: 'oklch(0.78 0.13 65)' }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Per-attempt note list */}
      <div className="mt-4 space-y-2">
        {history.map((h, i) => (
          <div key={h.id} className="flex items-start gap-2 text-xs">
            <span className="text-foreground/30 shrink-0 w-6 text-right">#{i + 1}</span>
            <span className="text-amber/60 shrink-0 font-semibold w-8">{h.score}</span>
            <span className="text-foreground/30 shrink-0">{new Date(h.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            {editingId === h.id ? (
              <div className="flex-1 flex gap-1.5">
                <input
                  autoFocus
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveNote(h.id); if (e.key === 'Escape') setEditingId(null); }}
                  maxLength={280}
                  placeholder="How did you feel this night?"
                  className="flex-1 bg-foreground/5 border border-amber/20 rounded px-2 py-0.5 text-foreground/80 placeholder:text-foreground/20 outline-none focus:border-amber/40 text-xs"
                />
                <button onClick={() => saveNote(h.id)} className="text-amber/70 hover:text-amber text-xs px-1.5 py-0.5 rounded bg-amber/10 hover:bg-amber/20 transition-colors">Save</button>
                <button onClick={() => setEditingId(null)} className="text-foreground/30 hover:text-foreground/60 text-xs">✕</button>
              </div>
            ) : (
              <button
                onClick={() => startEdit(h.id, h.note ?? null)}
                className="flex-1 text-left text-foreground/30 hover:text-foreground/60 italic truncate transition-colors"
              >
                {h.note ? `📝 ${h.note}` : '+ add note'}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-foreground/30 text-xs mt-3 text-center">
        {history.length} attempt{history.length !== 1 ? 's' : ''} recorded · {improving ? '🎉 You are improving!' : 'Keep going — the protocol works in 7 nights.'}
      </p>
    </div>
  );
}

export default function SleepScoreQuiz() {
  const [state, setState] = useState<QuizState>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stable session ID for quiz history tracking
  const sessionId = useMemo(() => {
    if (typeof window === 'undefined') return 'ssr';
    const key = 'dsr_quiz_session';
    let id = localStorage.getItem(key);
    if (!id) {
      id = `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(key, id);
    }
    return id;
  }, []);

  const captureLead = trpc.leads.capture.useMutation();
  const saveAttempt = trpc.quiz.saveAttempt.useMutation();

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

    // Save quiz attempt for score trend history
    try {
      const label = getScoreResult(totalScore).label;
      await saveAttempt.mutateAsync({ sessionId, score: totalScore, label, email });
    } catch (_) {
      // Non-blocking
    }

    setIsSubmitting(false);
    setState("results");
  }, [email, totalScore, answers, captureLead, saveAttempt, sessionId]);

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

                {/* Score Trend Chart — shows if user has taken the quiz before */}
                <ScoreTrendChart sessionId={sessionId} currentScore={totalScore} currentLabel={result.label} />

                {/* Social Sharing */}
                <SocialShareButtons score={totalScore} label={result.label} />

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
                    Change My Sleep — $5
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-foreground/30 text-xs mt-3">Less than one coffee · 30-day guarantee · Instant access.</p>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </section>
  );
}
