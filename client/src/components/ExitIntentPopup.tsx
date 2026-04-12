interface ExitIntentPopupProps {
  ctaVariant: string;
  onClose: () => void;
  onCTA: () => void;
}

const MESSAGES: Record<string, { headline: string; sub: string; cta: string }> = {
  A: {
    headline: "Počkej! Tvůj výsledek tě čeká.",
    sub: "Zjisti proč vstáváš vyčerpaný — bezplatný test za 60 sekund.",
    cta: "Zjistit svůj spánkový typ →",
  },
  B: {
    headline: "Ještě jedna věc před odchodem...",
    sub: "73 % lidí s problémy se spánkem dělá jednu konkrétní chybu. Zjisti, jestli ji děláš taky.",
    cta: "Spustit bezplatný test →",
  },
  C: {
    headline: "Tvůj chronotyp tě čeká.",
    sub: "60 sekund. Žádná registrace. Personalizovaný plán zdarma.",
    cta: "Odhalit svůj chronotyp →",
  },
  D: {
    headline: "Neztrať tuto šanci.",
    sub: "Přestaň bojovat s nespavostí. Začni spát podle své biologie — test je zdarma.",
    cta: "Spustit bezplatný test →",
  },
};

export default function ExitIntentPopup({ ctaVariant, onClose, onCTA }: ExitIntentPopupProps) {
  const msg = MESSAGES[ctaVariant] || MESSAGES["A"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 max-w-sm w-full bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.4)] rounded-2xl p-6 shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[oklch(0.2_0.03_265)] flex items-center justify-center text-[oklch(0.6_0.04_265)] hover:text-white hover:bg-[oklch(0.3_0.04_265)] transition-all text-lg font-bold"
          aria-label="Zavřít"
        >
          ×
        </button>

        <div className="text-center">
          <div className="text-4xl mb-3">🌙</div>
          <h3 className="text-xl font-black text-white mb-2">{msg.headline}</h3>
          <p className="text-sm text-[oklch(0.65_0.04_265)] mb-5">{msg.sub}</p>

          <button
            onClick={onCTA}
            className="cta-shimmer w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white hover:opacity-90 transition-all"
          >
            {msg.cta}
          </button>

          <button
            onClick={onClose}
            className="mt-3 text-xs text-[oklch(0.4_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors"
          >
            Ne, chci dál špatně spát
          </button>
        </div>
      </div>
    </div>
  );
}
