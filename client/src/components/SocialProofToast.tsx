import { useEffect, useState, useRef } from "react";

const NOTIFICATIONS = [
  { name: "Sarah M.", city: "Austin, TX", action: "just completed the quiz", emoji: "🧠" },
  { name: "James K.", city: "London, UK", action: "bought Sleep Reset for $5", emoji: "🌙" },
  { name: "Lucie V.", city: "Prague, CZ", action: "discovered she's a Wolf chronotype", emoji: "🐺" },
  { name: "Marcus T.", city: "Toronto, CA", action: "sleeping deeper after 7 nights", emoji: "😴" },
  { name: "Emma L.", city: "Sydney, AU", action: "just completed the quiz", emoji: "🧠" },
  { name: "David W.", city: "New York, US", action: "bought Sleep Reset for $5", emoji: "🌙" },
  { name: "Priya R.", city: "Mumbai, IN", action: "discovered she's a Lion chronotype", emoji: "🦁" },
  { name: "Alex B.", city: "Berlin, DE", action: "bought Sleep Reset for $5", emoji: "🌙" },
  { name: "Aisha M.", city: "Lagos, NG", action: "sleeping deeper after 7 nights", emoji: "😴" },
  { name: "Tom H.", city: "Amsterdam, NL", action: "discovered he's a Bear chronotype", emoji: "🐻" },
  { name: "Sophie L.", city: "Paris, FR", action: "bought Sleep Reset for $5", emoji: "🌙" },
  { name: "Carlos M.", city: "Madrid, ES", action: "just completed the quiz", emoji: "🧠" },
  { name: "Yuki S.", city: "Tokyo, JP", action: "sleeping deeper after 7 nights", emoji: "😴" },
  { name: "Isabella F.", city: "São Paulo, BR", action: "discovered she's a Dolphin chronotype", emoji: "🐬" },
];

export default function SocialProofToast() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(NOTIFICATIONS[0]);
  const [leaving, setLeaving] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const showNext = () => {
      indexRef.current = (indexRef.current + 1) % NOTIFICATIONS.length;
      setCurrent(NOTIFICATIONS[indexRef.current]);
      setLeaving(false);
      setVisible(true);

      // Hide after 4s
      timerRef.current = setTimeout(() => {
        setLeaving(true);
        setTimeout(() => {
          setVisible(false);
          // Show next after 8-14s
          const delay = 8000 + Math.random() * 6000;
          timerRef.current = setTimeout(showNext, delay);
        }, 400);
      }, 4000);
    };

    // First notification after 5s
    timerRef.current = setTimeout(showNext, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 z-40 max-w-[280px] social-proof-toast rounded-xl p-3 shadow-2xl ${
        leaving ? "animate-notification-out" : "animate-notification-in"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl flex-shrink-0">{current.emoji}</div>
        <div>
          <p className="text-xs text-white leading-snug">
            <span className="font-bold">{current.name}</span> from {current.city}{" "}
            <span className="text-[oklch(0.7_0.04_265)]">{current.action}</span>
          </p>
          <p className="text-[10px] text-[oklch(0.45_0.04_265)] mt-0.5">just now</p>
        </div>
      </div>
    </div>
  );
}
