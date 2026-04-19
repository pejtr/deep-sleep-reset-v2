import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, MoonStar, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

type ChronotypeKey = "lion" | "bear" | "wolf" | "dolphin";

type Option = {
  label: string;
  value: string;
  score: Record<ChronotypeKey, number>;
};

type Question = {
  id: number;
  prompt: string;
  helper: string;
  options: Option[];
};

const questions: Question[] = [
  {
    id: 1,
    prompt: "When do you naturally feel most alert?",
    helper: "Choose the window that feels most true when you are not forcing your schedule.",
    options: [
      { label: "Early morning with clear energy", value: "early", score: { lion: 3, bear: 1, wolf: 0, dolphin: 1 } },
      { label: "Late morning into early afternoon", value: "midday", score: { lion: 1, bear: 3, wolf: 1, dolphin: 1 } },
      { label: "Evening when everyone else slows down", value: "evening", score: { lion: 0, bear: 1, wolf: 3, dolphin: 1 } },
      { label: "It changes because my sleep feels fragile", value: "fragile", score: { lion: 0, bear: 0, wolf: 1, dolphin: 3 } },
    ],
  },
  {
    id: 2,
    prompt: "What usually makes sleep hardest for you?",
    helper: "This helps shape the plan and Petra's tone later inside the premium area.",
    options: [
      { label: "I wake too early and cannot settle again", value: "earlywake", score: { lion: 2, bear: 1, wolf: 0, dolphin: 2 } },
      { label: "I stay up too late even when I am tired", value: "late", score: { lion: 0, bear: 1, wolf: 3, dolphin: 1 } },
      { label: "My rhythm is inconsistent from day to day", value: "inconsistent", score: { lion: 0, bear: 2, wolf: 1, dolphin: 2 } },
      { label: "My mind stays switched on at bedtime", value: "mind", score: { lion: 0, bear: 1, wolf: 1, dolphin: 3 } },
    ],
  },
  {
    id: 3,
    prompt: "How do mornings usually feel?",
    helper: "Your answer shapes the wake strategy in the personalized sleep reset.",
    options: [
      { label: "I wake quickly and prefer getting started", value: "fast", score: { lion: 3, bear: 1, wolf: 0, dolphin: 0 } },
      { label: "I am okay after a short warm-up", value: "steady", score: { lion: 1, bear: 3, wolf: 1, dolphin: 1 } },
      { label: "I feel slow and come alive later", value: "slow", score: { lion: 0, bear: 1, wolf: 3, dolphin: 0 } },
      { label: "I wake tired even after enough hours", value: "tired", score: { lion: 0, bear: 0, wolf: 1, dolphin: 3 } },
    ],
  },
  {
    id: 4,
    prompt: "What kind of support would help most right now?",
    helper: "This determines how DeepSleepReset should frame your next step after the quiz.",
    options: [
      { label: "A structured evening routine", value: "routine", score: { lion: 1, bear: 3, wolf: 1, dolphin: 1 } },
      { label: "Permission to stop forcing early nights", value: "permission", score: { lion: 0, bear: 1, wolf: 3, dolphin: 1 } },
      { label: "Help calming mental overactivity", value: "calm", score: { lion: 0, bear: 1, wolf: 1, dolphin: 3 } },
      { label: "A sharper schedule aligned to my biology", value: "biology", score: { lion: 3, bear: 2, wolf: 2, dolphin: 1 } },
    ],
  },
  {
    id: 5,
    prompt: "How soon do you want to feel a sleep shift?",
    helper: "The premium plan turns this urgency into a practical pace.",
    options: [
      { label: "Within the next few nights", value: "fast", score: { lion: 2, bear: 2, wolf: 2, dolphin: 1 } },
      { label: "Within one calmer consistent week", value: "week", score: { lion: 2, bear: 3, wolf: 2, dolphin: 1 } },
      { label: "I need a system I can actually sustain", value: "system", score: { lion: 1, bear: 2, wolf: 1, dolphin: 3 } },
      { label: "I want to understand my type first", value: "type", score: { lion: 2, bear: 1, wolf: 3, dolphin: 2 } },
    ],
  },
];

