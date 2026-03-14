/*
 * UrgencyTimer — Session-Based Countdown for Offer Section
 *
 * Strategy:
 *  - Shows a countdown timer that expires in 15 minutes from first page load
 *  - Persisted in sessionStorage (resets on new tab, not on refresh)
 *  - When expired: shows "Price increases soon" message with different urgency
 *  - Drives immediate action near the CTA button
 *
 * Design: Midnight Noir — amber accent, dark background digits
 */

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const TIMER_KEY = "dsr_offer_timer_end";
const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getOrCreateEndTime(): number {
  const stored = sessionStorage.getItem(TIMER_KEY);
  if (stored) {
    const end = parseInt(stored, 10);
    if (end > Date.now()) return end;
  }
  const end = Date.now() + TIMER_DURATION_MS;
  sessionStorage.setItem(TIMER_KEY, String(end));
  return end;
}

interface TimeLeft {
  minutes: number;
  seconds: number;
}

export default function UrgencyTimer({ className = "" }: { className?: string }) {
  const [endTime] = useState(() => getOrCreateEndTime());
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ minutes: 15, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const tick = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft({ minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const isUrgent = timeLeft.minutes < 5 && !expired;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (expired) {
    return (
      <div className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <Clock className="w-4 h-4 text-red-400" />
        <span className="text-red-400 font-medium">Offer expires soon — price may increase</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <Clock className={`w-4 h-4 ${isUrgent ? "text-red-400 animate-pulse" : "text-amber"}`} />
      <span className={`text-sm ${isUrgent ? "text-red-400" : "text-foreground/60"}`}>
        Special price reserved for:
      </span>
      <div className="flex items-center gap-1">
        {/* Minutes */}
        <div className={`flex flex-col items-center ${isUrgent ? "text-red-400" : "text-amber"}`}>
          <span className="font-mono font-bold text-lg leading-none">{pad(timeLeft.minutes)}</span>
          <span className="text-[9px] text-foreground/30 uppercase tracking-wider">min</span>
        </div>
        <span className={`font-bold text-lg leading-none mb-2 ${isUrgent ? "text-red-400" : "text-amber"}`}>:</span>
        {/* Seconds */}
        <div className={`flex flex-col items-center ${isUrgent ? "text-red-400" : "text-amber"}`}>
          <span className="font-mono font-bold text-lg leading-none">{pad(timeLeft.seconds)}</span>
          <span className="text-[9px] text-foreground/30 uppercase tracking-wider">sec</span>
        </div>
      </div>
    </div>
  );
}
