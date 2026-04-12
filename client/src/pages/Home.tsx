import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import SocialProofToast from "@/components/SocialProofToast";
import ExitIntentPopup from "@/components/ExitIntentPopup";

// A/B test variants for headline
const HEADLINE_VARIANTS = [
  {
    id: "A",
    headline: "Proč spíš 8 hodin a přesto vstáváš vyčerpaný?",
    subheadline: "Zjisti svůj spánkový typ za 60 sekund — a oprav to dnes v noci.",
  },
  {
    id: "B",
    headline: "73 % lidí s problémy se spánkem dělá tuto jednu chybu.",
    subheadline: "Bezplatný 60sekundový test odhalí tvůj spánkový typ a co přesně opravit.",
  },
  {
    id: "C",
    headline: "Tvůj mozek není poškozený. Jen spíš ve špatný čas.",
    subheadline: "Zjisti svůj chronotyp a získej personalizovaný plán hlubokého spánku.",
  },
  {
    id: "D",
    headline: "Přestaň bojovat s nespavostí. Začni spát podle své biologie.",
    subheadline: "5 otázek. 60 sekund. Tvůj osobní Sleep Reset plán zdarma.",
  },
];

const CTA_VARIANTS = [
  { id: "A", text: "Zjistit svůj spánkový typ →" },
  { id: "B", text: "Spustit bezplatný test →" },
  { id: "C", text: "Odhalit svůj chronotyp →" },
];

function getOrSetVariant<T extends { id: string }>(key: string, variants: T[]): T {
  const stored = localStorage.getItem(key);
  if (stored) {
    const found = variants.find((v) => v.id === stored);
    if (found) return found;
  }
  const chosen = variants[Math.floor(Math.random() * variants.length)];
  localStorage.setItem(key, chosen.id);
  return chosen;
}

const TESTIMONIALS = [
  { name: "Markéta K.", city: "Praha", text: "Po 3 letech špatného spánku jsem konečně pochopila proč. Spím jako miminko.", stars: 5 },
  { name: "Tomáš V.", city: "Brno", text: "Nevěřil jsem, že $1 může změnit můj život. Změnil.", stars: 5 },
  { name: "Lucie M.", city: "Ostrava", text: "Quiz byl přesný na 100 %. Jsem Dolphin a konečně to dává smysl.", stars: 5 },
  { name: "Pavel R.", city: "Plzeň", text: "7 nocí a spím hlouběji než za posledních 5 let. Doporučuji všem.", stars: 5 },
];

