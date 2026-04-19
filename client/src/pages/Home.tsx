import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ChevronDown, MoonStar } from "lucide-react";
import { CSSProperties, useEffect } from "react";
import { useLocation } from "wouter";

const stats = [
  { value: "12,847", label: "sleep assessments completed" },
  { value: "4.9★", label: "average experience rating" },
  { value: "7 nights", label: "to feel the first shift" },
];

const problemCards = [
  {
    title: "You keep trying harder",
    body: "More discipline, more supplements, more forcing bedtime — yet your nervous system never really buys in.",
  },
  {
    title: "Your rhythm may be mismatched",
    body: "If your chronotype runs later or more fragile, generic sleep advice can make you feel broken instead of helped.",
  },
  {
    title: "The quiz finds the real lever",
    body: "Timing, overstimulation, inconsistent rhythm, or fragile sleep pressure — the point is to diagnose before prescribing.",
  },
];

const promisePoints = [
  "A chronotype-led diagnosis before any paid step",
  "A clearer path into your premium DeepSleepReset plan",
  "Progress tracking, premium lessons, and Petra after purchase",
];

const testimonials = [
  {
    quote: "For the first time, I felt like the plan understood my rhythm instead of fighting it.",
    author: "Marta, founder",
  },
  {
    quote: "The diagnosis immediately explained why generic early-night advice never worked for me.",
    author: "Jan, creative lead",
  },
  {
    quote: "Petra and the daily structure made the reset feel calm, not overwhelming.",
    author: "Lucie, consultant",
  },
];

const headerLayout: CSSProperties = {
  gap: "0.85rem",
  minHeight: "4.5rem",
  paddingLeft: "0.25rem",
  paddingRight: "0.25rem",
};

const brandRow: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.5rem",
};

const heroCenter: CSSProperties = {
  minHeight: "calc(100vh - 72px)",
  display: "grid",
  placeItems: "center",
  paddingTop: "1.5rem",
  paddingBottom: "4rem",
};

const heroStack: CSSProperties = {
  width: "100%",
  maxWidth: "76rem",
  margin: "0 auto",
  display: "grid",
  justifyItems: "center",
  gap: "1.25rem",
  textAlign: "center",
};

