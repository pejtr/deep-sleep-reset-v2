import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import BehaviorAnalyticsPanel from "@/components/BehaviorAnalyticsPanel";

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
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "abtests" | "orders" | "behavior">("overview");
  const [runningAnalysis, setRunningAnalysis] = useState(false);

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

        {/* Funnel Tab */}
        {activeTab === "funnel" && (
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
          <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.22_0.03_265)]">
                  {["Test", "Variant", "Impressions", "Clicks", "CTR", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.abTests || []).map((row, i) => (
                  <tr key={i} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                    <td className="px-4 py-3 text-[oklch(0.7_0.04_265)]">{row.testName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[oklch(0.65_0.22_280/0.2)] text-[oklch(0.8_0.12_280)] text-xs font-bold">{row.variant}</span>
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
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)]">No A/B test data yet</td></tr>
                )}
              </tbody>
            </table>
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
      </div>
    </div>
  );
}
