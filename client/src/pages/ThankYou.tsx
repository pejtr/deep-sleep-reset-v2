import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ThankYou() {
  const [, setLocation] = useLocation();
  const [chronotype, setChronotype] = useState("bear");

  useEffect(() => {
    const c = sessionStorage.getItem("dsr_chronotype") || "bear";
    setChronotype(c);
  }, []);

  const chronotypeNames: Record<string, string> = {
    lion: "Lev 🦁", bear: "Medvěd 🐻", wolf: "Vlk 🐺", dolphin: "Delfín 🐬",
  };

  return (
    <div className="min-h-screen stars-bg px-4 py-12">
      <div className="max-w-md mx-auto text-center">
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center text-4xl mx-auto mb-6 animate-pulse-glow">
          ✅
        </div>

        <h1 className="text-3xl font-black text-white mb-3">
          Vítej v Deep Sleep Reset!
        </h1>
        <p className="text-[oklch(0.65_0.04_265)] mb-8">
          Tvoje objednávka byla zpracována. Zkontroluj email — materiály jsou na cestě.
        </p>

        {/* Downloads */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-6 mb-6 text-left">
          <h2 className="font-bold text-white mb-4 text-center">Tvoje materiály</h2>
          <div className="space-y-3">
            {[
              { icon: "📄", title: `7-Night Reset — ${chronotypeNames[chronotype]}`, sub: "Personalizovaný protokol", href: "/api/downloads/tripwire" },
              { icon: "📊", title: "Sleep Score Tracker", sub: "Bonus PDF (součást průvodce)", href: "/api/downloads/tripwire" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.14_0.025_265)] border border-[oklch(0.22_0.03_265)] hover:border-[oklch(0.65_0.22_280/0.5)] transition-all group"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-[oklch(0.5_0.04_265)]">{item.sub}</p>
                </div>
                <span className="text-[oklch(0.65_0.22_280)] text-sm group-hover:translate-x-1 transition-transform">↓</span>
              </a>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="bg-[oklch(0.65_0.22_280/0.1)] border border-[oklch(0.65_0.22_280/0.3)] rounded-2xl p-5 mb-6 text-left">
          <h3 className="font-bold text-white mb-3">Jak začít dnes večer:</h3>
          <ol className="space-y-2 text-sm text-[oklch(0.75_0.03_265)]">
            <li className="flex items-start gap-2"><span className="text-[oklch(0.65_0.22_280)] font-bold">1.</span> Stáhni si personalizovaný plán výše</li>
            <li className="flex items-start gap-2"><span className="text-[oklch(0.65_0.22_280)] font-bold">2.</span> Přečti si Noc 1 protokol (5 minut)</li>
            <li className="flex items-start gap-2"><span className="text-[oklch(0.65_0.22_280)] font-bold">3.</span> Nastav si budík na čas doporučený pro tvůj chronotyp</li>
            <li className="flex items-start gap-2"><span className="text-[oklch(0.65_0.22_280)] font-bold">4.</span> Sleduj svůj Sleep Score každé ráno</li>
          </ol>
        </div>

        <button
          onClick={() => setLocation("/")}
          className="text-sm text-[oklch(0.55_0.04_265)] hover:text-[oklch(0.75_0.04_265)] transition-colors"
        >
          ← Zpět na hlavní stránku
        </button>
      </div>
    </div>
  );
}