const statsLayout: CSSProperties = {
  width: "100%",
  maxWidth: "50rem",
  margin: "3rem auto 0",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "0.85rem",
  textAlign: "center",
};

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const trackLandingView = trpc.public.trackLandingView.useMutation();

  useEffect(() => {
    trackLandingView.mutate();
  }, []);

  const goToQuiz = () => {
    setLocation("/quiz");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/6 bg-[#040611]/84 backdrop-blur-xl">
        <div className="container flex flex-col py-4 sm:flex-row sm:items-center sm:justify-between" style={headerLayout}>
            <div style={brandRow} className="cursor-pointer rounded-full border border-white/8 bg-black/20 px-3 py-2 backdrop-blur-sm" onClick={() => setLocation("/")}>
              <MoonStar className="h-4 w-4 text-[#f3b25e]" />
              <span className="text-sm font-semibold tracking-[0.02em] text-[#f3c57d]">DeepSleepReset</span>
            </div>

            <button
              type="button"
              onClick={goToQuiz}
              className="cosmic-cta w-full appearance-none border-0 font-semibold text-white hover:opacity-95 sm:w-auto"
              style={{
                outline: "none",
                borderRadius: "1.15rem",
                padding: "0.95rem 1.25rem",
                fontSize: "0.95rem",
                lineHeight: 1,
                alignSelf: "stretch",
              }}
            >
Start the quiz
            </button>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <section className="relative isolate min-h-[calc(100vh-72px)]">
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/manus-storage/deepsleepreset-hero-sky_76af8728.jpg')" }}
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(2,4,12,0.62),rgba(4,7,18,0.45)_25%,rgba(4,7,18,0.54)_65%,rgba(1,2,8,0.85)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 h-52 -z-10 bg-[linear-gradient(180deg,transparent,rgba(2,3,8,0.95))]" />
          <div className="absolute left-[-8%] top-[12%] -z-10 h-44 w-44 rounded-full bg-[#8d6bff]/18 blur-3xl md:h-72 md:w-72" />
          <div className="absolute right-[-6%] top-[8%] -z-10 h-40 w-40 rounded-full bg-[#f0b25b]/12 blur-3xl md:h-64 md:w-64" />
          <div className="absolute inset-x-0 top-[18%] -z-10 mx-auto hidden h-px max-w-5xl bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)] md:block" />

          <div className="container" style={heroCenter}>
            <div style={heroStack}>
              <div className="inline-flex items-center rounded-full border border-[#f0b25b]/20 bg-black/20 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#d3a45a] backdrop-blur-md">
                DeepSleepReset · Chronotype-led sleep diagnosis in 60 seconds
              </div>

              <div className="space-y-1">
                <h1 className="font-display text-[3.35rem] leading-[0.92] text-white sm:text-6xl sm:leading-[0.88] md:text-[7.2rem] md:leading-[0.84]">
                  Stop Fighting Your Sleep.
                </h1>
                <h2 className="font-display text-[3rem] italic leading-[0.92] gold-glow sm:text-6xl sm:leading-[0.88] md:text-[7rem] md:leading-[0.84]">
                  Start Working With Your Biology.
                </h2>
              </div>

              <p className="mx-auto max-w-[42rem] px-2 text-[1.05rem] leading-8 text-[#c7ccde] sm:px-0 md:text-[1.3rem] md:leading-9">
                Five calm questions. One clear diagnosis. A personalized DeepSleepReset insight that shows whether your real blocker is timing, overstimulation, irregular rhythm, or fragile sleep pressure before you pay for anything.
              </p>

              <div className="w-full max-w-[23rem] pt-3">
                <button
                  type="button"
                  onClick={goToQuiz}
                  className="cosmic-cta inline-flex h-auto w-full appearance-none items-center justify-center border-0 font-semibold text-white transition hover:scale-[1.01]"
                  style={{
                    outline: "none",
                    width: "100%",
                    maxWidth: "23rem",
                    borderRadius: "1.55rem",
                    padding: "1.25rem 1.5rem",
                    fontSize: "1.18rem",
                    lineHeight: 1,
                  }}
                >
                  Start My 60-Second Diagnosis
                  <ChevronDown className="ml-3 h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 px-2 pt-1 text-sm text-[#c1c6d9] sm:px-0">
                <p>No credit card. No spam. 100% free diagnosis first.</p>
                <p className="text-[#e5b46d]">23 spots left for today&apos;s free plan</p>
                <div className="mx-auto h-px w-36 bg-[linear-gradient(90deg,transparent,rgba(240,178,91,0.9),transparent)]" />
                <p className="mx-auto max-w-xl text-xs uppercase tracking-[0.28em] text-[#99a3c2]">
                  Built to reveal whether your real blocker is timing, overstimulation, irregular rhythm, or fragile sleep pressure.
                </p>
              </div>

              <div style={statsLayout}>
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.4rem] border border-white/8 bg-black/18 px-4 py-5 backdrop-blur-sm">
                    <p className="text-[1.9rem] font-bold text-white sm:text-4xl md:text-[3.5rem]">{stat.value}</p>
                    <p className="mt-2 text-xs text-[#a9afc4] sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/6 bg-[linear-gradient(180deg,#050711_0%,#0a1022_100%)] py-24">
          <div className="container">
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d3a45a]">Why this funnel converts differently</p>
              <h2 className="mt-5 font-display text-4xl text-white md:text-6xl">Your sleep problem usually is not lack of effort.</h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#c7ccde]">
                DeepSleepReset reframes the first step. Instead of pushing you straight into another generic program, it starts with a short diagnosis that makes the real blocker legible.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {problemCards.map((card) => (
                <div key={card.title} className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 shadow-[0_16px_60px_rgba(0,0,0,0.2)] backdrop-blur-sm">
                  <h3 className="font-display text-3xl text-white">{card.title}</h3>
                  <p className="mt-4 text-base leading-8 text-[#c7ccde]">{card.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-[linear-gradient(180deg,#0a1022_0%,#090d1b_100%)] py-24">
          <div className="container grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d3a45a]">What you unlock next</p>
              <h2 className="mt-5 font-display text-4xl text-white md:text-6xl">The quiz is the start. The premium reset is the system.</h2>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#c7ccde]">
                Once your chronotype direction is clear, the paid DeepSleepReset experience turns that insight into guided structure, calmer evenings, protected premium content, and Petra inside the members area.
              </p>
              <div className="mt-8 space-y-4">
                {promisePoints.map((point) => (
                  <div key={point} className="rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 text-base text-[#eef1f8]">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.25rem] border border-[#8d6bff]/18 bg-[linear-gradient(180deg,rgba(122,86,255,0.18),rgba(9,13,27,0.36))] p-8 shadow-[0_24px_90px_rgba(33,18,79,0.25)]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#f0b25b]">Inside premium</p>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="font-display text-3xl text-white">Personalized reset pacing</h3>
                  <p className="mt-3 text-base leading-8 text-[#d8dded]">Move from diagnosis into a calmer evening rhythm built around how your system actually behaves.</p>
                </div>
                <div>
                  <h3 className="font-display text-3xl text-white">Petra, Gentle Support</h3>
                  <p className="mt-3 text-base leading-8 text-[#d8dded]">A premium companion for reflection, reassurance, and next-step guidance once access is unlocked.</p>
                </div>
                <div>
                  <h3 className="font-display text-3xl text-white">Members-only momentum</h3>
                  <p className="mt-3 text-base leading-8 text-[#d8dded]">Progress tracking, lessons, and daily cadence that make the shift feel measurable instead of vague.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/6 bg-[linear-gradient(180deg,#090d1b_0%,#050711_100%)] py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#d3a45a]">What people respond to</p>
              <h2 className="mt-5 font-display text-4xl text-white md:text-6xl">A luxury wellness tone, but with actual diagnostic clarity.</h2>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.author} className="rounded-[2rem] border border-white/8 bg-white/[0.03] p-8 backdrop-blur-sm">
                  <p className="text-lg leading-8 text-[#eef1f8]">“{item.quote}”</p>
                  <p className="mt-6 text-sm uppercase tracking-[0.28em] text-[#d3a45a]">{item.author}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                type="button"
                onClick={goToQuiz}
                className="cosmic-cta inline-flex appearance-none items-center rounded-[1.2rem] border-0 px-10 py-7 text-lg font-semibold text-white shadow-[0_16px_50px_rgba(140,97,255,0.42)] transition hover:scale-[1.01]"
                style={{ outline: "none" }}
              >
                Start My 60-Second Sleep Diagnosis
                <ChevronDown className="ml-3 h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
