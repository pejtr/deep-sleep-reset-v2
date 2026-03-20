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
  Quote,
  FileText,
  Target,
  PieChart,
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

type Tab = "overview" | "orders" | "leads" | "chatbot" | "conversion" | "ads";

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
  const leadSourcesQ = trpc.admin.leadSources.useQuery(undefined, { refetchInterval: 60_000 });
  const abStatsQ = trpc.ab.getStats.useQuery(undefined, { refetchInterval: 60_000 });

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
  const leadSources = leadSourcesQ.data ?? [];
  const abStats = abStatsQ.data ?? [];

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
    { id: "conversion", label: "Konverze", icon: Target },
    { id: "ads", label: "Ads KPI", icon: Activity },
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
            <Link
              href="/admin/email-sequence"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1.5 rounded-md hover:from-amber-500 hover:to-orange-500 transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              Email Sequence
            </Link>
            <Link
              href="/admin/testimonials"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-green-600 to-teal-600 text-white px-3 py-1.5 rounded-md hover:from-green-500 hover:to-teal-500 transition-all"
            >
              <Quote className="w-3.5 h-3.5" />
              Testimonials
            </Link>
            <Link
              href="/admin/blog"
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-3 py-1.5 rounded-md hover:from-blue-500 hover:to-cyan-500 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              Blog Manager
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
        {/* ── CONVERSION TAB ── */}
        {tab === "conversion" && (
          <div className="space-y-8">
            {/* Lead Source Breakdown */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20">
              <SectionHeader title="Zdroje leadů a konverzní míra" icon={Target} />
              {leadSources.length === 0 ? (
                <div className="text-center py-8 text-foreground/30">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Zatím žádné leady. Data se zobrazí po prvních zachycených emailech.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/20 text-foreground/40 font-normal">
                        <th className="text-left py-3 pr-4">Zdroj</th>
                        <th className="text-right py-3 pr-4">Celkem leadů</th>
                        <th className="text-right py-3 pr-4">Konvertováno</th>
                        <th className="text-right py-3">Konverzní míra</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leadSources.map((s) => (
                        <tr key={s.source} className="border-b border-border/10 hover:bg-card/20">
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${
                                s.source === 'sleep-quiz' ? 'bg-amber' :
                                s.source === 'chatbot' ? 'bg-blue-400' :
                                s.source === 'newsletter' ? 'bg-green-400' :
                                'bg-foreground/30'
                              }`} />
                              <span className="text-foreground/70 capitalize">{s.source.replace(/-/g, ' ')}</span>
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-right text-foreground/60">{s.total}</td>
                          <td className="py-3 pr-4 text-right text-green-400">{s.converted}</td>
                          <td className="py-3 text-right">
                            <span className={`font-medium ${
                              parseFloat(s.convRate) >= 10 ? 'text-green-400' :
                              parseFloat(s.convRate) >= 5 ? 'text-amber' :
                              'text-foreground/50'
                            }`}>
                              {s.convRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Funnel Drop-off Visualization */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20">
              <SectionHeader title="Funnel drop-off analýza" icon={PieChart} />
              <div className="space-y-3">
                {[
                  { label: "Navštívili stránku", value: 100, color: "bg-amber" },
                  { label: "Scrollovali na nabídku", value: 65, color: "bg-amber/80" },
                  { label: "Klikli na CTA", value: 28, color: "bg-amber/60" },
                  { label: "Došli na objednávkový formulář", value: 18, color: "bg-amber/40" },
                  { label: "Dokončili nákup", value: stats ? Math.min(10, stats.totalOrders) : 0, color: "bg-green-400" },
                ].map((step, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60">{step.label}</span>
                      <span className="text-foreground/40">{step.value}%</span>
                    </div>
                    <div className="h-2 bg-foreground/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${step.color} rounded-full transition-all duration-700`}
                        style={{ width: `${step.value}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-xs text-foreground/30 mt-2">* Funnel drop-off je odhadný model. Skutečná data budou dostupná po integraci Meta Pixel a Google Analytics.</p>
              </div>
            </div>

            {/* Quiz Performance */}
            <div className="border border-border/20 rounded-xl p-6 bg-card/20">
              <SectionHeader title="Sleep Score Quiz výkon" icon={BarChart2} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                  icon={Users}
                  label="Quiz leady"
                  value={String(leadSources.find(s => s.source === 'sleep-quiz')?.total ?? 0)}
                  sub="Email zachycen po kvizu"
                />
                <KpiCard
                  icon={Target}
                  label="Quiz konverze"
                  value={`${leadSources.find(s => s.source === 'sleep-quiz')?.convRate ?? '0.0'}%`}
                  sub="Koupili po kvizu"
                />
                <KpiCard
                  icon={Mail}
                  label="Chatbot leady"
                  value={String(leadSources.find(s => s.source === 'chatbot')?.total ?? 0)}
                  sub="Email zachycen v chatu"
                />
                <KpiCard
                  icon={TrendingUp}
                  label="Celková konverze"
                  value={`${convRate}%`}
                  sub={`${stats?.convertedLeads ?? 0} z ${stats?.totalLeads ?? 0} leadů`}
                  accent
                />
              </div>
            </div>

            {/* A/B Hook Variant Performance */}
            <div className="border border-border/20 rounded-xl p-6">
              <SectionHeader title="A/B Hook Varianty — Výkon" icon={BarChart2} />
              {abStats.length === 0 ? (
                <div className="text-center py-8 text-foreground/30">
                  <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Zatím žádná data. Varianty se začnou zobrazovat návštěvníkům automaticky.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-foreground/40 text-xs mb-4">Každý návštěvník vidí jednu variantu po dobu 24 hodin (24h cache). Konverze = klik na CTA tlačítko.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-foreground/40 text-xs uppercase tracking-wider border-b border-border/20">
                          <th className="text-left py-2 pr-4">Varianta</th>
                          <th className="text-right py-2 pr-4">Zobrazení</th>
                          <th className="text-right py-2 pr-4">Konverze</th>
                          <th className="text-right py-2 pr-4">CVR</th>
                          <th className="text-right py-2">Stav</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...abStats].sort((a, b) => parseFloat(b.cvr) - parseFloat(a.cvr)).map((row) => {
                          const isWinner = abStats.length > 1 && parseFloat(row.cvr) === Math.max(...abStats.map(r => parseFloat(r.cvr)));
                          const VARIANT_LABELS: Record<string, string> = {
                            quiz: '🧠 Sleep Score Quiz',
                            chatbot: '💬 Chatbot Teaser',
                            social: '⭐ Social Proof Wall',
                            btn_amber: '🟡 Button — Amber (Control)',
                            btn_green: '🟢 Button — Green',
                            btn_blue: '🔵 Button — Blue',
                            price_5: '💵 Price — $5 (Control)',
                            price_7: '💰 Price — $7 (Challenger)',
                          };
                          const variantLabel = VARIANT_LABELS[row.variant] ?? row.variant;
                          return (
                            <tr key={row.variant} className="border-b border-border/10 hover:bg-card/20">
                              <td className="py-3 pr-4 font-medium">{variantLabel}</td>
                              <td className="py-3 pr-4 text-right tabular-nums">{row.impressions.toLocaleString()}</td>
                              <td className="py-3 pr-4 text-right tabular-nums text-amber">{row.conversions.toLocaleString()}</td>
                              <td className="py-3 pr-4 text-right tabular-nums font-semibold">{row.cvr}%</td>
                              <td className="py-3 text-right">
                                {isWinner ? (
                                  <span className="text-xs bg-amber/20 text-amber px-2 py-0.5 rounded-full">🏆 Vítěz</span>
                                ) : (
                                  <span className="text-xs bg-foreground/5 text-foreground/30 px-2 py-0.5 rounded-full">Testuje se</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {abStats.length > 1 && (
                    <p className="text-foreground/30 text-xs mt-2">
                      Tip: Jakmile má vítěz &gt;100 zobrazení a &gt;2× vyšší CVR, zvažte deaktivaci slabších variant.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="border border-amber/15 rounded-xl p-6 bg-amber/5">
              <SectionHeader title="Doporučení pro zvýšení konverzí" icon={TrendingUp} />
              <div className="space-y-3">
                {[
                  { tip: "Sleep Score Quiz je nejlepší zdroj leadů — propagujte ho v Instagram Stories a v bio odkazu.", priority: "high" },
                  { tip: "Chatbot Lucy má průměrné hodnocení — sledujte konverzní míru a optimalizujte systémový prompt.", priority: "medium" },
                  { tip: "Email sekvence (7 dní) je klíčová pro upsell $27 audio packů — sledujte open rate v Brevo dashboardu.", priority: "high" },
                  { tip: "Meta Ads: Použijte quiz jako lead magnet v Lead Ads kampaních pro levnější CPL.", priority: "medium" },
                  { tip: "Testimonials: Aktivujte automatické schvalování 4-5 hvězdičkových recenzí pro sociální důkaz.", priority: "low" },
                ].map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/20">
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                      rec.priority === 'high' ? 'bg-amber/20 text-amber' :
                      rec.priority === 'medium' ? 'bg-blue-400/20 text-blue-400' :
                      'bg-foreground/10 text-foreground/40'
                    }`}>
                      {rec.priority === 'high' ? 'Vysoká' : rec.priority === 'medium' ? 'Střední' : 'Nízká'}
                    </span>
                    <p className="text-sm text-foreground/70">{rec.tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "ads" && (
          <div className="space-y-8">
            <SectionHeader title="Ads KPI Dashboard" icon={Activity} />
            <p className="text-foreground/50 text-sm">
              Manuálně zadávejte denní metriky z Meta Ads Manageru. Dashboard automaticky vypočítá CPA, ROAS a doporučení.
            </p>

            {/* Daily KPI Input Form */}
            <div className="bg-card/20 border border-border/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Přidat denní metriky</h3>
              <AdsKpiForm onSubmit={() => {}} />
            </div>

            {/* KPI Reference Table */}
            <div className="bg-card/20 border border-border/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Referenční metriky & pravidla</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-2 px-3 text-foreground/50">Metrika</th>
                      <th className="text-left py-2 px-3 text-green-400">Scale</th>
                      <th className="text-left py-2 px-3 text-amber">Optimalizovat</th>
                      <th className="text-left py-2 px-3 text-red-400">Kill</th>
                    </tr>
                  </thead>
                  <tbody className="text-foreground/70">
                    <tr className="border-b border-border/10">
                      <td className="py-2 px-3 font-medium">CPA (Cost Per Acquisition)</td>
                      <td className="py-2 px-3">&lt; $2.50</td>
                      <td className="py-2 px-3">$2.50 – $5.00</td>
                      <td className="py-2 px-3">&gt; $5.00</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-2 px-3 font-medium">CTR (Click-Through Rate)</td>
                      <td className="py-2 px-3">&gt; 2.0%</td>
                      <td className="py-2 px-3">1.0% – 2.0%</td>
                      <td className="py-2 px-3">&lt; 1.0%</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-2 px-3 font-medium">CPC (Cost Per Click)</td>
                      <td className="py-2 px-3">&lt; $0.50</td>
                      <td className="py-2 px-3">$0.50 – $1.00</td>
                      <td className="py-2 px-3">&gt; $1.00</td>
                    </tr>
                    <tr className="border-b border-border/10">
                      <td className="py-2 px-3 font-medium">ROAS (Return on Ad Spend)</td>
                      <td className="py-2 px-3">&gt; 3.0x</td>
                      <td className="py-2 px-3">1.5x – 3.0x</td>
                      <td className="py-2 px-3">&lt; 1.5x</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium">AOV (Average Order Value)</td>
                      <td className="py-2 px-3">&gt; $15</td>
                      <td className="py-2 px-3">$8 – $15</td>
                      <td className="py-2 px-3">&lt; $8</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue from DB */}
            <div className="bg-card/20 border border-border/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Tržby z objednávek (posledních 30 dní)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <p className="text-foreground/40 text-xs uppercase tracking-wider">Celkové tržby</p>
                  <p className="text-2xl font-bold text-green-400 mt-1">{fmt(stats?.totalRevenueCents || 0)}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <p className="text-foreground/40 text-xs uppercase tracking-wider">Objednávky</p>
                  <p className="text-2xl font-bold text-foreground/80 mt-1">{stats?.totalOrders || 0}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <p className="text-foreground/40 text-xs uppercase tracking-wider">AOV</p>
                  <p className="text-2xl font-bold text-amber mt-1">{fmt(stats?.totalOrders ? Math.round(stats.totalRevenueCents / stats.totalOrders) : 0)}</p>
                </div>
                <div className="bg-background/30 rounded-lg p-4 text-center">
                  <p className="text-foreground/40 text-xs uppercase tracking-wider">CVR (lead→sale)</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats?.totalLeads ? ((stats.totalOrders / stats.totalLeads) * 100).toFixed(1) : 0}%</p>
                </div>
              </div>
            </div>

            {/* Decision Framework */}
            <div className="bg-card/20 border border-border/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-foreground/80 mb-4">Rozhodovací rámec</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-400/5 border border-green-400/20">
                  <span className="text-green-400 text-lg">🟢</span>
                  <div>
                    <p className="font-medium text-green-400">SCALE — Zvyšte rozpočet o 20-30%</p>
                    <p className="text-sm text-foreground/50 mt-1">CPA &lt; $2.50, CTR &gt; 2%, ROAS &gt; 3x. Reklama funguje — zvyšte denní budget a duplikujte do nových adsetů.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber/5 border border-amber/20">
                  <span className="text-amber text-lg">🟡</span>
                  <div>
                    <p className="font-medium text-amber">OPTIMALIZOVAT — Testujte kreativy a cílení</p>
                    <p className="text-sm text-foreground/50 mt-1">CPA $2.50–$5, CTR 1–2%. Zkuste nové hooks, upravte copy, testujte jiné audiences. Nechte běžet 3-5 dní.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-400/5 border border-red-400/20">
                  <span className="text-red-400 text-lg">🔴</span>
                  <div>
                    <p className="font-medium text-red-400">KILL — Vypněte reklamu okamžitě</p>
                    <p className="text-sm text-foreground/50 mt-1">CPA &gt; $5, CTR &lt; 1%, ROAS &lt; 1.5x po 3+ dnech. Přestaňte utrácet a začněte od nuly s novým kreativem.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Ads KPI Form ────────────────────────────────────────────────────────────

function AdsKpiForm({ onSubmit }: { onSubmit: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    spend: '',
    impressions: '',
    clicks: '',
    purchases: '',
    revenue: '',
  });

  const calculated = {
    ctr: Number(formData.impressions) > 0 ? (Number(formData.clicks) / Number(formData.impressions) * 100).toFixed(2) : '—',
    cpc: Number(formData.clicks) > 0 ? (Number(formData.spend) / Number(formData.clicks)).toFixed(2) : '—',
    cpa: Number(formData.purchases) > 0 ? (Number(formData.spend) / Number(formData.purchases)).toFixed(2) : '—',
    roas: Number(formData.spend) > 0 ? (Number(formData.revenue) / Number(formData.spend)).toFixed(2) : '—',
    profit: (Number(formData.revenue) - Number(formData.spend)).toFixed(2),
  };

  const getColor = (metric: string, value: string) => {
    if (value === '—') return 'text-foreground/40';
    const v = parseFloat(value);
    if (metric === 'cpa') return v < 2.5 ? 'text-green-400' : v < 5 ? 'text-amber' : 'text-red-400';
    if (metric === 'ctr') return v > 2 ? 'text-green-400' : v > 1 ? 'text-amber' : 'text-red-400';
    if (metric === 'cpc') return v < 0.5 ? 'text-green-400' : v < 1 ? 'text-amber' : 'text-red-400';
    if (metric === 'roas') return v > 3 ? 'text-green-400' : v > 1.5 ? 'text-amber' : 'text-red-400';
    if (metric === 'profit') return v > 0 ? 'text-green-400' : 'text-red-400';
    return 'text-foreground/70';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'date', label: 'Datum', type: 'date' },
          { key: 'spend', label: 'Spend ($)', type: 'number' },
          { key: 'impressions', label: 'Impressions', type: 'number' },
          { key: 'clicks', label: 'Clicks', type: 'number' },
          { key: 'purchases', label: 'Purchases', type: 'number' },
          { key: 'revenue', label: 'Revenue ($)', type: 'number' },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-xs text-foreground/40 uppercase tracking-wider">{field.label}</label>
            <input
              type={field.type}
              value={formData[field.key as keyof typeof formData]}
              onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
              className="w-full mt-1 px-3 py-2 bg-background/40 border border-border/20 rounded-lg text-sm text-foreground/80 focus:outline-none focus:border-amber/40"
            />
          </div>
        ))}
      </div>

      {/* Calculated metrics */}
      {Number(formData.spend) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
          {[
            { key: 'ctr', label: 'CTR', suffix: '%' },
            { key: 'cpc', label: 'CPC', prefix: '$' },
            { key: 'cpa', label: 'CPA', prefix: '$' },
            { key: 'roas', label: 'ROAS', suffix: 'x' },
            { key: 'profit', label: 'Profit', prefix: '$' },
          ].map((m) => {
            const val = calculated[m.key as keyof typeof calculated];
            return (
              <div key={m.key} className="bg-background/30 rounded-lg p-3 text-center">
                <p className="text-foreground/40 text-xs uppercase tracking-wider">{m.label}</p>
                <p className={`text-xl font-bold mt-1 ${getColor(m.key, val)}`}>
                  {m.prefix || ''}{val}{m.suffix || ''}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
