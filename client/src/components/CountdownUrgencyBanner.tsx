import { useState, useEffect } from "react";

// ─── Countdown Urgency Banner ─────────────────────────────────────────────────
// Neuro-marketing: Scarcity + urgency is the #1 conversion lever.
// Session-persistent countdown ensures consistent urgency across page refreshes.
// Used on: Result page, Order page, Upsell pages

interface CountdownUrgencyBannerProps {
  minutes?: number; // Default 15 min
  expiredMessage?: string;
  activePrefix?: string;
  activeSuffix?: string;
  sessionKey?: string; // For session-persistent countdown
}

export default function CountdownUrgencyBanner({
  minutes = 15,
  expiredMessage = "⚠️ This offer has expired — standard pricing now applies",
  activePrefix = "⚡ Special offer reserved for you:",
  activeSuffix = "— then full price",
  sessionKey = "dsr_offer_timer_end",
}: CountdownUrgencyBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    // Session-persistent: same timer across page navigations
    const stored = sessionStorage.getItem(sessionKey);
    let endTime: number;

    if (stored) {
      endTime = parseInt(stored, 10);
      // If timer already expired, keep at 0
      if (endTime < Date.now()) {
        setSecondsLeft(0);
        return;
      }
    } else {
      endTime = Date.now() + minutes * 60 * 1000;
      sessionStorage.setItem(sessionKey, String(endTime));
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
    };

    tick(); // Immediate first tick
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [minutes, sessionKey]);

  if (secondsLeft === null) return null; // Not yet initialized

  const expired = secondsLeft === 0;
  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const secs = (secondsLeft % 60).toString().padStart(2, "0");
  const isUrgent = secondsLeft < 120; // Under 2 minutes — red alert

  if (expired) {
    return (
      <div className="rounded-xl p-3.5 text-center text-sm font-bold bg-red-900/30 border border-red-500/40 text-red-400 mb-4">
        {expiredMessage}
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl p-3.5 mb-4 text-center transition-all ${
        isUrgent
          ? "bg-red-900/25 border border-red-500/40"
          : "bg-[oklch(0.72_0.18_45/0.1)] border border-[oklch(0.72_0.18_45/0.3)]"
      }`}
    >
      <p className={`text-sm font-bold flex items-center justify-center gap-2 flex-wrap ${
        isUrgent ? "text-red-400" : "text-[oklch(0.85_0.15_45)]"
      }`}>
        <span>{activePrefix}</span>
        <span
          className="font-mono font-black text-lg animate-countdown-tick"
          style={{ color: isUrgent ? "oklch(0.75 0.22 25)" : "oklch(0.85 0.18 45)" }}
        >
          {mins}:{secs}
        </span>
        <span>{activeSuffix}</span>
      </p>
      {isUrgent && (
        <p className="text-xs text-red-400/70 mt-1 animate-pulse">
          Hurry — your personalized plan is about to expire!
        </p>
      )}
    </div>
  );
}
