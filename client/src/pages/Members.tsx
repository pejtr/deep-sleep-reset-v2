import { useState } from "react";
import { useLocation } from "wouter";

// Mock member content — in production this would come from /api/members/content
const MEMBER_CONTENT = [
  {
    id: 1,
    title: "April 2026 Sleep Protocol Update",
    description: "New research on sleep architecture and chronotype optimization for spring season.",
    contentType: "guide",
    tier: "basic",
    month: "2026-04",
    icon: "📄",
    isNew: true,
  },
  {
    id: 2,
    title: "Wolf Chronotype Deep Dive",
    description: "Advanced protocol for night owls: optimize your late-night productivity without destroying sleep quality.",
    contentType: "guide",
    tier: "pro",
    month: "2026-04",
    icon: "🐺",
    isNew: true,
  },
  {
    id: 3,
    title: "Weekly AI Sleep Score Report — Week 15",
    description: "Your personalized sleep optimization recommendations based on community data.",
    contentType: "report",
    tier: "pro",
    month: "2026-04",
    icon: "📊",
    isNew: false,
  },
  {
    id: 4,
    title: "Guided Sleep Meditation — Delta Wave",
    description: "30-minute audio session designed to induce deep delta wave sleep within 15 minutes.",
    contentType: "audio",
    tier: "pro",
    month: "2026-03",
    icon: "🎧",
    isNew: false,
  },
  {
    id: 5,
    title: "Q&A Recording — March 2026",
    description: "Monthly live Q&A with sleep optimization experts. Topics: supplements, light therapy, travel.",
    contentType: "video",
    tier: "pro",
    month: "2026-03",
    icon: "🎥",
    isNew: false,
  },
  {
    id: 6,
    title: "Elite: 1-on-1 Sleep Audit Template",
    description: "Comprehensive 7-day sleep tracking template with AI-powered recommendations.",
    contentType: "bonus",
    tier: "elite",
    month: "2026-04",
    icon: "⚡",
    isNew: true,
  },
];

const TIER_COLORS: Record<string, string> = {
  basic: "oklch(0.65 0.18 250)",
  pro: "oklch(0.65 0.22 280)",
  elite: "oklch(0.75 0.18 65)",
};

const TIER_LABELS: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  elite: "Elite",
};

export default function Members() {
  const [, setLocation] = useLocation();
  const [activeFilter, setActiveFilter] = useState<"all" | "guide" | "audio" | "video" | "report" | "bonus">("all");

  const filtered = activeFilter === "all"
    ? MEMBER_CONTENT
    : MEMBER_CONTENT.filter(c => c.contentType === activeFilter);

  return (
    <div className="min-h-screen stars-premium px-4 py-10 relative overflow-hidden">
      {/* Orbs */}
      <div className="orb orb-purple w-[400px] h-[400px] top-[-100px] right-[-100px]" style={{ opacity: 0.08 }} />
      <div className="orb orb-gold w-[300px] h-[300px] bottom-[10%] left-[-100px]" style={{ opacity: 0.06 }} />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.65_0.22_280/0.15)] border border-[oklch(0.65_0.22_280/0.3)] text-[oklch(0.75_0.18_280)] text-xs font-bold uppercase tracking-widest mb-3">
              💎 Sleep Optimizers Pro
            </div>
            <h1 className="font-display text-3xl font-black text-white">Member Area</h1>
            <p className="text-[oklch(0.58_0.04_265)] text-sm mt-1">Your exclusive content library</p>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-[oklch(0.5_0.04_265)] hover:text-white transition-colors"
          >
            ← Home
          </button>
        </div>

        {/* Identity banner — Klein principle */}
        <div className="subscription-card-pro rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h2 className="font-display font-black text-white text-lg">
                You are a <span className="text-gradient-animated">Sleep Optimizer</span>
              </h2>
              <p className="text-sm text-[oklch(0.65_0.04_265)]">
                You've chosen to optimize while others just "try to sleep better." That's the difference.
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { id: "all", label: "All Content" },
            { id: "guide", label: "📄 Guides" },
            { id: "audio", label: "🎧 Audio" },
            { id: "video", label: "🎥 Videos" },
            { id: "report", label: "📊 Reports" },
            { id: "bonus", label: "⚡ Bonuses" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? "bg-[oklch(0.65_0.22_280/0.2)] border border-[oklch(0.65_0.22_280/0.4)] text-white"
                  : "bg-[oklch(0.12_0.025_265)] border border-[oklch(0.2_0.03_265)] text-[oklch(0.55_0.04_265)] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover rounded-2xl p-5 relative overflow-hidden"
            >
              {/* Tier accent */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${TIER_COLORS[item.tier]}, transparent)` }}
              />

              {/* New badge */}
              {item.isNew && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-[0.6rem] font-bold uppercase tracking-wider">
                  NEW
                </div>
              )}

              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        color: TIER_COLORS[item.tier],
                        background: `${TIER_COLORS[item.tier]}20`,
                        border: `1px solid ${TIER_COLORS[item.tier]}40`,
                      }}
                    >
                      {TIER_LABELS[item.tier]}
                    </span>
                    <span className="text-[0.6rem] text-[oklch(0.45_0.04_265)]">{item.month}</span>
                  </div>
                  <h3 className="font-bold text-white text-sm leading-tight">{item.title}</h3>
                </div>
              </div>

              <p className="text-xs text-[oklch(0.58_0.04_265)] mb-4 leading-relaxed">{item.description}</p>

              <button
                className="w-full py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: `${TIER_COLORS[item.tier]}20`,
                  border: `1px solid ${TIER_COLORS[item.tier]}40`,
                  color: TIER_COLORS[item.tier],
                }}
                onClick={() => {
                  // In production: fetch download URL from /api/members/content/:id
                  alert("Content download coming soon! Your subscription is active.");
                }}
              >
                Access Content →
              </button>
            </div>
          ))}
        </div>

        {/* Upgrade CTA for non-elite */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <div className="text-3xl mb-3">⚡</div>
          <h3 className="font-display font-black text-white text-xl mb-2">
            Unlock Sleep Optimizer Elite
          </h3>
          <p className="text-sm text-[oklch(0.58_0.04_265)] mb-4 max-w-md mx-auto">
            Get priority support, 1-on-1 sleep audits, VIP community access, and exclusive Elite-only protocols.
          </p>
          <button
            onClick={() => setLocation("/premium")}
            className="cta-premium cta-shimmer px-8 py-3 rounded-xl font-bold text-sm text-white"
          >
            Upgrade to Elite — $47/month →
          </button>
          <p className="text-xs text-[oklch(0.4_0.03_265)] mt-2">Cancel anytime · Instant access</p>
        </div>

      </div>
    </div>
  );
}
