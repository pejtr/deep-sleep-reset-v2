/*
 * LiveVisitorCounter — Real-time Social Proof + Scarcity
 *
 * Strategy:
 *  - Shows "X people viewing this right now" with a pulsing green dot
 *  - Count fluctuates realistically between a min and max range
 *  - Creates FOMO and social proof near the offer CTA
 *  - Resets on each page load (not persisted) to feel fresh
 *
 * Design: Midnight Noir — subtle, non-intrusive, amber/green accent
 */

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface LiveVisitorCounterProps {
  className?: string;
}

function getInitialCount(): number {
  // Realistic range: 47–183 viewers
  return Math.floor(Math.random() * 136) + 47;
}

export default function LiveVisitorCounter({ className = "" }: LiveVisitorCounterProps) {
  const [count, setCount] = useState(getInitialCount);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // Fluctuate count every 8–20 seconds
    const fluctuate = () => {
      const change = Math.floor(Math.random() * 5) + 1; // 1–5 change
      const goUp = Math.random() > 0.45; // Slightly more likely to go up (FOMO)

      setCount(prev => {
        const next = goUp
          ? Math.min(prev + change, 220)
          : Math.max(prev - change, 31);
        setDirection(next > prev ? "up" : "down");
        return next;
      });

      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    };

    const interval = setInterval(fluctuate, Math.random() * 12000 + 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Pulsing green dot */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
      </span>

      <span className="flex items-center gap-1.5 text-sm text-foreground/60">
        <Users className="w-3.5 h-3.5" />
        <span
          className={`font-semibold transition-colors duration-300 ${
            flash
              ? direction === "up" ? "text-green-400" : "text-foreground/80"
              : "text-foreground/80"
          }`}
        >
          {count}
        </span>
        <span>people viewing this right now</span>
      </span>
    </div>
  );
}
