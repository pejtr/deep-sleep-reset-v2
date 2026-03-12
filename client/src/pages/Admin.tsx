import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Link } from "wouter";
import {
  DollarSign,
  ShoppingCart,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  Activity,
  Mail,
  BarChart2,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  Instagram,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function fmtDate(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function fmtDateShort(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

const PRODUCT_LABELS: Record<string, string> = {
  frontEnd: "Front-end ($5)",
  exitDiscount: "Exit Discount ($4)",
  upsell1: "Upsell 1 ($10)",
  upsell2: "Upsell 2 ($10)",
  bundle: "Bundle",
};

const FUNNEL_COLORS = ["#d4a853", "#b8a9c9", "#7dd3fc", "#86efac", "#fca5a5"];

// ─── sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-3 ${
        accent
          ? "border-amber/30 bg-amber/5"
          : "border-border/30 bg-card/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-foreground/40">
          {label}
        </span>
        <Icon
          className={`w-4 h-4 ${accent ? "text-amber/70" : "text-foreground/30"}`}
        />
      </div>
      <p
        className={`text-2xl font-bold font-[var(--font-display)] ${
          accent ? "text-amber" : "text-foreground/90"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-foreground/40">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-amber/60" />
      <h2 className="text-sm uppercase tracking-widest text-foreground/50 font-medium">
        {title}
      </h2>
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

type Tab = "overview" | "orders" | "leads" | "chatbot";

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const statsQ = trpc.admin.stats.useQuery(undefined, { refetchInterval: 30_000 });
  const funnelQ = trpc.admin.funnel.useQuery(undefined, { refetchInterval: 60_000 });
  const ordersQ = trpc.admin.orders.useQuery(undefined, { refetchInterval: 30_000 });
  const leadsQ = trpc.admin.leads.useQuery(undefined, { refetchInterval: 30_000 });
  const insightsQ = trpc.admin.chatInsights.useQuery(undefined, { refetchInterval: 60_000 });
  const surveysQ = trpc.admin.chatSurveys.useQuery(undefined, { refetchInterval: 60_000 });
  const dailyQ = trpc.admin.dailyRevenue.useQuery(undefined, { refetchInterval: 60_000 });

  // Auth guard
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground/40 animate-pulse">Načítám...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-8 h-8 text-amber/60" />
        <p className="text-foreground/60">Pro přístup se musíte přihlásit.</p>
        <a
          href={getLoginUrl()}
          className="bg-amber text-background px-6 py-2 rounded-lg font-medium hover:bg-amber/90 transition-colors"
        >
          Přihlásit se
        </a>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-8 h-8 text-red-400/60" />
        <p className="text-foreground/60">Přístup odepřen. Pouze pro administrátory.</p>
      </div>
    );
  }

  const stats = statsQ.data;
  const funnel = funnelQ.data ?? [];
  const orders = ordersQ.data ?? [];
  const leads = leadsQ.data ?? [];
  const insights = insightsQ.data ?? [];
  const surveys = surveysQ.data ?? [];
  const daily = dailyQ.data ?? [];

  const convRate =
    stats && stats.totalLeads > 0
      ? ((stats.convertedLeads / stats.totalLeads) * 100).toFixed(1)
      : "0.0";

  const avgOrder =
    stats && stats.totalOrders > 0
      ? stats.totalRevenueCents / stats.totalOrders
      : 0;

  const chartData = daily.map((d) => ({
    date: d.date.slice(5), // MM-DD
    revenue: d.totalCents / 100,
    orders: d.orderCount,
  }));

  const funnelChartData = funnel.map((f) => ({
    name: PRODUCT_LABELS[f.productKey] ?? f.productKey,
    orders: f.count,
    revenue: f.totalCents / 100,
  }));

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Přehled", icon: BarChart2 },
    { id: "orders", label: `Objednávky (${orders.length})`, icon: ShoppingCart },
    { id: "leads", label: `Leady (${leads.length})`, icon: Mail },
    { id: "chatbot", label: `Chatbot (${surveys.length})`, icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] font-semibold text-foreground/80">
              Admin Panel
            </span>
            <span className="text-foreground/30 text-sm">— Deep Sleep Reset</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                statsQ.refetch();
                ordersQ.refetch();
                leadsQ.refetch();
                dailyQ.refetch();
              }}
              className="flex items-center gap-1.5 text-xs text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Obnovit
            </button>
            <Link
              href="/admin/instagram"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-md hover:from-purple-500 hover:to-pink-500 transition-all"
            >
              <Instagram className="w-3.5 h-3.5" />
              Instagram Autopilot
            </Link>
            <span className="text-xs text-foreground/30">
              {user.name ?? user.openId}
            </span>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-border/20 bg-background/60">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  tab === t.id
                    ? "border-amber text-amber"
                    : "border-transparent text-foreground/40 hover:text-foreground/70"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* KPI grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon={DollarSign}
                label="Celkové tržby"
                value={stats ? fmt(stats.totalRevenueCents) : "—"}
                sub={`Dnes: ${stats ? fmt(stats.todayRevenueCents) : "—"}`}
                accent
              />
              <KpiCard
                icon={ShoppingCart}
                label="Objednávky"
                value={stats ? String(stats.totalOrders) : "—"}
                sub={`Průměr: ${stats ? fmt(avgOrder) : "—"}`}
              />
              <KpiCard
                icon={TrendingUp}
                label="Tržby (7 dní)"
                value={stats ? fmt(stats.last7RevenueCents) : "—"}
                sub={`30 dní: ${stats ? fmt(stats.last30RevenueCents) : "—"}`}
              />
              <KpiCard
                icon={Users}
                label="Leady"
                value={stats ? String(stats.totalLeads) : "—"}
                sub={`Konverze: ${convRate}%`}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard
                icon={Star}
                label="Avg. hodnocení chatu"
                value={stats ? stats.avgChatRating.toFixed(1) + " / 5" : "—"}
                sub={`${stats?.totalSurveys ?? 0} hodnocení`}
              />
              <KpiCard
                icon={MessageSquare}
                label="Chat insights"
                value={String(insights.length)}
                sub="AI-extrahované poznatky"
              />
              <KpiCard
                icon={Mail}
                label="Konvertované leady"
                value={stats ? String(stats.convertedLeads) : "—"}
                sub={`z ${stats?.totalLeads ?? 0} celkem`}
              />
              <KpiCard
                icon={Clock}
                label="Posl. objednávka"
                value={
                  orders.length > 0
                    ? new Date(orders[0].createdAt!).toLocaleDateString()
                    : "—"
                }
                sub={orders.length > 0 ? fmt(orders[0].amountCents) : ""}
              />
            </div>

            {/* Revenue chart */}
            {chartData.length > 0 && (
              <div className="border border-border/20 rounded-xl p-6 bg-card/20">
                <SectionHeader title="Tržby za posledních 30 dní" icon={TrendingUp} />
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a853" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#d4a853" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0d1220",
                        border: "1px solid rgba(212,168,83,0.2)",
                        borderRadius: "8px",
                        color: "#f0ece4",
                      }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, "Tržby"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#d4a853"
                      strokeWidth={2}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Funnel breakdown */}
            {funnelChartData.length > 0 && (
              <div className="border border-border/20 rounded-xl p-6 bg-card/20">
                <SectionHeader title="Prodeje podle produktu" icon={BarChart2} />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={funnelChartData} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0d1220",
                        border: "1px solid rgba(212,168,83,0.2)",
                        borderRadius: "8px",
                        color: "#f0ece4",
                      }}
                    />
                    <Bar dataKey="orders" name="Objednávky" radius={[4, 4, 0, 0]}>
                      {funnelChartData.map((_, i) => (
                        <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Table */}
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/20">
                        <th className="text-left py-2 text-foreground/40 font-normal">Produkt</th>
                        <th className="text-right py-2 text-foreground/40 font-normal">Objednávky</th>
                        <th className="text-right py-2 text-foreground/40 font-normal">Tržby</th>
                      </tr>
                    </thead>
                    <tbody>
                      {funnel.map((f) => (
                        <tr key={f.productKey} className="border-b border-border/10">
                          <td className="py-2 text-foreground/70">
                            {PRODUCT_LABELS[f.productKey] ?? f.productKey}
                          </td>
                          <td className="py-2 text-right text-foreground/60">{f.count}</td>
                          <td className="py-2 text-right text-amber/80">{fmt(f.totalCents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {funnelChartData.length === 0 && chartData.length === 0 && (
              <div className="border border-border/20 rounded-xl p-12 text-center text-foreground/30">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Zatím žádná data. Grafy se zobrazí po prvních objednávkách.</p>
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS TAB ── */}
        {tab === "orders" && (
          <div className="space-y-4">
            <SectionHeader title={`Posledních ${orders.length} objednávek`} icon={ShoppingCart} />
            {orders.length === 0 ? (
              <div className="text-center py-16 text-foreground/30">
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Zatím žádné objednávky.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 text-foreground/40 font-normal">
                      <th className="text-left py-3 pr-4">Datum</th>
                      <th className="text-left py-3 pr-4">Email</th>
                      <th className="text-left py-3 pr-4">Produkt</th>
                      <th className="text-right py-3 pr-4">Částka</th>
                      <th className="text-left py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <>
                        <tr
                          key={o.id}
                          className="border-b border-border/10 hover:bg-card/20 cursor-pointer transition-colors"
                          onClick={() =>
                            setExpandedOrder(expandedOrder === o.id ? null : o.id)
                          }
                        >
                          <td className="py-3 pr-4 text-foreground/50 whitespace-nowrap">
                            {fmtDate(o.createdAt)}
                          </td>
                          <td className="py-3 pr-4 text-foreground/70 max-w-[200px] truncate">
                            {o.customerEmail ?? "—"}
                          </td>
                          <td className="py-3 pr-4 text-foreground/60">
                            {PRODUCT_LABELS[o.productKey] ?? o.productKey}
                          </td>
                          <td className="py-3 pr-4 text-right text-amber/80 font-medium">
                            {fmt(o.amountCents)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                o.status === "completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : o.status === "pending"
                                  ? "bg-amber/10 text-amber/80"
                                  : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                        {expandedOrder === o.id && (
                          <tr key={`${o.id}-detail`} className="bg-card/10">
                            <td colSpan={5} className="px-4 py-3 text-xs text-foreground/40 space-y-1">
                              <div>
                                <span className="text-foreground/30">Stripe Session ID: </span>
                                {o.stripeSessionId ?? "—"}
                              </div>
                              <div>
                                <span className="text-foreground/30">Order ID: </span>
                                {o.id}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── LEADS TAB ── */}
        {tab === "leads" && (
          <div className="space-y-4">
            <SectionHeader title={`${leads.length} zachycených leadů`} icon={Mail} />
            {leads.length === 0 ? (
              <div className="text-center py-16 text-foreground/30">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Zatím žádné leady.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20 text-foreground/40 font-normal">
                      <th className="text-left py-3 pr-4">Email</th>
                      <th className="text-left py-3 pr-4">Zdroj</th>
                      <th className="text-left py-3 pr-4">Datum</th>
                      <th className="text-left py-3">Konvertoval</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((l) => (
                      <tr key={l.id} className="border-b border-border/10 hover:bg-card/20">
                        <td className="py-3 pr-4 text-foreground/80">{l.email}</td>
                        <td className="py-3 pr-4 text-foreground/50">{l.source ?? "—"}</td>
                        <td className="py-3 pr-4 text-foreground/40 whitespace-nowrap">
                          {fmtDate(l.createdAt)}
                        </td>
                        <td className="py-3">
                          {l.converted ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                              Ano
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/30">
                              Ne
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── CHATBOT TAB ── */}
        {tab === "chatbot" && (
          <div className="space-y-8">
            {/* Surveys */}
            <div>
              <SectionHeader title={`Hodnocení chatu (${surveys.length})`} icon={Star} />
              {surveys.length === 0 ? (
                <div className="text-center py-8 text-foreground/30">
                  <Star className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Zatím žádná hodnocení.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {surveys.map((s) => (
                    <div
                      key={s.id}
                      className="border border-border/20 rounded-xl p-4 bg-card/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (s.rating ?? 0)
                                  ? "text-amber fill-amber"
                                  : "text-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-foreground/30">
                          {fmtDateShort(s.createdAt)}
                        </span>
                      </div>
                      {s.comment && (
                        <p className="text-sm text-foreground/60 italic">
                          "{s.comment}"
                        </p>
                      )}
                      {s.sessionId && (
                        <p className="text-xs text-foreground/25 mt-2 truncate">
                          Session: {s.sessionId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights */}
            <div>
              <SectionHeader
                title={`AI poznatky z chatů (${insights.length})`}
                icon={MessageSquare}
              />
              {insights.length === 0 ? (
                <div className="text-center py-8 text-foreground/30">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Zatím žádné AI poznatky.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {insights.map((ins) => (
                    <div
                      key={ins.id}
                      className="border border-border/20 rounded-xl p-4 bg-card/20"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              ins.intentLevel === "high"
                                ? "bg-green-500/15 text-green-400"
                                : ins.intentLevel === "medium"
                                ? "bg-amber/15 text-amber/80"
                                : "bg-foreground/5 text-foreground/40"
                            }`}
                          >
                            Intent: {ins.intentLevel ?? "unknown"}
                          </span>
                        </div>
                        <span className="text-xs text-foreground/30">
                          {fmtDateShort(ins.createdAt)}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        {ins.sleepIssue && (
                          <div>
                            <p className="text-xs text-foreground/30 mb-1">Problémy se spánkem</p>
                            <p className="text-foreground/60">{ins.sleepIssue}</p>
                          </div>
                        )}
                        {ins.objection && (
                          <div>
                            <p className="text-xs text-foreground/30 mb-1">Námitky</p>
                            <p className="text-foreground/60">{ins.objection}</p>
                          </div>
                        )}
                      </div>
                      {ins.sessionId && (
                        <p className="text-xs text-foreground/20 mt-2 truncate">
                          Session: {ins.sessionId}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
