const REVIEWS = [
  { name: "Sarah M.", location: "Texas, US", chronotype: "Bear", stars: 5, text: "I was waking up 3x a night for years. After Night 3 of the Bear protocol, I slept 7 hours straight. I cried. Worth every penny.", day: "Day 4" },
  { name: "James K.", location: "London, UK", chronotype: "Wolf", stars: 5, text: "As a Wolf, I always thought I was just a 'night person.' Turns out I was fighting my biology. The Wolf protocol changed everything.", day: "Day 7" },
  { name: "Priya R.", location: "Mumbai, India", chronotype: "Lion", stars: 5, text: "I paid $1 expecting nothing. I got a complete sleep transformation. The Lion morning protocol is now my non-negotiable daily ritual.", day: "Day 5" },
  { name: "Marcus T.", location: "Sydney, AU", chronotype: "Dolphin", stars: 5, text: "Light sleeper my whole life. The Dolphin protocol is specifically designed for people like me. Finally sleeping through the night.", day: "Day 6" },
  { name: "Emma L.", location: "Toronto, CA", chronotype: "Bear", stars: 5, text: "Skeptical at first — it's just $1, how good can it be? Turns out, very good. My sleep score went from 58 to 84 in a week.", day: "Day 7" },
  { name: "David W.", location: "Philippines", chronotype: "Wolf", stars: 5, text: "The quiz took 60 seconds and nailed my chronotype perfectly. The Wolf evening wind-down routine is exactly what I needed.", day: "Day 3" },
];

export default function ReviewsSection() {
  return (
    <section className="py-16 px-4 bg-[oklch(0.09_0.02_265)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[oklch(0.65_0.22_280)] mb-2">Real Results</p>
          <h2 className="text-2xl md:text-3xl font-black text-white">People who fixed their sleep with this</h2>
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className="text-yellow-400 text-xl">★</span>
            ))}
            <span className="text-sm text-[oklch(0.65_0.04_265)] ml-2">4.9/5 · 1,200+ downloads</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl p-5 hover:border-[oklch(0.65_0.22_280/0.4)] transition-all"
            >
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-yellow-400 text-sm">★</span>
                ))}
                <span className="ml-auto text-xs text-green-400 font-bold">{review.day}</span>
              </div>
              <p className="text-sm text-[oklch(0.75_0.03_265)] mb-4 leading-relaxed">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] flex items-center justify-center text-white text-xs font-bold">
                  {review.name[0]}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{review.name}</p>
                  <p className="text-xs text-[oklch(0.45_0.04_265)]">{review.location} · {review.chronotype}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-[oklch(0.5_0.04_265)]">
          {["🔒 Secure Payment", "📧 Instant Delivery", "↩️ 30-Day Guarantee", "🌍 Available Worldwide"].map((badge, i) => (
            <span key={i}>{badge}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
