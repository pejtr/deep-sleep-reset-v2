/*
 * CountdownTimer — urgency bar for /order page
 *
 * Behaviour:
 *  - Starts at 14:59 on first visit (session-persistent via localStorage)
 *  - Stores expiry timestamp so refreshing the page continues from where it left off
 *  - When timer hits 0:00 it resets to 14:59 (soft reset — keeps pressure without dead-ending)
 *  - Flashes red in the last 60 seconds
 *  - Can render as sticky top bar (sticky=true) or inline widget (sticky=false)
 */

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_DURATION_MS = 14 * 60 * 1000 + 59 * 1000; // 14:59

function getOrCreateExpiry(storageKey: string, durationMs: number): number {
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const expiry = parseInt(stored, 10);
    if (expiry > Date.now()) return expiry;
  }
  const expiry = Date.now() + durationMs;
  localStorage.setItem(storageKey, expiry.toString());
  return expiry;
}

function formatTime(ms: number): { minutes: string; seconds: string } {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  };
}

interface CountdownTimerProps {
  /** Duration in minutes. Defaults to 14:59 */
  minutes?: number;
  /** Label shown before the timer. Defaults to "Offer expires in" */
  label?: string;
  /** localStorage key for persistence. Defaults to "dsr-offer-expiry" */
  storageKey?: string;
  /** If true, renders as a sticky top bar. Default: true */
  sticky?: boolean;
  /** Extra className for the outer wrapper */
  className?: string;
}

export default function CountdownTimer({
  minutes = 15,
  label = "Offer expires in",
  storageKey = "dsr-offer-expiry",
  sticky = true,
  className = "",
}: CountdownTimerProps) {
  const durationMs = minutes * 60 * 1000 - 1000; // e.g. 15min → 14:59

  const [remaining, setRemaining] = useState<number>(() => {
    const expiry = getOrCreateExpiry(storageKey, durationMs);
    return Math.max(0, expiry - Date.now());
  });

  const isUrgent = remaining <= 60_000; // last 60 seconds

  useEffect(() => {
    const tick = () => {
      const expiry = getOrCreateExpiry(storageKey, durationMs);
      const left = expiry - Date.now();
      if (left <= 0) {
        // Soft reset: start a new window
        const newExpiry = Date.now() + durationMs;
        localStorage.setItem(storageKey, newExpiry.toString());
        setRemaining(durationMs);
      } else {
        setRemaining(left);
      }
    };

    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [storageKey, durationMs]);

  const { minutes: mins, seconds: secs } = formatTime(remaining);

  return (
    <div
      className={`
        w-full z-40 py-2.5 px-4
        ${isUrgent
          ? "bg-red-900/90 border-b border-red-500/40"
          : "bg-[oklch(0.14_0.025_260/0.95)] border-b border-amber/20"
        }
        backdrop-blur-sm transition-colors duration-500
        ${sticky ? "sticky top-0" : ""}
        ${className}
      `}
    >
      <div className="max-w-3xl mx-auto flex items-center justify-center gap-3 text-sm">
        {isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
        ) : (
          <Clock className="w-4 h-4 text-amber/70 shrink-0" />
        )}

        <span className={`font-medium ${isUrgent ? "text-red-300" : "text-foreground/70"}`}>
          {label}
        </span>

        {/* Timer digits */}
        <div className="flex items-center gap-1 font-mono font-bold text-base">
          {/* Minutes */}
          <span
            className={`
              inline-flex items-center justify-center w-9 h-8 rounded
              ${isUrgent ? "bg-red-500/20 text-red-300" : "bg-amber/10 text-amber"}
              tabular-nums
            `}
          >
            {mins}
          </span>
          <span className={isUrgent ? "text-red-400" : "text-amber/60"}>:</span>
          {/* Seconds — flip animation */}
          <AnimatePresence mode="popLayout">
            <motion.span
              key={secs}
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className={`
                inline-flex items-center justify-center w-9 h-8 rounded
                ${isUrgent ? "bg-red-500/20 text-red-300" : "bg-amber/10 text-amber"}
                tabular-nums
              `}
            >
              {secs}
            </motion.span>
          </AnimatePresence>
        </div>

        {isUrgent && (
          <span className="text-red-400/80 text-xs font-medium animate-pulse hidden sm:inline">
            — Act now!
          </span>
        )}
      </div>
    </div>
  );
}
