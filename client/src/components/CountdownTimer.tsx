/*
 * Countdown Timer Component
 * Creates urgency on upsell pages with a session-based countdown
 * Timer resets on each new visit (session-based, not persistent)
 */

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  /** Duration in minutes */
  minutes?: number;
  /** Label text */
  label?: string;
  /** Storage key for persistence within session */
  storageKey?: string;
}

export default function CountdownTimer({
  minutes = 15,
  label = "This offer expires in:",
  storageKey = "upsell-countdown",
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    // Check sessionStorage for existing countdown
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const remaining = parseInt(stored, 10) - Date.now();
      return remaining > 0 ? Math.floor(remaining / 1000) : 0;
    }
    // Set new expiry
    const expiry = Date.now() + minutes * 60 * 1000;
    sessionStorage.setItem(storageKey, expiry.toString());
    return minutes * 60;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const isUrgent = timeLeft < 300; // Under 5 minutes

  return (
    <div
      className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-500 ${
        isUrgent
          ? "border-red-500/30 bg-red-500/10"
          : "border-amber/20 bg-amber/5"
      }`}
    >
      <Clock
        className={`w-4 h-4 ${isUrgent ? "text-red-400 animate-pulse" : "text-amber/60"}`}
      />
      <span
        className={`text-sm font-medium ${isUrgent ? "text-red-400" : "text-foreground/50"}`}
      >
        {label}
      </span>
      <span
        className={`font-[var(--font-display)] text-xl font-bold tabular-nums ${
          isUrgent ? "text-red-400" : "text-amber"
        }`}
      >
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}
