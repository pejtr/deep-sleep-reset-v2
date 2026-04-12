import { useEffect, useState } from "react";
import { useLocation } from "wouter";

const CHRONOTYPES = {
  lion: {
    emoji: "🦁",
    name: "Lion",
    nameCZ: "Lev",
    tagline: "Ranní ptáče s přirozenou disciplínou",
    description:
      "Tvůj mozek je naprogramovaný na brzké vstávání a brzy usínání. Jsi nejproduktivnější ráno a večer tě přirozeně přepadá ospalost. Problém nastává, když ignoruješ svůj biologický rytmus — pozdní večery tě stojí kvalitu spánku.",
    sleepWindow: "22:00 – 6:00",
    peakEnergy: "6:00 – 12:00",
    mainProblem: "Pozdní večerní aktivity narušují tvůj přirozený rytmus.",
    quickFix: "Tvrdé vypnutí obrazovek v 21:00 a teplá sprcha před spaním.",
    color: "from-yellow-500 to-orange-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  bear: {
    emoji: "🐻",
    name: "Bear",
    nameCZ: "Medvěd",
    tagline: "Nejčastější typ — řídí se slunečním cyklem",
    description:
      "Jsi v souladu se slunečním cyklem. Tvůj spánek je přirozeně kvalitní, ale moderní svět ho narušuje — pozdní večerní světlo, stres a nepravidelný režim. Stačí malé úpravy pro dramatické zlepšení.",
    sleepWindow: "23:00 – 7:00",
    peakEnergy: "10:00 – 14:00",
    mainProblem: "Modré světlo a stres narušují přechod do hlubokého spánku.",
    quickFix: "Blokátor modrého světla od 20:00 a fixní čas vstávání.",
    color: "from-amber-500 to-yellow-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  wolf: {
    emoji: "🐺",
    name: "Wolf",
    nameCZ: "Vlk",
    tagline: "Noční sova — nejproduktivnější po setmění",
    description:
      "Tvůj mozek je biologicky nastaven na pozdní aktivitu. Společnost tě nutí vstávat brzy, ale tvoje tělo chce spát do 8–9 hod. Výsledek? Chronická únava a pocit, že jsi 'líný'. Nejsi. Jen spíš ve špatný čas.",
    sleepWindow: "00:00 – 8:00",
    peakEnergy: "17:00 – 22:00",
    mainProblem: "Sociální jet lag — spíš v rozporu se svou biologií každý den.",
    quickFix: "Posunutí spánkového okna o 30 min každé 3 dny + ranní světlo.",
    color: "from-indigo-500 to-purple-600",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30",
  },
  dolphin: {
    emoji: "🐬",
    name: "Dolphin",
    nameCZ: "Delfín",
    tagline: "Lehký spáč s hyperaktivní myslí",
    description:
      "Tvůj nervový systém je přirozeně více bdělý. Probouzíš se z každého zvuku, myšlenky tě drží vzhůru. Nejsi úzkostný — jen máš jinak nastavený mozek. Správná technika ti může dát nejhlubší spánek v životě.",
    sleepWindow: "23:30 – 6:30",
    peakEnergy: "15:00 – 21:00",
    mainProblem: "Hyperaktivní mozek brání přechodu do hlubokého spánku.",
    quickFix: "CBT-I techniky + white noise + přísný večerní rituál.",
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
};

export default function QuizResult() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("dsr_quiz_result");
    if (!r) {
      setLocation("/quiz");
      return;
    }
    setResult(r);
  }, [setLocation]);

  if (!result) return null;

  const chronotype = CHRONOTYPES[result as keyof typeof CHRONOTYPES];

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || emailLoading) return;
    setEmailLoading(true);
    try {
      await fetch("/api/quiz/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, chronotype: result }),
      });
      setEmailSubmitted(true);
    } catch {
      // silent
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGetProduct = () => {
    sessionStorage.setItem("dsr_chronotype", result);
    setLocation("/order");
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Result header */}
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-sm text-[oklch(0.6_0.04_265)] mb-2">Tvůj výsledek</p>
          <div className="text-6xl mb-3 animate-float">{chronotype.emoji}</div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">
            Jsi <span className={`gradient-text bg-gradient-to-r ${chronotype.color}`}>{chronotype.nameCZ}</span>
          </h1>
          <p className="text-[oklch(0.65_0.04_265)]">{chronotype.tagline}</p>
        </div>

        {/* Result card */}
        <div className={`rounded-2xl border ${chronotype.borderColor} ${chronotype.bgColor} p-6 mb-6 animate-slide-up`} style={{ animationDelay: "0.1s" }}>
          <p className="text-[oklch(0.82_0.03_265)] text-sm leading-relaxed mb-5">
            {chronotype.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[oklch(0.1_0.02_265/0.7)] rounded-xl p-3">
              <p className="text-xs text-[oklch(0.5_0.04_265)] mb-1">Ideální spánek</p>
              <p className="font-mono font-bold text-white text-sm">{chronotype.sleepWindow}</p>
            </div>
            <div className="bg-[oklch(0.1_0.02_265/0.7)] rounded-xl p-3">
              <p className="text-xs text-[oklch(0.5_0.04_265)] mb-1">Vrchol energie</p>
              <p className="font-mono font-bold text-white text-sm">{chronotype.peakEnergy}</p>
            </div>
          </div>

          <div className="bg-[oklch(0.1_0.02_265/0.7)] rounded-xl p-3 mb-3">
            <p className="text-xs text-[oklch(0.5_0.04_265)] mb-1">⚠️ Tvůj hlavní problém</p>
            <p className="text-sm text-white">{chronotype.mainProblem}</p>
          </div>

          <div className="bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.3)] rounded-xl p-3">
            <p className="text-xs text-[oklch(0.65_0.22_280)] mb-1">✅ Rychlá oprava</p>
            <p className="text-sm text-white">{chronotype.quickFix}</p>
          </div>
        </div>

        {/* CTA Section — $1 product */}
        <div className="rounded-2xl border border-[oklch(0.65_0.22_280/0.5)] bg-[oklch(0.12_0.025_265)] p-6 mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="text-center mb-4">
            <p className="text-xs text-[oklch(0.65_0.22_280)] font-semibold uppercase tracking-wide mb-2">
              Personalizovaný plán pro {chronotype.nameCZ}
            </p>
            <h2 className="text-xl font-black text-white mb-2">
              7-Night Deep Sleep Reset
            </h2>
            <p className="text-sm text-[oklch(0.65_0.04_265)] mb-4">
              Kompletní 7-denní protokol přizpůsobený přesně tvému {chronotype.nameCZ} chronotypu.
              Vědecky podložené techniky, které fungují od první noci.
            </p>

            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="price-original text-lg">$27</span>
              <span className="text-3xl font-black text-white">$1</span>
              <span className="px-2 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold">
                96% SLEVA
              </span>
            </div>

            <ul className="text-left space-y-2 mb-5 text-sm text-[oklch(0.75_0.03_265)]">
              {[
                `Přesný spánkový plán pro ${chronotype.nameCZ} chronotyp`,
                "7-denní krok za krokem protokol",
                "Večerní rituál pro hluboký spánek",
                "Ranní rutina pro maximální energii",
                "Bonus: Sleep Score tracker (PDF)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <button
              onClick={handleGetProduct}
              className="cta-shimmer w-full py-4 rounded-xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-[1.02] transition-transform"
            >
              Získat plán za $1 →
            </button>
            <p className="text-xs text-[oklch(0.4_0.03_265)] mt-2">
              🔒 Bezpečná platba · Okamžitý přístup · 30denní záruka vrácení peněz
            </p>
          </div>
        </div>

        {/* Email capture (free option) */}
        {!emailSubmitted ? (
          <div className="rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] p-5 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <p className="text-center text-sm font-semibold text-white mb-1">
              Nebo dostaneš 3 tipy zdarma na email
            </p>
            <p className="text-center text-xs text-[oklch(0.5_0.04_265)] mb-3">
              Personalizované pro {chronotype.nameCZ} chronotyp · Bez spamu
            </p>
            <form onSubmit={handleEmailSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tvuj@email.cz"
                className="flex-1 px-3 py-2.5 rounded-lg bg-[oklch(0.16_0.025_265)] border border-[oklch(0.25_0.03_265)] text-white text-sm placeholder:text-[oklch(0.4_0.03_265)] focus:outline-none focus:border-[oklch(0.65_0.22_280)]"
                required
              />
              <button
                type="submit"
                disabled={emailLoading}
                className="px-4 py-2.5 rounded-lg bg-[oklch(0.65_0.22_280)] text-white text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {emailLoading ? "..." : "Poslat"}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center animate-slide-up">
            <p className="text-green-400 font-semibold text-sm">✅ Tipy jsou na cestě na tvůj email!</p>
          </div>
        )}
      </div>
    </div>
  );
}