const resultContent: Record<ChronotypeKey, { title: string; summary: string; bedtime: string; angle: string; blocker: string; bridge: string; premiumOutcome: string }> = {
  lion: {
    title: "Lion",
    summary: "Your rhythm responds best to an earlier, decisive shutdown and strong morning light anchoring.",
    bedtime: "Ideal sleep window: 10:00 PM – 6:00 AM",
    angle: "You do better with clarity, commitment, and a clean evening cutoff than with endless experimentation.",
    blocker: "Your real blocker is rarely motivation. It is usually late-evening leakage, weak shutdown boundaries, or a plan that loses precision after sunset.",
    bridge: "Your next step is not more effort. It is a tighter evening sequence that protects your natural decisiveness and turns it into reliable sleep onset.",
    premiumOutcome: "Inside Premium, your Lion reset focuses on sharper shutdown timing, a cleaner wind-down, and a rhythm Petra can help you keep calm and consistent.",
  },
  bear: {
    title: "Bear",
    summary: "Your biology likes consistency, moderate stimulation, and a repeatable evening descent instead of hacks.",
    bedtime: "Ideal sleep window: 10:30 PM – 6:30 AM",
    angle: "Your fastest win will come from rhythm, not intensity — stable timing beats heroic effort.",
    blocker: "Your real blocker is usually inconsistency. Good nights happen, but the pattern breaks because your schedule is never anchored long enough to compound.",
    bridge: "Your next step is to convert this diagnosis into a repeatable evening cadence that makes sleep feel trustworthy instead of random.",
    premiumOutcome: "Inside Premium, your Bear reset turns this into an easy rhythm with steady timing, guided pacing, and supportive accountability from Petra.",
  },
  wolf: {
    title: "Wolf",
    summary: "Your energy tilts later, so recovery starts when your plan stops punishing you for a delayed rhythm.",
    bedtime: "Ideal sleep window: 12:00 AM – 8:00 AM",
    angle: "You need a biology-aligned reset that reduces friction instead of treating you like an early chronotype.",
    blocker: "Your real blocker is friction between your natural timing and the schedule you keep trying to obey. The harder you force it, the more resistance you feel.",
    bridge: "Your next step is to stop treating a later rhythm like a character flaw and build a plan that works with your delayed energy curve.",
    premiumOutcome: "Inside Premium, your Wolf reset reframes timing, lowers bedtime friction, and helps Petra guide you into a calmer later-window routine that actually holds.",
  },
  dolphin: {
    title: "Dolphin",
    summary: "Your sleep is more sensitive, so nervous-system calming and reduced bedtime pressure matter most.",
    bedtime: "Ideal sleep window: 11:30 PM – 6:30 AM",
    angle: "The most important shift is lowering internal pressure and giving your system a gentler descent into sleep.",
    blocker: "Your real blocker is often sleep pressure itself. The more you monitor, force, or evaluate the night, the more activated your system becomes.",
    bridge: "Your next step is to replace pressure with a softer descent so your nervous system can trust bedtime again.",
    premiumOutcome: "Inside Premium, your Dolphin reset emphasizes mental decompression, low-pressure structure, and Petra support designed to keep the process gentle.",
  },
};

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  background:
    "radial-gradient(circle at 16% 18%, rgba(76, 108, 255, 0.14), transparent 18%), radial-gradient(circle at 84% 76%, rgba(150, 92, 255, 0.18), transparent 22%), linear-gradient(180deg, #050711 0%, #09122b 56%, #140d24 100%)",
};

const shellStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 2,
  minHeight: "100vh",
  padding: "32px 16px 48px",
  display: "grid",
  placeItems: "center",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "980px",
  borderRadius: "36px",
  border: "1px solid rgba(255,255,255,0.09)",
  background: "linear-gradient(180deg, rgba(12,18,38,0.82) 0%, rgba(8,12,28,0.74) 100%)",
  boxShadow: "0 32px 120px rgba(0,0,0,0.4)",
  backdropFilter: "blur(18px)",
  padding: "32px",
};

const topMetaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const answersGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "16px",
  marginTop: "28px",
};

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Option>>({});
  const trackQuizCompletion = trpc.public.trackQuizCompletion.useMutation();

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;
  const selected = answers[currentQuestion.id];
  const isComplete = Object.keys(answers).length === questions.length;

  const result = useMemo(() => {
    if (!isComplete) return null;

    const totals: Record<ChronotypeKey, number> = {
      lion: 0,
      bear: 0,
      wolf: 0,
      dolphin: 0,
    };

    Object.values(answers).forEach((option) => {
      totals.lion += option.score.lion;
      totals.bear += option.score.bear;
      totals.wolf += option.score.wolf;
      totals.dolphin += option.score.dolphin;
    });

    const winner = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0] as ChronotypeKey;
    return resultContent[winner];
  }, [answers, isComplete]);

  useEffect(() => {
    if (!result || trackQuizCompletion.isSuccess) return;
    trackQuizCompletion.mutate({ chronotype: result.title });
  }, [result, trackQuizCompletion]);

  const chooseAnswer = (option: Option) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
  };

  const next = () => {
    if (!selected) return;
    if (step === questions.length - 1) return;
    setStep((prev) => prev + 1);
  };

  const back = () => {
    if (step === 0) {
      setLocation("/");
      return;
    }
    setStep((prev) => prev - 1);
  };

  if (result) {
    return (
      <div style={pageStyle}>
        <div style={shellStyle}>
          <div style={{ ...cardStyle, maxWidth: "920px" }}>
            <div style={topMetaStyle}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MoonStar className="h-4 w-4 text-[#f0b25b]" />
                <span className="text-xs font-semibold uppercase tracking-[0.34em] text-[#f0b25b]">Chronotype revealed</span>
              </div>
              <div className="rounded-full border border-white/10 px-4 py-2 text-sm text-[#ccd1e2]">DeepSleepReset result</div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#a7afc5]">Your natural sleep pattern</p>
              <h1 className="mt-5 font-display text-5xl text-white md:text-7xl">{result.title}</h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#d9deea] md:text-xl">{result.summary}</p>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#b8c0d7]">{result.angle}</p>
              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-[#f0b25b]">{result.bedtime}</p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#bfc5d8]">Your diagnosed blocker</p>
                <h2 className="mt-4 font-display text-3xl text-white md:text-4xl">This is where your sleep plan should begin</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#c9cfe0]">{result.blocker}</p>
                <p className="mt-4 max-w-2xl text-base leading-8 text-[#d8dced]">{result.bridge}</p>
              </div>
              <div className="rounded-[28px] border border-[#8d6bff]/28 bg-[linear-gradient(180deg,rgba(124,88,255,0.18),rgba(11,15,34,0.3))] p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f0b25b]">What Premium changes</p>
                <p className="mt-4 text-lg leading-8 text-white">{result.premiumOutcome}</p>
              </div>
            </div>

            <div className="mt-10" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
              <Button className="cosmic-cta rounded-2xl px-8 py-6 text-base text-white" onClick={() => setLocation("/members")}>
                Unlock My Personalized Reset
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="rounded-2xl border-white/15 bg-transparent px-8 py-6 text-base text-white hover:bg-white/5" onClick={() => setLocation("/")}>
                Back to landing page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={topMetaStyle}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <MoonStar className="h-4 w-4 text-[#f0b25b]" />
                <span className="text-xs font-semibold uppercase tracking-[0.34em] text-[#f0b25b]">DeepSleepReset chronotype quiz</span>
              </div>
              <h1 className="mt-5 font-display text-4xl text-white md:text-6xl">Reveal your chronotype in one calm minute</h1>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-[#d5d9e8]">
              {step + 1} / {questions.length}
            </div>
          </div>

          <div className="mt-6 max-w-3xl text-base leading-8 text-[#c9d0e1] md:text-lg">
            Five precise questions. One clearer diagnosis. A more personal sleep reset built around your biology instead of generic advice.
          </div>

          <div className="mt-8 rounded-full border border-white/8 bg-white/[0.03] p-2">
            <Progress value={progress} className="h-2 bg-transparent" />
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#9fa9c8]">Question {step + 1}</p>
              <h2 className="mt-5 font-display text-3xl leading-tight text-white md:text-5xl">{currentQuestion.prompt}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#c7ccdc] md:text-lg">{currentQuestion.helper}</p>
            </div>

            <div className="rounded-[28px] border border-[#8d6bff]/20 bg-[linear-gradient(180deg,rgba(122,86,255,0.18),rgba(9,12,27,0.22))] p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f0b25b]">Why this matters</p>
              <p className="mt-4 text-base leading-8 text-[#eef1f8]">
                Your answer helps the plan identify whether the real lever is timing, nervous-system calming, evening structure, or chronotype alignment.
              </p>
            </div>
          </div>

          <div style={answersGridStyle}>
            {currentQuestion.options.map((option, index) => {
              const active = selected?.value === option.value;
              return (
                <div
                  key={option.value}
                  role="button"
                  tabIndex={0}
                  onClick={() => chooseAnswer(option)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      chooseAnswer(option);
                    }
                  }}
                  className={`cursor-pointer rounded-[26px] border p-6 transition ${
                    active
                      ? "border-[#a777ff] bg-[linear-gradient(135deg,rgba(122,86,255,0.34),rgba(172,101,255,0.18))] text-white shadow-[0_18px_40px_rgba(122,86,255,0.22)]"
                      : "border-white/10 bg-white/[0.03] text-[#d8dced] hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-[#f0b25b]">Option {index + 1}</div>
                  <div className="mt-4 text-lg font-medium leading-8">{option.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10" style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>
            <Button variant="outline" className="rounded-2xl border-white/15 bg-transparent px-6 py-6 text-white hover:bg-white/5" onClick={back}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {step === 0 ? "Back to landing" : "Previous question"}
            </Button>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <span className="text-sm text-[#aeb6cc]">No credit card. No spam. Just your chronotype first.</span>
              <Button className="cosmic-cta rounded-2xl px-8 py-6 text-white" onClick={next} disabled={!selected}>
                {step === questions.length - 1 ? "See my result" : "Next question"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
