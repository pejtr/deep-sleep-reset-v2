import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

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

export default function Admin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "abtests" | "orders" | "leads">("overview");

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

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[oklch(0.65_0.22_280)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const TABS = [
    { id: "overview", label: "Přehled" },
    { id: "abtests", label: "A/B Testy" },
    { id: "orders", label: "Objednávky" },
    { id: "leads", label: "Email Leads" },
  ] as const;

  return (
    <div className="min-h-screen stars-bg px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
            <p className="text-sm text-[oklch(0.55_0.04_265)]">Deep Sleep Reset V2</p>
          </div>
          <button onClick={() => setLocation("/")} className="text-sm text-[oklch(0.55_0.04_265)] hover:text-white transition-colors">
            ← Web
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[oklch(0.22_0.03_265)] pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all -mb-px border-b-2 ${
                activeTab === tab.id
                  ? "text-white border-[oklch(0.65_0.22_280)] bg-[oklch(0.65_0.22_280/0.1)]"
                  : "text-[oklch(0.55_0.04_265)] border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Celkový příjem", value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: "💰", color: "text-green-400" },
                { label: "Objednávky", value: stats?.totalOrders || 0, icon: "📦", color: "text-blue-400" },
                { label: "Quiz dokončení", value: stats?.quizCompletions || 0, icon: "🧠", color: "text-purple-400" },
                { label: "Email Leads", value: stats?.emailLeads || 0, icon: "📧", color: "text-yellow-400" },
              ].map((item, i) => (
                <div key={i} className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4">
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                  <div className="text-xs text-[oklch(0.5_0.04_265)]">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Quiz → Order", value: `${(stats?.conversionRate || 0).toFixed(1)}%`, desc: "Konverzní rate" },
                { label: "OTO1 Rate", value: `${(stats?.upsell1Rate || 0).toFixed(1)}%`, desc: "$7 upsell" },
                { label: "OTO2 Rate", value: `${(stats?.upsell2Rate || 0).toFixed(1)}%`, desc: "$17 upsell" },
              ].map((item, i) => (
                <div key={i} className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white mb-1">{item.value}</div>
                  <div className="text-sm font-semibold text-[oklch(0.7_0.04_265)]">{item.label}</div>
                  <div className="text-xs text-[oklch(0.45_0.04_265)]">{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Daily revenue */}
            {stats?.dailyRevenue && stats.dailyRevenue.length > 0 && (
              <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-4">
                <h3 className="font-bold text-white mb-3 text-sm">Denní příjem (posledních 7 dní)</h3>
                <div className="space-y-2">
                  {stats.dailyRevenue.map((day, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="text-[oklch(0.5_0.04_265)] w-24 text-xs">{day.date}</span>
                      <div className="flex-1 h-2 bg-[oklch(0.18_0.03_265)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] rounded-full"
                          style={{ width: `${Math.min(100, (day.revenue / (stats.totalRevenue || 1)) * 100 * 3)}%` }}
                        />
                      </div>
                      <span className="text-white font-mono text-xs w-16 text-right">${day.revenue.toFixed(2)}</span>
                      <span className="text-[oklch(0.5_0.04_265)] text-xs w-12 text-right">{day.orders} obj.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* A/B Tests */}
        {activeTab === "abtests" && (
          <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.22_0.03_265)]">
                  {["Test", "Varianta", "Zobrazení", "Kliky", "CTR"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.abTests || []).map((row, i) => (
                  <tr key={i} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                    <td className="px-4 py-3 text-[oklch(0.7_0.04_265)]">{row.testName}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-[oklch(0.65_0.22_280/0.2)] text-[oklch(0.8_0.12_280)] text-xs font-bold">{row.variant}</span></td>
                    <td className="px-4 py-3 text-white font-mono">{row.impressions}</td>
                    <td className="px-4 py-3 text-white font-mono">{row.clicks}</td>
                    <td className="px-4 py-3 font-bold text-green-400">{row.ctr.toFixed(1)}%</td>
                  </tr>
                ))}
                {(!stats?.abTests || stats.abTests.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)]">Zatím žádná data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.22_0.03_265)]">
                  {["#", "Produkt", "Částka", "Chronotyp", "Datum"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-[oklch(0.5_0.04_265)] font-semibold uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentOrders || []).map((order, i) => (
                  <tr key={i} className="border-b border-[oklch(0.18_0.03_265)] hover:bg-[oklch(0.14_0.025_265)]">
                    <td className="px-4 py-3 text-[oklch(0.5_0.04_265)] font-mono text-xs">{order.id}</td>
                    <td className="px-4 py-3 text-white">{order.product}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">${order.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-[oklch(0.7_0.04_265)]">{order.chronotype}</td>
                    <td className="px-4 py-3 text-[oklch(0.5_0.04_265)] text-xs">{new Date(order.createdAt).toLocaleDateString("cs-CZ")}</td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-[oklch(0.4_0.03_265)]">Zatím žádné objednávky</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Leads tab placeholder */}
        {activeTab === "leads" && (
          <div className="bg-[oklch(0.12_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl p-8 text-center text-[oklch(0.4_0.03_265)]">
            Email leads se zobrazí po prvních registracích.
          </div>
        )}
      </div>
    </div>
  );
}
