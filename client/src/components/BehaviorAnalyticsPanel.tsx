import { useEffect, useState } from "react";

interface BehaviorEvent {
  event: string;
  page: string;
  element?: string;
  depth?: number;
  count: number;
  ts?: number;
}

interface BehaviorData {
  pageViews: Record<string, number>;
  ctaClicks: Record<string, number>;
  scrollDepths: Record<string, Record<string, number>>;
  exitIntents: number;
  rageClicks: number;
  emailPopupOpens: number;
  emailPopupConverts: number;
  dropoffByPage: Record<string, number>;
  abWinners: Array<{ testName: string; winner: string; confidence: number }>;
  optimizationHistory: Array<{ date: string; action: string; impact: string }>;
}

interface Props {
  onRunAnalysis: () => void;
  runningAnalysis: boolean;
}

// Simulated data for visualization until real data accumulates
const FUNNEL_PAGES = ["home", "quiz", "result", "order", "upsell1", "upsell2", "upsell3", "thankyou"];

function ScrollHeatBar({ page, depths }: { page: string; depths: Record<string, number> }) {
  const milestones = [25, 50, 75, 100];
  const maxVal = Math.max(...milestones.map((m) => depths[String(m)] || 0), 1);
  return (
    <div className="mb-3">
      <p className="text-xs text-[oklch(0.6_0.04_265)] mb-1 capitalize">{page}</p>
      <div className="flex gap-1 items-end h-8">
        {milestones.map((m) => {
          const val = depths[String(m)] || 0;
          const pct = (val / maxVal) * 100;
          const color =
            m <= 25 ? "bg-green-500" :
            m <= 50 ? "bg-yellow-500" :
            m <= 75 ? "bg-orange-500" : "bg-red-500";
          return (
            <div key={m} className="flex flex-col items-center gap-0.5 flex-1">
              <div
                className={`w-full rounded-t ${color} transition-all duration-700`}
                style={{ height: `${Math.max(4, pct * 0.28)}px` }}
                title={`${val} users scrolled to ${m}%`}
              />
              <span className="text-[8px] text-[oklch(0.45_0.04_265)]">{m}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClickHeatRow({ element, count, maxCount }: { element: string; count: number; maxCount: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const intensity = pct > 70 ? "bg-red-500" : pct > 40 ? "bg-orange-500" : pct > 20 ? "bg-yellow-500" : "bg-blue-500";
  return (
    <div className="flex items-center gap-3 text-xs mb-2">
      <span className="text-[oklch(0.6_0.04_265)] w-32 truncate">{element}</span>
      <div className="flex-1 h-2 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
        <div className={`h-full ${intensity} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-white font-mono w-8 text-right">{count}</span>
    </div>
  );
}

export default function BehaviorAnalyticsPanel({ onRunAnalysis, runningAnalysis }: Props) {
  const [behaviorData, setBehaviorData] = useState<BehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoOptimizing, setAutoOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/behavior/summary")
      .then((r) => r.json())
      .then((d) => setBehaviorData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAutoOptimize = async () => {
    setAutoOptimizing(true);
    try {
      const res = await fetch("/api/ab-test/winner", { method: "POST", headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (data.winners && data.winners.length > 0) {
        setOptimizationResult(`✅ Auto-optimized ${data.winners.length} A/B tests. Winners now get 70% traffic.`);
      } else {
        setOptimizationResult("📊 Not enough data yet. Need 100+ impressions per variant.");
      }
    } catch {
      setOptimizationResult("❌ Optimization failed. Try again.");
    } finally {
      setAutoOptimizing(false);
    }
  };

  const pageViews = behaviorData?.pageViews || {};
  const ctaClicks = behaviorData?.ctaClicks || {};
  const scrollDepths = behaviorData?.scrollDepths || {};
  const maxClicks = Math.max(...Object.values(ctaClicks), 1);
  const totalPageViews = Object.values(pageViews).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Funnel Drop-off Heatmap */}
      <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
        <h3 className="font-bold text-white mb-1 text-sm">🔥 Funnel Drop-off Heatmap</h3>
        <p className="text-xs text-[oklch(0.5_0.04_265)] mb-4">Where visitors leave the funnel — red = high drop-off</p>
        {loading ? (
          <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-[oklch(0.65_0.22_280)] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {FUNNEL_PAGES.map((page, i) => {
              const views = pageViews[page] || 0;
              const nextViews = i < FUNNEL_PAGES.length - 1 ? (pageViews[FUNNEL_PAGES[i + 1]] || 0) : views;
              const dropoff = views > 0 ? Math.round(((views - nextViews) / views) * 100) : 0;
              const dropoffColor = dropoff > 60 ? "text-red-400" : dropoff > 30 ? "text-orange-400" : dropoff > 10 ? "text-yellow-400" : "text-green-400";
              const barColor = dropoff > 60 ? "bg-red-500" : dropoff > 30 ? "bg-orange-500" : dropoff > 10 ? "bg-yellow-500" : "bg-green-500";
              return (
                <div key={page} className="flex items-center gap-3 text-xs">
                  <span className="text-[oklch(0.6_0.04_265)] w-20 capitalize">{page}</span>
                  <div className="flex-1 h-3 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: totalPageViews > 0 ? `${Math.min(100, (views / Math.max(...Object.values(pageViews), 1)) * 100)}%` : "0%" }}
                    />
                  </div>
                  <span className="text-white font-mono w-8 text-right">{views}</span>
                  {i < FUNNEL_PAGES.length - 1 && (
                    <span className={`w-14 text-right font-bold ${dropoffColor}`}>
                      {views > 0 ? `-${dropoff}%` : "—"}
                    </span>
                  )}
                </div>
              );
            })}
            {totalPageViews === 0 && (
              <p className="text-xs text-[oklch(0.4_0.03_265)] text-center py-2">No visitor data yet — data appears after first visitors</p>
            )}
          </div>
        )}
      </div>

      {/* Scroll Depth Heatmap */}
      <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
        <h3 className="font-bold text-white mb-1 text-sm">📜 Scroll Depth Heatmap</h3>
        <p className="text-xs text-[oklch(0.5_0.04_265)] mb-4">How far visitors scroll on each page (green=25%, red=100%)</p>
        {Object.keys(scrollDepths).length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(scrollDepths).map(([page, depths]) => (
              <ScrollHeatBar key={page} page={page} depths={depths} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[oklch(0.4_0.03_265)] text-center py-2">Scroll data appears after first visitors</p>
        )}
      </div>

      {/* Click Heatmap */}
      <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
        <h3 className="font-bold text-white mb-1 text-sm">🖱️ Click Heatmap</h3>
        <p className="text-xs text-[oklch(0.5_0.04_265)] mb-4">Most clicked elements — red = hottest</p>
        {Object.keys(ctaClicks).length > 0 ? (
          Object.entries(ctaClicks)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([element, count]) => (
              <ClickHeatRow key={element} element={element} count={count} maxCount={maxClicks} />
            ))
        ) : (
          <p className="text-xs text-[oklch(0.4_0.03_265)] text-center py-2">Click data appears after first visitors</p>
        )}
      </div>

      {/* Behavior Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Exit Intents", value: behaviorData?.exitIntents || 0, icon: "🚪", desc: "Attempted to leave" },
          { label: "Rage Clicks", value: behaviorData?.rageClicks || 0, icon: "😤", desc: "Frustrated users" },
          { label: "Popup Opens", value: behaviorData?.emailPopupOpens || 0, icon: "📧", desc: "Email popup shown" },
          { label: "Popup Converts", value: behaviorData?.emailPopupConverts || 0, icon: "✅", desc: "Email captured" },
        ].map((item, i) => (
          <div key={i} className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4">
            <div className="text-xl mb-1">{item.icon}</div>
            <div className="text-2xl font-black text-white">{item.value}</div>
            <div className="text-xs text-[oklch(0.5_0.04_265)]">{item.label}</div>
            <div className="text-[10px] text-[oklch(0.4_0.03_265)]">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Auto A/B Optimization */}
      <div className="bg-[oklch(0.65_0.22_280/0.08)] border border-[oklch(0.65_0.22_280/0.2)] rounded-xl p-5">
        <h3 className="font-bold text-white mb-1 text-sm">⚡ Auto A/B Optimization</h3>
        <p className="text-xs text-[oklch(0.65_0.04_265)] mb-3">
          Automatically promotes the winning A/B variant to 70% of traffic. Requires 100+ impressions per variant for statistical significance.
        </p>
        {optimizationResult && (
          <div className="mb-3 p-2 rounded-lg bg-[oklch(0.14_0.025_265)] text-xs text-[oklch(0.7_0.04_265)]">
            {optimizationResult}
          </div>
        )}
        {behaviorData?.optimizationHistory && behaviorData.optimizationHistory.length > 0 && (
          <div className="mb-3 space-y-1">
            <p className="text-xs text-[oklch(0.5_0.04_265)] font-semibold">Optimization History:</p>
            {behaviorData.optimizationHistory.slice(-3).map((h, i) => (
              <div key={i} className="text-xs text-[oklch(0.6_0.04_265)] flex gap-2">
                <span className="text-[oklch(0.4_0.03_265)]">{h.date}</span>
                <span>{h.action}</span>
                <span className="text-green-400">{h.impact}</span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={handleAutoOptimize}
          disabled={autoOptimizing}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white hover:opacity-90 transition-all disabled:opacity-50 mb-2"
        >
          {autoOptimizing ? "Optimizing..." : "⚡ Run Auto-Optimization →"}
        </button>
      </div>

      {/* Nightly AI Analysis */}
      <div className="bg-[oklch(0.72_0.18_45/0.08)] border border-[oklch(0.72_0.18_45/0.2)] rounded-xl p-4">
        <h3 className="font-bold text-white mb-2 text-sm">🌙 Nightly AI Analysis</h3>
        <p className="text-xs text-[oklch(0.65_0.04_265)] mb-3">
          Every midnight, AI analyzes all funnel data — behavioral patterns, A/B results, drop-off points — and sends you actionable recommendations.
        </p>
        <button
          onClick={onRunAnalysis}
          disabled={runningAnalysis}
          className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)] text-white hover:opacity-90 transition-all disabled:opacity-50"
        >
          {runningAnalysis ? "Running analysis..." : "Run Analysis Now →"}
        </button>
      </div>
    </div>
  );
}
