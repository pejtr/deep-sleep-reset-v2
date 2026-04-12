import { useState } from "react";
import { useLocation } from "wouter";

const QUESTIONS = [
  {
    id: 1,
    question: "Kdy se přirozeně cítíš nejospalejší — bez budíku?",
    options: [
      { label: "Před 22:00", value: "lion" },
      { label: "Kolem 23:00", value: "bear" },
      { label: "Po půlnoci", value: "wolf" },
      { label: "Různě, nikdy nevím", value: "dolphin" },
    ],
  },
  {
    id: 2,
    question: "Jak se cítíš první hodinu po probuzení?",
    options: [
      { label: "Hned fit a plný energie", value: "lion" },
      { label: "Potřebuji 20–30 minut na rozjezd", value: "bear" },
      { label: "Jako zombie, nefunguji", value: "wolf" },
      { label: "Unavený i po 8 hodinách", value: "dolphin" },
    ],
  },
  {
    id: 3,
    question: "Kdy máš nejvyšší mentální výkon?",
    options: [
      { label: "Ráno (6–10 hod)", value: "lion" },
      { label: "Dopoledne (9–12 hod)", value: "bear" },
      { label: "Večer (18–22 hod)", value: "wolf" },
      { label: "Nepravidelně, záleží na dni", value: "dolphin" },
    ],
  },
  {
    id: 4,
    question: "Jak spíš?",
    options: [
      { label: "Hluboce, skoro nic mě neprobudí", value: "lion" },
      { label: "Dobře, občas se probudím", value: "bear" },
      { label: "Těžko usínám, ale pak spím", value: "wolf" },
      { label: "Lehce, budím se z každého zvuku", value: "dolphin" },
    ],
  },
  {
    id: 5,
    question: "Jak se cítíš v neděli večer před pracovním týdnem?",
    options: [
      { label: "V pohodě, ráno vstanu bez problémů", value: "lion" },
      { label: "Trochu nervózní, ale ok", value: "bear" },
      { label: "Nechce se mi spát, jsem plný energie", value: "wolf" },
      { label: "Úzkostný, bojím se, že neusnu", value: "dolphin" },
    ],
  },
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

  const progress = ((currentQ) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQ];

  const handleSelect = (value: string) => {
    if (animating) return;
    setSelected(value);
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
        // Calculate result
        const result = calculateResult(newAnswers);
        sessionStorage.setItem("dsr_quiz_result", result);
        sessionStorage.setItem("dsr_quiz_answers", JSON.stringify(newAnswers));

        // Save to backend
        fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result, answers: newAnswers }),
        }).catch(() => {});

        setLocation("/result");
      }
    }, 300);
  };

  return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl mb-2">🧠</div>
          <p className="text-sm text-[oklch(0.6_0.04_265)]">
            Otázka {currentQ + 1} z {QUESTIONS.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-[oklch(0.18_0.03_265)] rounded-full mb-8 overflow-hidden">
          <div
            className="quiz-progress-fill h-full rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question card */}
        <div
          className={`bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-6 md:p-8 transition-opacity duration-300 ${
            animating ? "opacity-0" : "opacity-100"
          }`}
        >
          <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug">
            {question.question}
          </h2>

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
            {currentQ < QUESTIONS.length - 1 ? "Další otázka →" : "Zobrazit výsledek →"}
          </button>
        </div>

        {/* Trust */}
        <p className="text-center text-xs text-[oklch(0.4_0.03_265)] mt-4">
          🔒 Tvoje odpovědi jsou anonymní · Bez registrace
        </p>
      </div>
    </div>
  );
}
