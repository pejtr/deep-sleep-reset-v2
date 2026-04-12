import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BehaviorAnalyticsPanel from "@/components/BehaviorAnalyticsPanel";
import { AIChatBox, type Message } from "@/components/AIChatBox";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  quizCompletions: number;
  emailLeads: number;
  conversionRate: number;
  upsell1Rate: number;
  upsell2Rate: number;
  upsell3Rate: number;
  abTests: Array<{ testName: string; variant: string; impressions: number; clicks: number; ctr: number }>;
  recentOrders: Array<{ id: number; product: string; amount: number; chronotype: string; createdAt: string }>;
  dailyRevenue: Array<{ date: string; revenue: number; orders: number }>;
}

const TARGET_MONTHLY_CZK = 500000;
const USD_TO_CZK = 25;

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "abtests" | "orders" | "behavior" | "subscriptions" | "content">("overview");
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [contentHistory, setContentHistory] = useState<Array<{id: number; contentType: string; prompt: string; content: string; generatedBy: string; createdAt: string}>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [contentMessages, setContentMessages] = useState<Message[]>([
    { role: "system", content: "You are a sleep optimization content expert. Help create high-converting content for the Deep Sleep Reset funnel: email sequences, social media posts, ad copy, blog articles, and sales page copy. Always use Hormozi-style value stacking, loss aversion, and chronotype-specific personalization." },
    { role: "assistant", content: "👋 Welcome to the Content Generator!\n\nI can help you create:\n- **Email sequences** (welcome, nurture, re-engagement)\n- **Social media posts** (Instagram, Facebook, TikTok)\n- **Ad copy** (Facebook Ads, Google Ads)\n- **Blog articles** (SEO-optimized sleep content)\n- **Sales page copy** (Hormozi-style value stacks)\n\nWhat would you like to create today?" },
  ]);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((d) => setStats(d))
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [user]);

  const handleRunAnalysis = async () => {
    setRunningAnalysis(true);
    try {
      const res = await fetch("/api/admin/nightly-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-key": "manual-trigger" },
      });
      if (res.ok) {
        toast.success("Analysis complete! Check your notifications.");
      } else {
        toast.info("Analysis triggered — check server logs.");
      }
    } catch {
      toast.error("Failed to run analysis.");
    } finally {
      setRunningAnalysis(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.65_0.22_280)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const estimatedMonthly = stats ? (stats.totalRevenue / Math.max(1, 7)) * 30 : 0;
  const monthlyCZK = estimatedMonthly * USD_TO_CZK;
  const goalProgress = Math.min((monthlyCZK / TARGET_MONTHLY_CZK) * 100, 100);

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "funnel", label: "Funnel" },
    { id: "abtests", label: "A/B Tests" },
    { id: "orders", label: "Orders" },
    { id: "behavior", label: "Behavior" },
    { id: "subscriptions", label: "💎 Subscriptions" },
    { id: "content", label: "🤖 AI Content" },
  ] as const;

  return (
    <div className="min-h-screen stars-bg px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-sm text-[oklch(0.55_0.04_265)]">Deep Sleep Reset V2 — Data-Driven Funnel</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRunAnalysis}
              disabled={runningAnalysis}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[oklch(0.65_0.22_280/0.2)] border border-[oklch(0.65_0.22_280/0.4)] text-[oklch(0.8_0.12_280)] hover:bg-[oklch(0.65_0.22_280/0.3)] transition-all disabled:opacity-50"
            >
              {runningAnalysis ? "Analyzing..." : "🧠 Run AI Analysis"}
            </button>
            <button onClick={() => setLocation("/")} className="text-sm text-[oklch(0.55_0.04_265)] hover:text-white transition-colors">
              ← Site
            </button>
          </div>
        </div>

        {/* Goal Progress Bar */}
        <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white">Monthly Goal Progress</span>
            <span className="text-sm font-bold text-[oklch(0.72_0.18_45)]">
              {monthlyCZK.toFixed(0)} CZK / 500,000 CZK
            </span>
          </div>
          <div className="h-3 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)] rounded-full transition-all duration-1000"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <p className="text-xs text-[oklch(0.45_0.04_265)] mt-1">
            {goalProgress.toFixed(1)}% of 500k CZK target · Est. ${estimatedMonthly.toFixed(0)}/month
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[oklch(0.22_0.03_265)] pb-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all -mb-px border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-white border-[oklch(0.65_0.22_280)] bg-[oklch(0.65_0.22_280/0.1)]"
                  : "text-[oklch(0.55_0.04_265)] border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Revenue", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: "💰", color: "text-green-400" },
                { label: "Total Orders", value: stats?.totalOrders || 0, icon: "📦", color: "text-blue-400" },
                { label: "Quiz Completions", value: stats?.quizCompletions || 0, icon: "🧠", color: "text-purple-400" },
                { label: "Email Leads", value: stats?.emailLeads || 0, icon: "📧", color: "text-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-[oklch(0.5_0.04_265)]">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Daily revenue chart */}
            {stats?.dailyRevenue && stats.dailyRevenue.length > 0 && (
              <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4 mb-4">
                <h3 className="font-bold text-white mb-3 text-sm">Daily Revenue (last 7 days)</h3>
                <div className="space-y-2">
                  {stats.dailyRevenue.map((day, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[oklch(0.5_0.04_265)] w-24 text-xs">{day.date}</span>
                      <div className="flex-1 h-2 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] rounded-full"
                          style={{ width: `${Math.min(100, (day.revenue / Math.max(stats.totalRevenue, 1)) * 100 * 3)}%` }}
                        />
                      </div>
                      <span className="text-white font-mono text-xs w-16 text-right">${day.revenue.toFixed(2)}</span>
                      <span className="text-[oklch(0.5_0.04_265)] text-xs w-12 text-right">{day.orders} ord.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Funnel Tab */}        {activeTab === "content" && (
          <div className="space-y-4">
            <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
              <h3 className="font-bold text-white mb-4">Funnel Conversion Rates</h3>
              {[
                { label: "Quiz → Tripwire ($1)", value: stats?.conversionRate || 0, benchmark: 8, color: "from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)]" },
                { label: "Tripwire → OTO1 ($7)", value: stats?.upsell1Rate || 0, benchmark: 25, color: "from-[oklch(0.72_0.18_45)] to-[oklch(0.65_0.22_280)]" },
                { label: "OTO1 → OTO2 ($17)", value: stats?.upsell2Rate || 0, benchmark: 20, color: "from-[oklch(0.6_0.2_0)] to-[oklch(0.72_0.18_45)]" },
                { label: "OTO2 → OTO3 ($27)", value: stats?.upsell3Rate || 0, benchmark: 15, color: "from-[oklch(0.55_0.22_290)] to-[oklch(0.6_0.2_0)]" },
              ].map((item, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[oklch(0.7_0.04_265)]">{item.label}</span>
                    <span className={`font-bold ${item.value >= item.benchmark ? "text-green-400" : "text-yellow-400"}`}>
                      {item.value.toFixed(1)}%
                      <span className="text-xs text-[oklch(0.45_0.04_265)] ml-1">(target: {item.benchmark}%)</span>
                    </span>
                  </div>
                  <div className="h-3 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${Math.min(100, item.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Behavioral insights */}
            <div className="bg-[oklch(0.65_0.22_280/0.08)] border border-[oklch(0.65_0.22_280/0.2)] rounded-xl p-5">
              <h3 className="font-bold text-white mb-3 text-sm">🧠 Behavioral Psychology Triggers Active</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { trigger: "Loss Aversion", desc: "Countdown timer on order page", active: true },
                  { trigger: "Social Proof", desc: "Live purchase notifications", active: true },
                  { trigger: "Scarcity", desc: "Limited spots messaging", active: true },
                  { trigger: "Reciprocity", desc: "Free quiz before purchase", active: true },
                  { trigger: "Commitment", desc: "Quiz completion → purchase", active: true },
                  { trigger: "Authority", desc: "Science-backed claims", active: true },
                  { trigger: "A/B Testing", desc: "CTA headline variants", active: true },
                  { trigger: "Exit Intent", desc: "Popup on leave attempt", active: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-[oklch(0.12_0.025_265)]">
                    <span className={item.active ? "text-green-400" : "text-red-400"}>●</span>
                    <div>
                      <p className="font-semibold text-white">{item.trigger}</p>
                      <p className="text-[oklch(0.5_0.04_265)]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* A/B Tests Tab */}
        {activeTab === "abtests" && (
          <div className="space-y-6">
            {/* CTA Color A/B Test — Featured Card */}
            {(() => {
              const colorRows = (stats?.abTests || []).filter((r: { testName: string }) => r.testName === "cta_color");
              const goldRow = colorRows.find((r: { variant: string }) => r.variant === "gold");
              const purpleRow = colorRows.find((r: { variant: string }) => r.variant === "purple");
              const totalImpressions = colorRows.reduce((s: number, r: { impressions: number }) => s + r.impressions, 0);
              const winner = goldRow && purpleRow
                ? goldRow.ctr > purpleRow.ctr ? "gold" : purpleRow.ctr > goldRow.ctr ? "purple" : null
                : null;
              const isSignificant = totalImpressions >= 100;
              return (
                <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-base">CTA Color A/B Test</h3>
                      <p className="text-xs text-[oklch(0.5_0.04_265)] mt-0.5">Gold button vs. Purple button — conversion rate comparison</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      isSignificant ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {isSignificant ? (winner ? `Winner: ${winner.toUpperCase()}` : "No winner yet") : `Collecting data (${totalImpressions}/100)`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Gold variant */}
                    <div className={`rounded-xl p-4 border ${
                      winner === "gold" ? "border-[oklch(0.82_0.16_65/0.6)] bg-[oklch(0.82_0.16_65/0.08)]" : "border-[oklch(0.22_0.03_265)] bg-[oklch(0.10_0.02_265)]"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-5 rounded" style={{ background: "linear-gradient(135deg, oklch(0.82 0.18 65), oklch(0.72 0.16 55))" }} />
                        <span className="font-bold text-sm text-white">Gold</span>
                        {winner === "gold" && <span className="text-xs bg-[oklch(0.82_0.16_65/0.25)] text-[oklch(0.82_0.16_65)] px-2 py-0.5 rounded-full font-bold">WINNER</span>}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">Impressions</span>
                          <span className="text-white font-mono">{goldRow?.impressions ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">Clicks</span>
                          <span className="text-white font-mono">{goldRow?.clicks ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">CTR</span>
                          <span className="font-bold text-lg text-[oklch(0.82_0.16_65)]">{goldRow ? goldRow.ctr.toFixed(1) : "0.0"}%</span>
                        </div>
                      </div>
                      {goldRow && purpleRow && (
                        <div className="mt-3">
                          <div className="h-2 rounded-full bg-[oklch(0.18_0.03_265)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.max(goldRow.ctr, purpleRow.ctr) > 0 ? (goldRow.ctr / Math.max(goldRow.ctr, purpleRow.ctr)) * 100 : 0}%`,
                                background: "linear-gradient(90deg, oklch(0.82 0.18 65), oklch(0.72 0.16 55))"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Purple variant */}
                    <div className={`rounded-xl p-4 border ${
                      winner === "purple" ? "border-[oklch(0.65_0.22_280/0.6)] bg-[oklch(0.65_0.22_280/0.08)]" : "border-[oklch(0.22_0.03_265)] bg-[oklch(0.10_0.02_265)]"
                    }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-5 rounded" style={{ background: "linear-gradient(135deg, oklch(0.65 0.22 280), oklch(0.55 0.22 290))" }} />
                        <span className="font-bold text-sm text-white">Purple</span>
                        {winner === "purple" && <span className="text-xs bg-[oklch(0.65_0.22_280/0.25)] text-[oklch(0.8_0.12_280)] px-2 py-0.5 rounded-full font-bold">WINNER</span>}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">Impressions</span>
                          <span className="text-white font-mono">{purpleRow?.impressions ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">Clicks</span>
                          <span className="text-white font-mono">{purpleRow?.clicks ?? 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-[oklch(0.5_0.04_265)]">CTR</span>
                          <span className="font-bold text-lg text-[oklch(0.8_0.12_280)]">{purpleRow ? purpleRow.ctr.toFixed(1) : "0.0"}%</span>
                        </div>
                      </div>
                      {goldRow && purpleRow && (
                        <div className="mt-3">
                          <div className="h-2 rounded-full bg-[oklch(0.18_0.03_265)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${Math.max(goldRow.ctr, purpleRow.ctr) > 0 ? (purpleRow.ctr / Math.max(goldRow.ctr, purpleRow.ctr)) * 100 : 0}%`,
                                background: "linear-gradient(90deg, oklch(0.65 0.22 280), oklch(0.55 0.22 290))"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isSignificant && (
                    <p className="mt-4 text-xs text-[oklch(0.45_0.04_265)] text-center">
                      Need {100 - totalImpressions} more impressions for statistical significance. The nightly AI analyzer will automatically promote the winner to 70% traffic.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* All A/B Tests Table */}
            <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[oklch(0.22_0.03_265)]">
                <h3 className="text-white font-semibold text-sm">All A/B Tests</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[oklch(0.22_0.03_265)]">
                    {["Test", "Variant", "Impressions", "Clicks", "CTR", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(stats?.abTests || []).map((row: { testName: string; variant: string; impressions: number; clicks: number; ctr: number }, i: number) => (
                    <tr key={i} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                      <td className="px-4 py-3 text-[oklch(0.7_0.04_265)]">{row.testName}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          row.variant === "gold" ? "bg-[oklch(0.82_0.16_65/0.2)] text-[oklch(0.82_0.16_65)]" :
                          row.variant === "purple" ? "bg-[oklch(0.65_0.22_280/0.2)] text-[oklch(0.8_0.12_280)]" :
                          "bg-[oklch(0.65_0.22_280/0.2)] text-[oklch(0.8_0.12_280)]"
                        }`}>{row.variant}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-mono">{row.impressions}</td>
                      <td className="px-4 py-3 text-white font-mono">{row.clicks}</td>
                      <td className="px-4 py-3 font-bold text-green-400">{row.ctr.toFixed(1)}%</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${row.impressions >= 100 ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {row.impressions >= 100 ? "Significant" : "Collecting data"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!stats?.abTests || stats.abTests.length === 0) && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)]">No A/B test data yet — data will appear as visitors interact with the site</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.22_0.03_265)]">
                  {["#", "Product", "Amount", "Chronotype", "Date"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).map((order, i) => (
                  <tr key={i} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                    <td className="px-4 py-3 text-[oklch(0.5_0.04_265)] font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        order.product === "tripwire" ? "bg-blue-500/20 text-blue-400" :
                        order.product === "oto1" ? "bg-purple-500/20 text-purple-400" :
                        order.product === "oto2" ? "bg-orange-500/20 text-orange-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {order.product === "tripwire" ? "$1 Guide" :
                         order.product === "oto1" ? "$7 Program" :
                         order.product === "oto2" ? "$17 Audio" : "$27 Toolkit"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-bold">${Number(order.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-[oklch(0.7_0.04_265)]">{order.chronotype}</td>
                    <td className="px-4 py-3 text-[oklch(0.5_0.04_265)] text-xs">{new Date(order.createdAt).toLocaleDateString("en-US")}</td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)]">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Behavior Tab */}
        {activeTab === "behavior" && (
          <BehaviorAnalyticsPanel onRunAnalysis={handleRunAnalysis} runningAnalysis={runningAnalysis} />
        )}

        {/* Subscriptions Tab */}
        {activeTab === "subscriptions" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              {[
                { label: "Active Subs", value: "—", icon: "👥", color: "text-purple-400", sub: "Loading..." },
                { label: "MRR", value: "—", icon: "💎", color: "text-green-400", sub: "Monthly recurring" },
                { label: "Churn Rate", value: "—", icon: "📉", color: "text-yellow-400", sub: "Last 30 days" },
                { label: "LTV", value: "—", icon: "🏆", color: "text-blue-400", sub: "Avg lifetime value" },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-white font-semibold">{item.label}</div>
                  <div className="text-xs text-[oklch(0.45_0.04_265)]">{item.sub}</div>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span>💎</span> Sleep Optimizers Tiers
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {[
                  { name: "Basic", price: "$9.99/mo", color: "oklch(0.65 0.18 250)", desc: "Monthly guide + community" },
                  { name: "Pro", price: "$27/mo", color: "oklch(0.65 0.22 280)", desc: "AI reports + Q&A + bonuses" },
                  { name: "Elite", price: "$47/mo", color: "oklch(0.75 0.18 65)", desc: "Dashboard + coaching + VIP" },
                ].map((tier) => (
                  <div key={tier.name} className="p-4 rounded-xl bg-[oklch(0.13_0.025_265)] border border-[oklch(0.22_0.03_265)]">
                    <div className="font-bold mb-1" style={{ color: tier.color }}>{tier.name}</div>
                    <div className="text-xl font-black text-white mb-1">{tier.price}</div>
                    <div className="text-xs text-[oklch(0.55_0.04_265)]">{tier.desc}</div>
                    <div className="text-xs text-[oklch(0.45_0.04_265)] mt-2">0 active subscribers</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h3 className="font-bold text-white mb-3 text-sm">📊 Klein Principle — Identity Metrics</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { metric: "Identity Adoption Rate", desc: "Users who self-identify as 'Sleep Optimizer'", value: "—" },
                  { metric: "Community Engagement", desc: "Posts/comments per member/month", value: "—" },
                  { metric: "Brand Advocacy", desc: "Members who referred others", value: "—" },
                  { metric: "Retention Rate", desc: "Subscribers after 3 months", value: "—" },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)]">
                    <p className="font-semibold text-white mb-0.5">{item.metric}</p>
                    <p className="text-[oklch(0.5_0.04_265)] mb-1">{item.desc}</p>
                    <p className="text-[oklch(0.65_0.22_280)] font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[oklch(0.4_0.03_265)] mt-3">* Subscription system active — metrics will populate as members join</p>
            </div>
          </div>
        )}

        {/* AI Content Generator Tab */}
        {activeTab === "content" && (
          <div className="space-y-4">
          {/* Content History Panel */}
          {showHistory && (
            <div className="glass-card rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-sm">📚 Generated Content History</h3>
                <button onClick={() => setShowHistory(false)} className="text-xs text-[oklch(0.5_0.04_265)] hover:text-white">× Close</button>
              </div>
              {historyLoading ? (
                <div className="text-xs text-[oklch(0.5_0.04_265)]">Loading history...</div>
              ) : contentHistory.length === 0 ? (
                <div className="text-xs text-[oklch(0.5_0.04_265)]">No content generated yet. Use the generator below to create your first post!</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {contentHistory.map((item) => (
                    <div key={item.id} className="bg-[oklch(0.12_0.025_265)] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[oklch(0.65_0.22_280)]">{item.contentType.replace('_', ' ')}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.6rem] text-[oklch(0.4_0.03_265)]">{item.generatedBy === 'cron' ? '🤖 Auto' : '✍️ Manual'}</span>
                          <span className="text-[0.6rem] text-[oklch(0.4_0.03_265)]">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <p className="text-xs text-[oklch(0.55_0.04_265)] line-clamp-2">{item.content.substring(0, 120)}...</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.content);
                          toast.success('Copied to clipboard!');
                        }}
                        className="mt-1.5 text-[0.65rem] text-[oklch(0.65_0.22_280)] hover:text-[oklch(0.75_0.18_280)] transition-colors"
                      >
                        Copy full content →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span>🤖</span> AI Content Generator
                </h3>
                <button
                  onClick={() => {
                    if (!showHistory) {
                      setHistoryLoading(true);
                      fetch('/api/admin/content-history')
                        .then(r => r.json())
                        .then(d => setContentHistory(d.items || []))
                        .catch(() => {})
                        .finally(() => setHistoryLoading(false));
                    }
                    setShowHistory(!showHistory);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[oklch(0.65_0.22_280/0.15)] border border-[oklch(0.65_0.22_280/0.3)] text-[oklch(0.75_0.18_280)] hover:bg-[oklch(0.65_0.22_280/0.25)] transition-all"
                >
                  {showHistory ? 'Hide History' : '📚 View History'}
                </button>
              </div>
              <p className="text-xs text-[oklch(0.55_0.04_265)] mb-3">
                Generate high-converting content for your funnel using Hormozi principles, chronotype personalization, and behavioral psychology triggers.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Email sequence for Wolf type",
                  "Facebook ad for Bear chronotype",
                  "Instagram post about sleep debt",
                  "Blog: Why you wake up at 3am",
                  "Upsell email after $1 purchase",
                  "Re-engagement for churned subscribers",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setContentMessages(prev => [...prev, { role: "user", content: prompt }]);
                      setContentLoading(true);
                      fetch("/api/admin/generate-content", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt }),
                      })
                        .then(r => r.json())
                        .then(d => {
                          setContentMessages(prev => [...prev, { role: "assistant", content: d.content || "Content generated!" }]);
                        })
                        .catch(() => {
                          setContentMessages(prev => [...prev, { role: "assistant", content: "Sorry, content generation failed. Please try again." }]);
                        })
                        .finally(() => setContentLoading(false));
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[oklch(0.65_0.22_280/0.15)] border border-[oklch(0.65_0.22_280/0.3)] text-[oklch(0.75_0.18_280)] hover:bg-[oklch(0.65_0.22_280/0.25)] transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <AIChatBox
              messages={contentMessages}
              isLoading={contentLoading}
              placeholder="Ask me to create email copy, ad scripts, blog posts, social content..."
              height="500px"
              onSendMessage={(msg: string) => {
                setContentMessages(prev => [...prev, { role: "user", content: msg }]);
                setContentLoading(true);
                fetch("/api/admin/generate-content", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ prompt: msg }),
                })
                  .then(r => r.json())
                  .then(d => {
                    setContentMessages(prev => [...prev, { role: "assistant", content: d.content || "Content generated!" }]);
                  })
                  .catch(() => {
                    setContentMessages(prev => [...prev, { role: "assistant", content: "Sorry, content generation failed. Please try again." }]);
                  })
                  .finally(() => setContentLoading(false));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
