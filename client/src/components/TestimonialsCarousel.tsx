import { useState, useEffect } from "react";

// ─── Testimonials Carousel ────────────────────────────────────────────────────
// Neuro-marketing: Social proof is the #2 conversion lever after urgency.
// Auto-rotating carousel shows variety of testimonials without overwhelming the page.
// Includes chronotype-specific testimonials for personalization.

const ALL_TESTIMONIALS = [
  {
    name: "Sarah M.",
    location: "Austin, TX",
    chronotype: "bear",
    stars: 5,
    text: "Fell asleep in 8 minutes on night 1. I've struggled with sleep for 5 years. This is the first thing that actually worked.",
    result: "Asleep in 8 min",
    avatar: "🐻",
  },
  {
    name: "James K.",
    location: "London, UK",
    chronotype: "wolf",
    stars: 5,
    text: "As a Wolf, I always thought I was just 'broken'. The protocol finally explained WHY I couldn't sleep before midnight — and fixed it.",
    result: "Fixed in 7 nights",
    avatar: "🐺",
  },
  {
    name: "Priya R.",
    location: "Mumbai, IN",
    chronotype: "dolphin",
    stars: 5,
    text: "The Dolphin protocol is incredible. I used to wake at 3am every night. Week 2 — sleeping through completely.",
    result: "No more 3am wake-ups",
    avatar: "🐬",
  },
  {
    name: "Marcus T.",
    location: "Toronto, CA",
    chronotype: "lion",
    stars: 5,
    text: "Best $5 I've ever spent. The morning routine for Lions alone is worth 100x. My energy is back to what it was at 25.",
    result: "Energy restored",
    avatar: "🦁",
  },
  {
    name: "Emma L.",
    location: "Sydney, AU",
    chronotype: "bear",
    stars: 5,
    text: "I was skeptical about a $5 guide. But the science is solid and the protocol is practical. Night 3 was a game changer.",
    result: "Game changer night 3",
    avatar: "🐻",
  },
  {
    name: "David W.",
    location: "New York, US",
    chronotype: "wolf",
    stars: 5,
    text: "Stopped fighting my biology. The phase-shifting technique moved my sleep window by 90 minutes in just 5 days.",
    result: "90min shift in 5 days",
    avatar: "🐺",
  },
  {
    name: "Lucie V.",
    location: "Prague, CZ",
    chronotype: "dolphin",
    stars: 5,
    text: "The nervous system protocol for Dolphins is something I've never seen in any other sleep guide. Finally sleeping deeply.",
    result: "Deep sleep restored",
    avatar: "🐬",
  },
  {
    name: "Alex B.",
    location: "Berlin, DE",
    chronotype: "lion",
    stars: 5,
    text: "The Lion protocol protected my morning peak perfectly. No more evening crashes. Productivity up 40% in 2 weeks.",
    result: "40% productivity boost",
    avatar: "🦁",
  },
];

interface TestimonialsCarouselProps {
  chronotype?: string; // Show chronotype-specific first
  count?: number; // Number to show at once
  autoPlay?: boolean;
}

export default function TestimonialsCarousel({
  chronotype,
  count = 3,
  autoPlay = true,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Sort: chronotype-specific first, then others
  const sorted = chronotype
    ? [
        ...ALL_TESTIMONIALS.filter((t) => t.chronotype === chronotype),
        ...ALL_TESTIMONIALS.filter((t) => t.chronotype !== chronotype),
      ]
    : ALL_TESTIMONIALS;

  const total = sorted.length;

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, total]);

  // Show `count` testimonials starting from activeIndex
  const visible = Array.from({ length: count }, (_, i) => sorted[(activeIndex + i) % total]);

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-[oklch(0.5_0.04_265)] uppercase tracking-widest mb-1">What people are saying</p>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400 text-sm">★</span>
              ))}
            </div>
            <span className="text-sm font-bold text-white">4.9</span>
            <span className="text-xs text-[oklch(0.5_0.04_265)]">(2,847 reviews)</span>
          </div>
        </div>
        {/* Navigation dots */}
        <div className="flex gap-1.5">
          {Array.from({ length: Math.min(total, 6) }, (_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === activeIndex % Math.min(total, 6)
                  ? "bg-[oklch(0.65_0.22_280)] w-3"
                  : "bg-[oklch(0.3_0.03_265)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Testimonial cards */}
      {visible.map((t, i) => (
        <div
          key={`${t.name}-${i}`}
          className="p-4 rounded-xl transition-all"
          style={{
            background: "oklch(0.12 0.025 265 / 0.8)",
            border: "1px solid oklch(0.22 0.03 265)",
          }}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: "oklch(0.18 0.03 265)" }}
            >
              {t.avatar}
            </div>

            <div className="flex-1 min-w-0">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-yellow-400 text-xs">★</span>
                ))}
                {/* Result badge */}
                <span
                  className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: "oklch(0.65 0.22 280 / 0.15)",
                    color: "oklch(0.75 0.18 280)",
                    border: "1px solid oklch(0.65 0.22 280 / 0.3)",
                  }}
                >
                  ✓ {t.result}
                </span>
              </div>

              {/* Review text */}
              <p className="text-xs text-[oklch(0.75_0.03_265)] italic leading-relaxed mb-1.5">
                "{t.text}"
              </p>

              {/* Author */}
              <p className="text-[10px] text-[oklch(0.5_0.04_265)]">
                — {t.name}, {t.location}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
