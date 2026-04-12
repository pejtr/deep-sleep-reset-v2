import { useEffect, useState, useRef } from "react";

const NOTIFICATIONS = [
  { name: "Markéta", city: "Praha", action: "právě dokončila test", emoji: "🧠" },
  { name: "Tomáš", city: "Brno", action: "koupil Sleep Reset za $1", emoji: "🌙" },
  { name: "Lucie", city: "Ostrava", action: "zjistila, že je Wolf chronotyp", emoji: "🐺" },
  { name: "Pavel", city: "Plzeň", action: "spí hlouběji po 7 nocích", emoji: "😴" },
  { name: "Jana", city: "Liberec", action: "právě dokončila test", emoji: "🧠" },
  { name: "Martin", city: "Olomouc", action: "koupil Sleep Reset za $1", emoji: "🌙" },
  { name: "Eva", city: "České Budějovice", action: "zjistila, že je Lion chronotyp", emoji: "🦁" },
  { name: "Petr", city: "Hradec Králové", action: "koupil Sleep Reset za $1", emoji: "🌙" },
  { name: "Tereza", city: "Pardubice", action: "spí hlouběji po 7 nocích", emoji: "😴" },
  { name: "Ondřej", city: "Zlín", action: "zjistil, že je Bear chronotyp", emoji: "🐻" },
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
            <span className="font-bold">{current.name}</span> z {current.city}{" "}
            <span className="text-[oklch(0.7_0.04_265)]">{current.action}</span>
          </p>
          <p className="text-[10px] text-[oklch(0.45_0.04_265)] mt-0.5">před chvílí</p>
        </div>
      </div>
    </div>
  );
}
