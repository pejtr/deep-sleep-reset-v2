/**
 * FunnelProgressBar — GuruGo-style sticky top bar
 * Shows completion percentage and "Don't close" message
 * Integrates across all funnel steps: Home → Order → Upsell1 → Upsell2 → Upsell3 → ThankYou
 */

type FunnelStep = "home" | "order" | "upsell1" | "upsell2" | "upsell3" | "thankyou";

interface FunnelProgressBarProps {
  step: FunnelStep;
}

const STEP_CONFIG: Record<FunnelStep, { percent: number; label: string }> = {
  home:     { percent: 5,   label: "Don't close — Start your sleep transformation" },
  order:    { percent: 35,  label: "Don't close — Complete your order" },
  upsell1:  { percent: 55,  label: "Don't close — Complete your program setup" },
  upsell2:  { percent: 75,  label: "Don't close — Enhance your program" },
  upsell3:  { percent: 90,  label: "Don't close — Final upgrade available" },
  thankyou: { percent: 100, label: "✓ Order complete — Check your email" },
};

export default function FunnelProgressBar({ step }: FunnelProgressBarProps) {
  const config = STEP_CONFIG[step];

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-background/95 backdrop-blur-md border-b border-amber/10">
      {/* Thin amber progress line */}
      <div className="h-[3px] bg-border/20 relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber/70 to-amber transition-all duration-700 ease-out rounded-r-full"
          style={{ width: `${config.percent}%` }}
        />
      </div>
      {/* Label row */}
      <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-foreground/50 font-medium tracking-wide">
          {config.label}
        </span>
        <span className="text-xs font-bold text-amber tabular-nums">
          {config.percent}%
        </span>
      </div>
    </div>
  );
}
