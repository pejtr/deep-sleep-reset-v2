/**
 * Sleep Chronotype Quiz
 * 8-question science-based quiz that identifies the user's sleep chronotype
 * (Lion / Bear / Wolf / Dolphin) and generates an AI-powered personalised sleep plan.
 *
 * Free for everyone — drives lead capture and product awareness.
 * Accessible at /chronotype-quiz
 */
import { useState, useId } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Zap, Wind, ChevronRight, ChevronLeft, Loader2, Share2, FileText } from "lucide-react";
import { Link } from "wouter";
import { openCheckout } from "@/lib/checkout";

// ─── Quiz Questions ────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "q1",
    text: "Without an alarm, when would you naturally wake up?",
    options: [
      { label: "Before 6 AM — I'm up before the sun", value: 3 },
      { label: "6–7:30 AM — Right at sunrise", value: 2 },
      { label: "7:30–9 AM — Mid-morning", value: 1 },
      { label: "After 9 AM — I'm a late riser", value: 0 },
    ],
  },
  {
    id: "q2",
    text: "When do you feel most mentally sharp and productive?",
    options: [
      { label: "Early morning (6–9 AM)", value: 3 },
      { label: "Late morning (9 AM–12 PM)", value: 3 },
      { label: "Afternoon (2–5 PM)", value: 1 },
      { label: "Evening or night (6 PM+)", value: 0 },
    ],
  },
  {
    id: "q3",
    text: "If you had no obligations, when would you go to sleep?",
    options: [
      { label: "Before 10 PM — I'm tired early", value: 3 },
      { label: "10 PM–midnight — Normal schedule", value: 2 },
      { label: "Midnight–2 AM — Night owl", value: 1 },
      { label: "After 2 AM — I come alive at night", value: 0 },
    ],
  },
  {
    id: "q4",
    text: "How would you describe your sleep quality on most nights?",
    options: [
      { label: "Deep and restful — I sleep like a rock", value: 0 },
      { label: "Generally good with occasional disturbances", value: 1 },
      { label: "Light — I wake up easily", value: 2 },
      { label: "Fragmented — I rarely feel fully rested", value: 3 },
    ],
  },
  {
    id: "q5",
    text: "How do you feel in the first 30 minutes after waking?",
    options: [
      { label: "Alert and ready to go immediately", value: 3 },
      { label: "Takes about 15 minutes to get going", value: 2 },
      { label: "Groggy for at least an hour", value: 1 },
      { label: "Barely functional — mornings are my enemy", value: 0 },
    ],
  },
  {
    id: "q6",
    text: "When do your best creative ideas tend to come?",
    options: [
      { label: "First thing in the morning", value: 0 },
      { label: "Mid-morning after coffee", value: 1 },
      { label: "Late afternoon", value: 2 },
      { label: "Late at night when everything is quiet", value: 3 },
    ],
  },
  {
    id: "q7",
    text: "When do you feel most socially energised?",
    options: [
      { label: "Morning — I love early meetings", value: 1 },
      { label: "Midday — lunch meetings are perfect", value: 3 },
      { label: "Afternoon — post-lunch energy", value: 2 },
      { label: "Evening — I open up after dark", value: 0 },
    ],
  },
  {
    id: "q8",
    text: "How often do you lie awake with racing thoughts?",
    options: [
      { label: "Rarely — my mind quiets quickly", value: 0 },
      { label: "Occasionally — maybe once a week", value: 1 },
      { label: "Often — a few times a week", value: 2 },
      { label: "Almost every night — my mind won't stop", value: 3 },
    ],
  },
];

