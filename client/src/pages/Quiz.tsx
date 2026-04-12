import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// ─── Neuro-marketing: Questions use curiosity + self-discovery framing ────────
const QUESTIONS = [
  {
    id: 1,
    question: "Without an alarm, when do you naturally feel sleepy?",
    subtext: "Think about weekends or vacation — your body's natural rhythm.",
    options: [
      { label: "Before 10pm — I'm done early", value: "lion" },
      { label: "Around 11pm — pretty standard", value: "bear" },
      { label: "After midnight — I get a second wind", value: "wolf" },
      { label: "It varies — I never know", value: "dolphin" },
    ],
  },
  {
    id: 2,
    question: "How do you feel the first hour after waking up?",
    subtext: "Be honest — this is one of the strongest chronotype signals.",
    options: [
      { label: "Alert and ready — mornings are my best time", value: "lion" },
      { label: "Need 20-30 minutes to get going", value: "bear" },
      { label: "Like a zombie — mornings are brutal", value: "wolf" },
      { label: "Tired even after 8 hours — something feels off", value: "dolphin" },
    ],
  },
  {
    id: 3,
    question: "When is your mental performance at its peak?",
    subtext: "When do you do your best thinking, writing, or problem-solving?",
    options: [
      { label: "Early morning (6am–10am)", value: "lion" },
      { label: "Mid-morning (9am–12pm)", value: "bear" },
      { label: "Evening (6pm–10pm)", value: "wolf" },
      { label: "Unpredictably — it changes day to day", value: "dolphin" },
    ],
  },
  {
    id: 4,
    question: "How would you describe your sleep quality?",
    subtext: "Not how long you sleep — but how deeply.",
    options: [
      { label: "Deep and solid — almost nothing wakes me", value: "lion" },
      { label: "Generally good, occasional wake-ups", value: "bear" },
      { label: "Hard to fall asleep, but once I'm out, I'm out", value: "wolf" },
      { label: "Light — I wake from any sound or thought", value: "dolphin" },
    ],
  },
  {
    id: 5,
    question: "Sunday night before a work week — how do you feel?",
    subtext: "This reveals your relationship with your sleep schedule.",
    options: [
      { label: "Fine — I'll be up early and ready", value: "lion" },
      { label: "Slightly anxious but manageable", value: "bear" },
      { label: "Energized — I don't want to sleep yet", value: "wolf" },
      { label: "Anxious — I'm already worried I won't sleep", value: "dolphin" },
    ],
  },
];

// ─── Behavioral: Progress labels create completion drive ──────────────────────
const PROGRESS_LABELS = [
  "Just starting...",
  "Getting warmer...",
  "More than halfway!",
  "Almost there...",
  "Final question!",
];

type ChronotypeCounts = { lion: number; bear: number; wolf: number; dolphin: number };

function calculateResult(answers: string[]): string {
  const counts: ChronotypeCounts = { lion: 0, bear: 0, wolf: 0, dolphin: 0 };
  answers.forEach((a) => {
    if (a in counts) counts[a as keyof ChronotypeCounts]++;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [animating, setAnimating] = useState(false);
  const [startTime] = useState(() => Date.now());

  const progress = (currentQ / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQ];

  // Track quiz start
  useEffect(() => {
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "quiz_start", page: "quiz", ts: Date.now() }),
    }).catch(() => {});
  }, []);

  const handleSelect = (value: string) => {
    if (animating) return;
    setSelected(value);
    // Track answer selection
    fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "quiz_answer", page: "quiz", question: currentQ + 1, answer: value, ts: Date.now() }),
    }).catch(() => {});
  };

  const handleNext = () => {
    if (!selected || animating) return;
    setAnimating(true);
    const newAnswers = [...answers, selected];

    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setSelected(null);
        setAnimating(false);
      } else {
        const result = calculateResult(newAnswers);
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        sessionStorage.setItem("dsr_quiz_result", result);
        sessionStorage.setItem("dsr_quiz_answers", JSON.stringify(newAnswers));

        // Save to backend + track completion
        fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result, answers: newAnswers }),
        }).catch(() => {});

        fetch("/api/behavior/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "quiz_complete", page: "quiz", result, timeSpent, ts: Date.now() }),
        }).catch(() => {});

        setLocation("/result");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-1">🧠</div>
          <p className="text-sm text-[oklch(0.6_0.04_265)]">
            Question {currentQ + 1} of {QUESTIONS.length}
          </p>
          {/* Progress label — completion effect */}
          <p className="text-xs text-[oklch(0.65_0.22_280)] font-medium mt-1">
            {PROGRESS_LABELS[currentQ]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[oklch(0.18_0.03_265)] rounded-full mb-6 overflow-hidden">
          <div
            className="quiz-progress-fill h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div
          className={`bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-6 md:p-8 transition-opacity duration-300 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-snug">
            {question.question}
          </h2>
          <p className="text-sm text-[oklch(0.55_0.04_265)] mb-6 italic">
            {question.subtext}
          </p>

          <div className="space-y-3">
            {question.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`quiz-option w-full text-left px-4 py-4 rounded-xl border text-sm md:text-base font-medium transition-all ${
                  selected === opt.value
                    ? "border-[oklch(0.65_0.22_280)] bg-[oklch(0.65_0.22_280/0.15)] text-white"
                    : "border-[oklch(0.22_0.03_265)] bg-[oklch(0.14_0.025_265)] text-[oklch(0.8_0.03_265)] hover:border-[oklch(0.65_0.22_280/0.5)] hover:bg-[oklch(0.65_0.22_280/0.07)]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      selected === opt.value
                        ? "border-[oklch(0.65_0.22_280)] bg-[oklch(0.65_0.22_280)]"
                        : "border-[oklch(0.35_0.04_265)]"
                    }`}
                  >
                    {selected === opt.value && (
                      <span className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </span>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-base transition-all ${
              selected
                ? "bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] cta-shimmer"
                : "bg-[oklch(0.18_0.03_265)] text-[oklch(0.4_0.03_265)] cursor-not-allowed"
            }`}
          >
            {currentQ < QUESTIONS.length - 1 ? "Next Question →" : "Reveal My Result →"}
          </button>
        </div>

        <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mt-4">
          🔒 Your answers are anonymous · No registration required
        </p>
      </div>
    </div>
  );
}
