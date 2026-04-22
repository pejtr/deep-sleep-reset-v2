import { useEffect, useState, useRef } from "react";

// ─── FOMO Engine: Real-time purchase notifications ────────────────────────────
// Neuro-marketing: Social proof + FOMO drives urgency and validates purchase decision
// Shows rotating notifications of recent "purchases" with realistic names/locations

const SALES_NOTIFICATIONS = [
  { name: "Michael T.", city: "Chicago, IL", product: "7-Night Reset", time: "2 min ago", chronotype: "Bear 🐻" },
  { name: "Sophie L.", city: "Paris, FR", product: "7-Night Reset", time: "4 min ago", chronotype: "Wolf 🐺" },
  { name: "Daniel K.", city: "Toronto, CA", product: "30-Day Program", time: "6 min ago", chronotype: "Lion 🦁" },
  { name: "Mia R.", city: "Melbourne, AU", product: "7-Night Reset", time: "8 min ago", chronotype: "Dolphin 🐬" },
  { name: "Carlos M.", city: "Madrid, ES", product: "7-Night Reset", time: "11 min ago", chronotype: "Bear 🐻" },
  { name: "Anna W.", city: "Berlin, DE", product: "Audio Pack", time: "13 min ago", chronotype: "Wolf 🐺" },
  { name: "James B.", city: "London, UK", product: "7-Night Reset", time: "15 min ago", chronotype: "Lion 🦁" },
  { name: "Yuki S.", city: "Tokyo, JP", product: "30-Day Program", time: "18 min ago", chronotype: "Bear 🐻" },
  { name: "Isabella F.", city: "São Paulo, BR", product: "7-Night Reset", time: "21 min ago", chronotype: "Dolphin 🐬" },
  { name: "Noah P.", city: "Amsterdam, NL", product: "7-Night Reset", time: "24 min ago", chronotype: "Wolf 🐺" },
  { name: "Fatima A.", city: "Dubai, UAE", product: "Audio Pack", time: "27 min ago", chronotype: "Bear 🐻" },
  { name: "Liam O.", city: "Dublin, IE", product: "7-Night Reset", time: "30 min ago", chronotype: "Lion 🦁" },
];

interface LiveSalesNotificationProps {
  position?: "bottom-left" | "bottom-right";
  showOnPages?: string[]; // If set, only show on these pages
}

export default function LiveSalesNotification({ position = "bottom-left" }: LiveSalesNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [current, setCurrent] = useState(SALES_NOTIFICATIONS[0]);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showNext = () => {
      indexRef.current = (indexRef.current + 1) % SALES_NOTIFICATIONS.length;
      setCurrent(SALES_NOTIFICATIONS[indexRef.current]);
      setLeaving(false);
      setVisible(true);

      // Hide after 5s
      timerRef.current = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          setVisible(false);
          // Show next after 12-20s (random interval for authenticity)
          const delay = 12000 + Math.random() * 8000;
          timerRef.current = setTimeout(showNext, delay);
        }, 400);
      }, 5000);
    };

    // First notification after 7s (give user time to read the page)
    timerRef.current = setTimeout(showNext, 7000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  const positionClass = position === "bottom-right"
    ? "right-4 bottom-20"
    : "left-4 bottom-20";

  return (
    <div
      className={`fixed ${positionClass} z-50 max-w-[300px] rounded-xl shadow-2xl cursor-pointer ${
        leaving ? "animate-notification-out" : "animate-notification-in"
      }`}
      style={{
        background: "oklch(0.13 0.03 265 / 0.97)",
        border: "1px solid oklch(0.65 0.22 280 / 0.35)",
        backdropFilter: "blur(16px)",
      }}
      onClick={() => setVisible(false)}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Purchase icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "oklch(0.65 0.22 280 / 0.15)", border: "1px solid oklch(0.65 0.22 280 / 0.3)" }}
        >
          🌙
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white leading-snug font-semibold">
            {current.name} <span style={{ color: "oklch(0.65 0.22 280)" }}>from {current.city}</span>
          </p>
          <p className="text-xs text-[oklch(0.7_0.03_265)] mt-0.5">
            just purchased <strong className="text-white">{current.product}</strong>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-[10px] text-[oklch(0.5_0.04_265)]">{current.time}</span>
            <span className="text-[10px] text-[oklch(0.5_0.04_265)]">· {current.chronotype}</span>
          </div>
        </div>
        {/* Close button */}
        <button
          className="text-[oklch(0.35_0.03_265)] hover:text-[oklch(0.6_0.04_265)] transition-colors text-sm flex-shrink-0 mt-0.5"
          onClick={(e) => { e.stopPropagation(); setVisible(false); }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