// ─── Chronotype Metadata ───────────────────────────────────────────────────────
const CHRONOTYPE_META: Record<string, {
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  celebrities: string[];
}> = {
  lion: {
    emoji: "🦁",
    name: "The Lion",
    tagline: "Early Riser — Natural Leader",
    description: "You're a natural early bird with disciplined habits and high morning energy. You make decisions quickly, lead with confidence, and your body clock is perfectly aligned with society's schedule. Your challenge: protecting your evening wind-down.",
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
    borderColor: "border-amber-400/30",
    celebrities: ["Tim Cook", "Oprah Winfrey", "Michelle Obama"],
  },
  bear: {
    emoji: "🐻",
    name: "The Bear",
    tagline: "Solar Sleeper — Social Powerhouse",
    description: "You follow the sun's rhythm — the most common chronotype (50% of people). You're social, consistent, and hit your peak between 10 AM and 2 PM. You're the glue of any team. Your challenge: the post-lunch energy dip.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    celebrities: ["Barack Obama", "Ellen DeGeneres", "Bill Gates"],
  },
  wolf: {
    emoji: "🐺",
    name: "The Wolf",
    tagline: "Night Owl — Creative Visionary",
    description: "You come alive after dark. Your creativity peaks in the evening, you think in systems, and you're often misunderstood by the 9-5 world. Your challenge: fighting a society built for Lions and Bears.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    celebrities: ["Charles Darwin", "Marcel Proust", "Winston Churchill"],
  },
  dolphin: {
    emoji: "🐬",
    name: "The Dolphin",
    tagline: "Light Sleeper — Analytical Mind",
    description: "You're the rarest chronotype — highly intelligent, detail-oriented, and prone to anxiety-driven insomnia. You sleep lightly, wake easily, and your mind rarely fully switches off. Your challenge: breaking the anxiety-insomnia cycle.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    celebrities: ["Nikola Tesla", "Charles Dickens", "Leonardo da Vinci"],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChronotypeQuiz() {
  const uid = useId();
  const sessionId = `quiz-${uid}-${Date.now()}`;

  const [step, setStep] = useState<"intro" | "quiz" | "email" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; value: number }[]>([]);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const submitMutation = trpc.chronotype.submit.useMutation();

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers.filter(a => a.questionId !== QUESTIONS[currentQ].id), {
      questionId: QUESTIONS[currentQ].id,
      value,
    }];
    setAnswers(newAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All questions answered — go to email capture
      setStep("email");
    }
  };

  const handleSubmit = async (skipEmail = false) => {
    const emailToSend = skipEmail ? undefined : (email.trim() || undefined);
    if (!skipEmail && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setStep("result");
    submitMutation.mutate({
      sessionId,
      email: emailToSend,
      answers,
    });
  };

  const result = submitMutation.data;
  const meta = result ? CHRONOTYPE_META[result.chronotype] : null;
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  // ─── Intro ──────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border/20 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-amber-400 font-semibold">
              <Moon className="w-5 h-5" />
              Deep Sleep Reset
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {/* Hero */}
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-1.5 text-amber-400 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" />
            Free 2-minute quiz
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
            What's Your{" "}
            <span className="text-amber-400">Sleep Chronotype?</span>
          </h1>

          <p className="text-foreground/60 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Discover whether you're a Lion, Bear, Wolf, or Dolphin — and get a free AI-generated personalised sleep plan built for your biology.
          </p>

          {/* Chronotype preview cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
            {Object.entries(CHRONOTYPE_META).map(([key, m]) => (
              <div key={key} className={`${m.bgColor} ${m.borderColor} border rounded-xl p-4 text-center`}>
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className={`font-semibold text-sm ${m.color}`}>{m.name}</div>
                <div className="text-foreground/40 text-xs mt-1">{m.tagline.split(" — ")[0]}</div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => setStep("quiz")}
            className="bg-amber-400 hover:bg-amber-500 text-background font-bold px-10 py-4 text-lg rounded-xl"
          >
            Discover My Chronotype
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-foreground/30 text-xs mt-4">8 questions · Takes 2 minutes · 100% free</p>
        </div>
      </div>
    );
  }

  // ─── Quiz ───────────────────────────────────────────────────────────────────
  if (step === "quiz") {
    const q = QUESTIONS[currentQ];
    const currentAnswer = answers.find(a => a.questionId === q.id);

    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/20 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-amber-400 font-semibold">
              <Moon className="w-5 h-5" />
              Deep Sleep Reset
            </Link>
            <span className="text-foreground/40 text-sm">{currentQ + 1} / {QUESTIONS.length}</span>
          </div>
        </header>

        {/* Progress bar */}
        <div className="h-1 bg-border/20">
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-xl w-full">
            <p className="text-foreground/40 text-sm uppercase tracking-widest mb-4">
              Question {currentQ + 1} of {QUESTIONS.length}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 leading-snug">
              {q.text}
            </h2>

            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    currentAnswer?.value === opt.value
                      ? "border-amber-400 bg-amber-400/10 text-foreground"
                      : "border-border/30 bg-card/20 hover:border-amber-400/40 hover:bg-card/40 text-foreground/70"
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                </button>
              ))}
            </div>

            {currentQ > 0 && (
              <button
                onClick={() => setCurrentQ(currentQ - 1)}
                className="mt-6 flex items-center gap-1 text-foreground/40 hover:text-foreground/70 text-sm transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Email Capture ──────────────────────────────────────────────────────────
  if (step === "email") {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b border-border/20 px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <Link href="/" className="flex items-center gap-2 text-amber-400 font-semibold w-fit">
              <Moon className="w-5 h-5" />
              Deep Sleep Reset
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center">
            <div className="text-5xl mb-6">✨</div>
            <h2 className="text-3xl font-bold mb-4">
              Your Results Are Ready!
            </h2>
            <p className="text-foreground/60 mb-8 leading-relaxed">
              Enter your email to receive your personalised chronotype report and a free 7-day sleep optimisation plan — or skip to see your results now.
            </p>

            <div className="space-y-3 mb-6">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(""); }}
                className="w-full bg-card/30 border border-border/30 rounded-xl px-4 py-3 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-amber-400/50"
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
              />
              {emailError && <p className="text-red-400 text-sm">{emailError}</p>}
              <Button
                onClick={() => handleSubmit(false)}
                className="w-full bg-amber-400 hover:bg-amber-500 text-background font-bold py-3 rounded-xl"
              >
                Send Me My Report
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <button
              onClick={() => handleSubmit(true)}
              className="text-foreground/30 hover:text-foreground/60 text-sm underline transition-colors"
            >
              Skip — just show me my results
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Result ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/20 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-400 font-semibold">
            <Moon className="w-5 h-5" />
            Deep Sleep Reset
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {submitMutation.isPending && (
          <div className="text-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-foreground/60">Analysing your sleep biology...</p>
            <p className="text-foreground/30 text-sm mt-2">Our AI is crafting your personalised plan</p>
          </div>
        )}

        {submitMutation.isError && (
          <div className="text-center py-20">
            <p className="text-red-400">Something went wrong. Please try again.</p>
            <Button onClick={() => setStep("intro")} className="mt-4">Start Over</Button>
          </div>
        )}

        {result && meta && (
          <div className="space-y-8">
            {/* Chronotype reveal */}
            <div className={`${meta.bgColor} ${meta.borderColor} border rounded-2xl p-8 text-center`}>
              <div className="text-7xl mb-4">{meta.emoji}</div>
              <p className="text-foreground/50 text-sm uppercase tracking-widest mb-2">Your chronotype is</p>
              <h1 className={`text-4xl font-bold ${meta.color} mb-2`}>{meta.name}</h1>
              <p className="text-foreground/60 text-lg">{meta.tagline}</p>
            </div>

            {/* Sleep window */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 flex items-center justify-center shrink-0">
                <Moon className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-foreground/40 text-xs uppercase tracking-wider mb-1">Your Ideal Sleep Window</p>
                <p className="text-2xl font-bold text-amber-400">{result.sleepWindow}</p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20">
              <h3 className="font-semibold mb-4 text-foreground/70">Your Chronotype Scores</h3>
              <div className="space-y-3">
                {Object.entries(result.scores).map(([type, score]) => {
                  const m = CHRONOTYPE_META[type];
                  const maxScore = 6;
                  const pct = Math.min(100, Math.round((score / maxScore) * 100));
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${m.color}`}>{m.emoji} {m.name}</span>
                        <span className="text-foreground/40 text-xs">{score}/{maxScore}</span>
                      </div>
                      <div className="h-2 bg-border/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            type === result.chronotype ? "bg-amber-400" : "bg-foreground/20"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20">
              <h3 className="font-semibold mb-3">About Your Type</h3>
              <p className="text-foreground/70 leading-relaxed">{meta.description}</p>
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-foreground/40 text-xs uppercase tracking-wider mb-2">Famous {meta.name}s</p>
                <div className="flex flex-wrap gap-2">
                  {meta.celebrities.map(c => (
                    <span key={c} className={`text-xs ${meta.bgColor} ${meta.color} px-2 py-1 rounded-full border ${meta.borderColor}`}>{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI-generated personalised plan */}
            {result.personalPlan && (
              <div className="border border-amber-400/20 rounded-xl p-6 bg-amber-400/5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="font-semibold text-amber-400">Your Personalised 7-Night Sleep Plan</h3>
                </div>
                <div className="prose prose-invert prose-sm max-w-none text-foreground/80">
                  <Streamdown>{result.personalPlan}</Streamdown>
                </div>
              </div>
            )}

            {/* Chronotype Report Upsell — $9 */}
            <div className="border-2 border-amber-400/50 rounded-2xl p-8 bg-gradient-to-br from-amber-400/10 to-amber-600/5 text-center relative overflow-hidden">
              <div className="absolute top-3 right-3 bg-amber-400 text-background text-xs font-bold px-3 py-1 rounded-full">
                SPECIAL OFFER
              </div>
              <FileText className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">
                Get Your Full {meta?.name} Blueprint — <span className="text-amber-400">$9</span>
              </h3>
              <p className="text-foreground/60 mb-2 text-sm leading-relaxed">
                Your free results show <em>what</em> you are. The full report tells you <em>exactly what to do</em>:
              </p>
              <ul className="text-left text-sm text-foreground/70 mb-6 space-y-1 max-w-xs mx-auto">
                <li>✓ Optimal sleep &amp; wake times for your chronotype</li>
                <li>✓ Ideal morning routine (minute-by-minute)</li>
                <li>✓ Peak performance &amp; focus windows</li>
                <li>✓ Foods &amp; supplements that match your biology</li>
                <li>✓ 7-day implementation calendar</li>
              </ul>
              <Button
                onClick={() => {
                  openCheckout("chronotypeReport");
                }}
                className="bg-amber-400 hover:bg-amber-500 text-background font-bold px-8 py-4 text-lg rounded-xl w-full mb-3"
              >
                Get My Full {meta?.name} Report — $9
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-foreground/30 text-xs">Instant PDF download · 30-day money-back guarantee</p>
            </div>

            {/* CTA — main product */}
            <div className="border border-foreground/10 rounded-2xl p-6 bg-foreground/5 text-center">
              <h3 className="text-lg font-semibold mb-2">
                Or start with the 7-Night Protocol
              </h3>
              <p className="text-foreground/50 mb-4 text-sm leading-relaxed">
                Specifically designed for <strong className="text-foreground/70">{meta?.name}s</strong> — techniques that work with your natural biology.
              </p>
              <Link href="/order">
                <Button variant="outline" className="border-amber-400/30 text-amber-400 hover:bg-amber-400/10 px-6 py-3">
                  Get The Deep Sleep Reset — $17
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Share */}
            <div className="text-center">
              <p className="text-foreground/40 text-sm mb-3">Share your chronotype</p>
              <div className="flex justify-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just discovered I'm a ${meta.name} ${meta.emoji} sleep chronotype! Take the free quiz: https://deepsleepreset.manus.space/chronotype-quiz`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share on X
                </a>
                <button
                  onClick={() => setStep("intro")}
                  className="inline-flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 text-foreground/50 border border-border/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