export default function Home() {
  const [, setLocation] = useLocation();
  const [headlineVariant, setHeadlineVariant] = useState(HEADLINE_VARIANTS[0]);
  const [ctaVariant, setCtaVariant] = useState(CTA_VARIANTS[0]);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const exitShown = useRef(false);

  useEffect(() => {
    const hv = getOrSetVariant("dsr_headline_variant", HEADLINE_VARIANTS);
    const cv = getOrSetVariant("dsr_cta_variant", CTA_VARIANTS);
    setHeadlineVariant(hv);
    setCtaVariant(cv);

    // Track impression
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "headline", variant: hv.id, type: "impression" }),
    }).catch(() => {});
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "cta_button", variant: cv.id, type: "impression" }),
    }).catch(() => {});

    // Exit intent
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current) {
        exitShown.current = true;
        setShowExitPopup(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);

    // Scroll detection for sticky CTA
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleCTAClick = () => {
    fetch("/api/ab-test/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: "cta_button", variant: ctaVariant.id, type: "click" }),
    }).catch(() => {});
    setLocation("/quiz");
  };

  return (
    <div className="min-h-screen stars-bg moon-glow relative overflow-x-hidden">
      {/* Social proof toasts */}
      <SocialProofToast />

      {/* Exit intent popup */}
      {showExitPopup && (
        <ExitIntentPopup
          ctaVariant={ctaVariant.id}
          onClose={() => setShowExitPopup(false)}
          onCTA={handleCTAClick}
        />
      )}

      {/* Sticky CTA bar (mobile) */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3 bg-[oklch(0.1_0.025_265/0.97)] backdrop-blur-md border-t border-[oklch(0.65_0.22_280/0.3)] md:hidden">
          <button
            onClick={handleCTAClick}
            className="cta-shimmer w-full py-4 rounded-xl font-bold text-base bg-[oklch(0.65_0.22_280)] text-white animate-pulse-glow"
          >
            {ctaVariant.text}
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-24 text-center">
        {/* Moon decoration */}
        <div className="absolute top-12 right-8 md:right-16 w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[oklch(0.85_0.08_280)] to-[oklch(0.7_0.15_280)] opacity-20 animate-float blur-sm" />
        <div className="absolute top-12 right-8 md:right-16 w-20 h-20 md:w-28 md:h-28 rounded-full border border-[oklch(0.85_0.08_280/0.3)]" />

        <div className="max-w-2xl mx-auto animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[oklch(0.65_0.22_280/0.4)] bg-[oklch(0.65_0.22_280/0.1)] text-sm text-[oklch(0.8_0.12_280)] mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Bezplatný test · Bez registrace · Výsledek za 60 sekund
          </div>

          {/* Headline */}
          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4 text-white">
            {headlineVariant.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[oklch(0.75_0.04_265)] mb-8 leading-relaxed">
            {headlineVariant.subheadline}
          </p>

          {/* CTA Button */}
          <button
            onClick={handleCTAClick}
            className="cta-shimmer inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-lg md:text-xl bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow transition-transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            {ctaVariant.text}
          </button>

          {/* Trust micro-copy */}
          <p className="mt-4 text-sm text-[oklch(0.55_0.04_265)]">
            🔒 Žádná kreditní karta · Žádný spam · 100% zdarma
          </p>

          {/* Social proof numbers */}
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-[oklch(0.6_0.04_265)]">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">12 847</span>
              <span>testů dokončeno</span>
            </div>
            <div className="w-px h-10 bg-[oklch(0.25_0.03_265)]" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">4.9 ★</span>
              <span>průměrné hodnocení</span>
            </div>
            <div className="w-px h-10 bg-[oklch(0.25_0.03_265)]" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-white">7 nocí</span>
              <span>do výsledku</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[oklch(0.4_0.03_265)] text-xs">
          <span>Zjistit více</span>
          <div className="w-5 h-8 border border-[oklch(0.3_0.03_265)] rounded-full flex items-start justify-center pt-1">
            <div className="w-1 h-2 bg-[oklch(0.5_0.05_265)] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* CHRONOTYPE SECTION */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-4 text-white">
          Jaký jsi spánkový typ?
        </h2>
        <p className="text-center text-[oklch(0.65_0.04_265)] mb-10 max-w-xl mx-auto">
          Věda identifikovala 4 chronotypy. Každý má jiné optimální okno pro spánek.
          Většina rad o spánku je napsána pro typ Bear — a proto nefunguje pro ostatní.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: "🦁", name: "Lion", desc: "Ranní ptáče. Vstává brzy, usíná brzy.", time: "22:00–6:00" },
            { emoji: "🐻", name: "Bear", desc: "Průměrný cyklus. Nejčastější typ.", time: "23:00–7:00" },
            { emoji: "🐺", name: "Wolf", desc: "Noční sova. Nejproduktivnější večer.", time: "00:00–8:00" },
            { emoji: "🐬", name: "Dolphin", desc: "Lehký spáč. Probouzí se v noci.", time: "23:30–6:30" },
          ].map((type) => (
            <div
              key={type.name}
              className="p-4 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)] text-center hover:border-[oklch(0.65_0.22_280/0.5)] transition-all hover:bg-[oklch(0.65_0.22_280/0.06)] cursor-pointer"
              onClick={handleCTAClick}
            >
              <div className="text-4xl mb-2">{type.emoji}</div>
              <div className="font-bold text-white mb-1">{type.name}</div>
              <div className="text-xs text-[oklch(0.55_0.04_265)] mb-2">{type.desc}</div>
              <div className="text-xs font-mono text-[oklch(0.65_0.22_280)]">{type.time}</div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={handleCTAClick}
            className="cta-shimmer inline-flex items-center gap-2 px-6 py-4 rounded-xl font-bold text-base bg-[oklch(0.65_0.22_280)] text-white hover:opacity-90 transition-all hover:scale-105"
          >
            Zjistit svůj typ zdarma →
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 px-4 bg-[oklch(0.1_0.02_265)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10 text-white">
            Jak to funguje?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "🧠", title: "Udělej test", desc: "5 jednoduchých otázek. Žádná registrace. Výsledek za 60 sekund." },
              { step: "2", icon: "📊", title: "Zjisti svůj typ", desc: "Dostaneš přesný chronotyp a ideální spánkové okno pro tvou biologii." },
              { step: "3", icon: "🌙", title: "Spusť reset", desc: "7-Night Deep Sleep Reset plán za $1 — a spíš hlouběji od první noci." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)]">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.65_0.22_280/0.2)] border border-[oklch(0.65_0.22_280/0.4)] flex items-center justify-center text-sm font-black text-[oklch(0.8_0.12_280)] mb-3">
                  {item.step}
                </div>
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[oklch(0.6_0.04_265)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-10 text-white">
          Co říkají ostatní
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="p-5 rounded-2xl border border-[oklch(0.22_0.03_265)] bg-[oklch(0.12_0.025_265)]">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
              <p className="text-[oklch(0.8_0.03_265)] text-sm mb-3 italic">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[oklch(0.65_0.22_280/0.3)] flex items-center justify-center text-xs font-bold text-[oklch(0.8_0.12_280)]">
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-[oklch(0.5_0.04_265)]">{t.city} · Ověřený zákazník</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-transparent to-[oklch(0.1_0.02_265)]">
        <div className="max-w-xl mx-auto">
          <div className="text-5xl mb-4">🌙</div>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
            Připraven spát jako nikdy předtím?
          </h2>
          <p className="text-[oklch(0.65_0.04_265)] mb-8">
            Začni bezplatným testem. Výsledek za 60 sekund.
          </p>
          <button
            onClick={handleCTAClick}
            className="cta-shimmer inline-flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-black text-lg bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white animate-pulse-glow hover:scale-105 transition-transform shadow-2xl"
          >
            {ctaVariant.text}
          </button>
          <p className="mt-4 text-xs text-[oklch(0.4_0.03_265)]">
            🔒 Bezpečné · Bez spamu · Výsledek okamžitě
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[oklch(0.18_0.03_265)] text-center text-xs text-[oklch(0.4_0.03_265)]">
        <p>© 2025 Deep Sleep Reset · Všechna práva vyhrazena</p>
        <p className="mt-1">
          <a href="/privacy" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Ochrana soukromí</a>
          {" · "}
          <a href="/terms" className="hover:text-[oklch(0.65_0.22_280)] transition-colors">Podmínky použití</a>
        </p>
      </footer>
    </div>
  );
}
