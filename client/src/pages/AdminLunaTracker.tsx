/**
 * Luna Content Performance Tracker
 * Full analytics dashboard for tracking Luna's Instagram post performance.
 * Features: KPI cards, trend charts, top posts, format/pillar breakdown, post table, add/edit modal, CSV export.
 */

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import {
  TrendingUp, Eye, Heart, MessageCircle, Bookmark, Share2, Link, Mail,
  ShoppingCart, Users, Zap, Download, Plus, Pencil, Trash2, Sparkles,
  ChevronUp, ChevronDown, RefreshCw, Moon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Format = "reel" | "carousel" | "post" | "story" | "live";
type Pillar = "education" | "emotion" | "promotion" | "social_proof" | "entertainment";
type CtaType = "dm_keyword" | "link_in_bio" | "comment" | "save" | "share" | "none";

const FORMAT_COLORS: Record<Format, string> = {
  reel: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  carousel: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  post: "bg-green-500/20 text-green-300 border-green-500/30",
  story: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  live: "bg-red-500/20 text-red-300 border-red-500/30",
};

const PILLAR_COLORS: Record<Pillar, string> = {
  education: "#6366f1",
  emotion: "#ec4899",
  promotion: "#f59e0b",
  social_proof: "#10b981",
  entertainment: "#8b5cf6",
};

const VIRALITY_COLOR = (score: number) => {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
};

// ─── Empty post form ──────────────────────────────────────────────────────────

const emptyForm = {
  format: "reel" as Format,
  topic: "",
  caption: "",
  publishedAt: new Date().toISOString().split("T")[0],
  pillar: "education" as Pillar,
  ctaType: "link_in_bio" as CtaType,
  ctaKeyword: "",
  reach: 0, impressions: 0, plays: 0, watchThroughRate: 0,
  likes: 0, comments: 0, saves: 0, shares: 0,
  profileVisits: 0, linkClicks: 0, dmsReceived: 0, dmConversions: 0,
  attributedRevenueCents: 0, newFollowers: 0, unfollows: 0,
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon: Icon, color }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <Card className="bg-card/50 border-border/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg bg-current/10 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminLunaTracker() {
  // Queries
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [filterPillar, setFilterPillar] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"publishedAt" | "reach" | "engagementRateBp" | "viralityScore">("publishedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | undefined>(undefined);
  const [form, setForm] = useState({ ...emptyForm });

  // Follower snapshot modal
  const [showFollowerModal, setShowFollowerModal] = useState(false);
  const [followerForm, setFollowerForm] = useState({ followerCount: 0, followingCount: 0, totalPosts: 0, snapshotDate: new Date().toISOString().split("T")[0] });

  // Queries
  const kpisQuery = trpc.luna.tracker.kpis.useQuery({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
  const trendsQuery = trpc.luna.tracker.trends.useQuery({ weeks: 12 });
  const topPostsQuery = trpc.luna.tracker.topPosts.useQuery({ metric: "viralityScore", limit: 5 });
  const formatBreakdownQuery = trpc.luna.tracker.formatBreakdown.useQuery();
  const pillarBreakdownQuery = trpc.luna.tracker.pillarBreakdown.useQuery();
  const followerHistoryQuery = trpc.luna.follower.history.useQuery({ days: 90 });
  const listQuery = trpc.luna.tracker.list.useQuery({
    limit: 50, offset: 0,
    format: filterFormat !== "all" ? filterFormat as Format : undefined,
    pillar: filterPillar !== "all" ? filterPillar as Pillar : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    search: search || undefined,
    sortBy,
    sortDir,
  });
  const csvQuery = trpc.luna.tracker.csvExport.useQuery({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }, { enabled: false });

  // Mutations
  const createMutation = trpc.luna.tracker.create.useMutation({
    onSuccess: () => { toast.success("Post added ✓"); setShowModal(false); listQuery.refetch(); kpisQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.luna.tracker.update.useMutation({
    onSuccess: () => { toast.success("Post updated ✓"); setShowModal(false); listQuery.refetch(); kpisQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.luna.tracker.delete.useMutation({
    onSuccess: () => { toast.success("Post deleted"); listQuery.refetch(); kpisQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const scoreMutation = trpc.luna.tracker.scorePost.useMutation({
    onSuccess: (data) => { toast.success(data.aiInsight); listQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const addSnapshotMutation = trpc.luna.follower.addSnapshot.useMutation({
    onSuccess: () => { toast.success("Snapshot saved ✓"); setShowFollowerModal(false); followerHistoryQuery.refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const kpis = kpisQuery.data;
  const posts = listQuery.data?.posts ?? [];

  // CSV download
  const handleCsvExport = async () => {
    const result = await csvQuery.refetch();
    if (!result.data) return;
    const blob = new Blob([result.data.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `luna-performance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${result.data.count} posts`);
  };

  // Open modal for new post
  const openCreate = () => {
    setEditId(undefined);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  // Open modal for edit
  const openEdit = (post: typeof posts[number]) => {
    setEditId(post.id as number);
    setForm({
      format: post.format as Format,
      topic: post.topic,
      caption: post.caption ?? "",
      publishedAt: new Date(post.publishedAt).toISOString().split("T")[0],
      pillar: post.pillar as Pillar,
      ctaType: post.ctaType as CtaType,
      ctaKeyword: post.ctaKeyword ?? "",
      reach: post.reach, impressions: post.impressions, plays: post.plays ?? 0,
      watchThroughRate: post.watchThroughRate ?? 0,
      likes: post.likes, comments: post.comments, saves: post.saves, shares: post.shares,
      profileVisits: post.profileVisits, linkClicks: post.linkClicks,
      dmsReceived: post.dmsReceived, dmConversions: post.dmConversions,
      attributedRevenueCents: post.attributedRevenueCents, newFollowers: post.newFollowers,
      unfollows: post.unfollows ?? 0,
    });
    setShowModal(true);
  };

  const handleSubmit = () => {
    const payload = { ...form, publishedAt: form.publishedAt + "T12:00:00Z" };
    if (editId !== undefined) {
      updateMutation.mutate({ id: editId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
    setEditId(undefined);
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) => {
    if (sortBy !== col) return null;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;
  };

  // Trend chart data
  const trendData = (trendsQuery.data ?? []).map(r => ({
    week: r.week,
    reach: r.reach ?? 0,
    engagements: r.engagements ?? 0,
    linkClicks: r.linkClicks ?? 0,
    dmsReceived: r.dmsReceived ?? 0,
    newFollowers: r.newFollowers ?? 0,
    revenue: ((r.revenueCents ?? 0) / 100),
    virality: Math.round(r.avgVirality ?? 0),
  }));

  // Follower growth data
  const followerData = (followerHistoryQuery.data ?? []).map(s => ({
    date: new Date(s.snapshotDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    followers: s.followerCount,
  }));

  // Format breakdown for radar chart
  const formatRadarData = useMemo(() => {
    const data = formatBreakdownQuery.data ?? [];
    return ["reel", "carousel", "post", "story"].map(fmt => {
      const row = data.find(r => r.format === fmt);
      return {
        format: fmt.charAt(0).toUpperCase() + fmt.slice(1),
        reach: Math.round(row?.avgReach ?? 0),
        engagement: ((row?.avgEngagementBp ?? 0) / 100),
        virality: Math.round(row?.avgViralityScore ?? 0),
      };
    });
  }, [formatBreakdownQuery.data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Moon className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Luna Performance Tracker</h2>
            <p className="text-sm text-muted-foreground">Content analytics & ROI measurement</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFollowerModal(true)}>
            <Users className="w-4 h-4 mr-2" />Follower Snapshot
          </Button>
          <Button variant="outline" size="sm" onClick={handleCsvExport}>
            <Download className="w-4 h-4 mr-2" />Export CSV
          </Button>
          <Button size="sm" onClick={openCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />Add Post
          </Button>
        </div>
      </div>

      {/* Date filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 w-36 text-xs" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 w-36 text-xs" />
        </div>
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(""); setDateTo(""); }}>
            <RefreshCw className="w-3 h-3 mr-1" />Clear
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard title="Total Posts" value={kpis?.totalPosts ?? 0} icon={TrendingUp} color="text-purple-400" />
        <KpiCard title="Total Reach" value={(kpis?.totalReach ?? 0).toLocaleString()} icon={Eye} color="text-blue-400" />
        <KpiCard title="Engagements" value={(kpis?.totalEngagements ?? 0).toLocaleString()} icon={Heart} color="text-pink-400" />
        <KpiCard title="Link Clicks" value={(kpis?.totalLinkClicks ?? 0).toLocaleString()} icon={Link} color="text-green-400" />
        <KpiCard title="DMs → Sales" value={`${kpis?.totalDmConversions ?? 0}`} sub={`${kpis?.dmConversionRate ?? "0.0"}% conv.`} icon={Mail} color="text-amber-400" />
        <KpiCard title="Revenue" value={`$${((kpis?.totalRevenueCents ?? 0) / 100).toFixed(2)}`} sub={`${kpis?.totalNewFollowers ?? 0} new followers`} icon={ShoppingCart} color="text-emerald-400" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard title="Avg Engagement Rate" value={`${kpis?.avgEngagementRate ?? "0.00"}%`} icon={Zap} color="text-yellow-400" />
        <KpiCard title="Avg Virality Score" value={`${kpis?.avgViralityScore ?? 0}/100`} icon={Sparkles} color="text-violet-400" />
        <KpiCard title="Repost Candidates" value={kpis?.repostCandidates ?? 0} sub="score ≥ 70" icon={RefreshCw} color="text-cyan-400" />
        <KpiCard title="DMs Received" value={(kpis?.totalDmsReceived ?? 0).toLocaleString()} icon={MessageCircle} color="text-orange-400" />
      </div>

      {/* Charts Row 1: Trends */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Reach & Engagements</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                <Tooltip contentStyle={{ background: "oklch(0.15 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", borderRadius: "8px" }} />
                <Legend />
                <Line type="monotone" dataKey="reach" stroke="#6366f1" strokeWidth={2} dot={false} name="Reach" />
                <Line type="monotone" dataKey="engagements" stroke="#ec4899" strokeWidth={2} dot={false} name="Engagements" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Link Clicks & DMs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                <Tooltip contentStyle={{ background: "oklch(0.15 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", borderRadius: "8px" }} />
                <Legend />
                <Bar dataKey="linkClicks" fill="#10b981" name="Link Clicks" radius={[2, 2, 0, 0]} />
                <Bar dataKey="dmsReceived" fill="#f59e0b" name="DMs Received" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Follower Growth + Format Radar */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Follower Growth (90 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {followerData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                No snapshots yet — add your first follower snapshot
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={followerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.02 260 / 0.3)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "oklch(0.6 0.02 260)" }} />
                  <Tooltip contentStyle={{ background: "oklch(0.15 0.02 260)", border: "1px solid oklch(0.3 0.02 260)", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="followers" stroke="#a78bfa" strokeWidth={2} dot={false} name="Followers" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Format Performance Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={formatRadarData}>
                <PolarGrid stroke="oklch(0.3 0.02 260 / 0.4)" />
                <PolarAngleAxis dataKey="format" tick={{ fontSize: 11, fill: "oklch(0.7 0.02 260)" }} />
                <PolarRadiusAxis tick={{ fontSize: 9, fill: "oklch(0.5 0.02 260)" }} />
                <Radar name="Virality" dataKey="virality" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.3} />
                <Radar name="Engagement%" dataKey="engagement" stroke="#ec4899" fill="#ec4899" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pillar Breakdown */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Content Pillar Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {(pillarBreakdownQuery.data ?? []).map(row => (
              <div key={row.pillar} className="bg-background/30 rounded-lg p-3 border border-border/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PILLAR_COLORS[row.pillar as Pillar] }} />
                  <span className="text-xs font-medium capitalize">{row.pillar?.replace("_", " ")}</span>
                </div>
                <p className="text-lg font-bold">{row.posts}</p>
                <p className="text-xs text-muted-foreground">posts</p>
                <p className="text-sm font-semibold text-purple-400 mt-1">{Math.round(row.avgViralityScore ?? 0)}/100</p>
                <p className="text-xs text-muted-foreground">avg virality</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">🏆 Top 5 Posts by Virality Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(topPostsQuery.data ?? []).map((post, i) => (
              <div key={post.id} className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/20">
                <span className="text-lg font-bold text-muted-foreground w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{post.topic}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={`text-xs ${FORMAT_COLORS[post.format as Format]}`}>{post.format}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${VIRALITY_COLOR(post.viralityScore ?? 0)}`}>{post.viralityScore ?? 0}</p>
                  <p className="text-xs text-muted-foreground">virality</p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{(post.reach).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">reach</p>
                </div>
              </div>
            ))}
            {(topPostsQuery.data ?? []).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">No posts yet — add your first post above</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Post Table */}
      <Card className="bg-card/50 border-border/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">All Posts ({listQuery.data?.total ?? 0})</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Input
                placeholder="Search topic..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 w-40 text-xs"
              />
              <Select value={filterFormat} onValueChange={setFilterFormat}>
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All formats</SelectItem>
                  {["reel", "carousel", "post", "story", "live"].map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPillar} onValueChange={setFilterPillar}>
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue placeholder="Pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All pillars</SelectItem>
                  {["education", "emotion", "promotion", "social_proof", "entertainment"].map(p => (
                    <SelectItem key={p} value={p}>{p.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30 text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium">Date</th>
                  <th className="text-left py-2 pr-3 font-medium">Topic</th>
                  <th className="text-left py-2 pr-3 font-medium">Format</th>
                  <th className="text-right py-2 pr-3 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("reach")}>
                    Reach<SortIcon col="reach" />
                  </th>
                  <th className="text-right py-2 pr-3 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("engagementRateBp")}>
                    Eng%<SortIcon col="engagementRateBp" />
                  </th>
                  <th className="text-right py-2 pr-3 font-medium">Saves</th>
                  <th className="text-right py-2 pr-3 font-medium">Clicks</th>
                  <th className="text-right py-2 pr-3 font-medium">DMs</th>
                  <th className="text-right py-2 pr-3 font-medium">Rev</th>
                  <th className="text-right py-2 pr-3 font-medium cursor-pointer hover:text-foreground" onClick={() => toggleSort("viralityScore")}>
                    Score<SortIcon col="viralityScore" />
                  </th>
                  <th className="text-right py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(post => (
                  <tr key={post.id} className="border-b border-border/10 hover:bg-background/20 transition-colors">
                    <td className="py-2 pr-3 text-muted-foreground whitespace-nowrap">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="py-2 pr-3 max-w-[160px]">
                      <p className="truncate font-medium">{post.topic}</p>
                      {post.aiInsight && (
                        <p className="text-muted-foreground truncate text-[10px] mt-0.5 italic">{post.aiInsight}</p>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge variant="outline" className={`text-[10px] ${FORMAT_COLORS[post.format as Format]}`}>{post.format}</Badge>
                    </td>
                    <td className="py-2 pr-3 text-right">{post.reach.toLocaleString()}</td>
                    <td className="py-2 pr-3 text-right">{(post.engagementRateBp / 100).toFixed(1)}%</td>
                    <td className="py-2 pr-3 text-right">{post.saves}</td>
                    <td className="py-2 pr-3 text-right">{post.linkClicks}</td>
                    <td className="py-2 pr-3 text-right">{post.dmsReceived}</td>
                    <td className="py-2 pr-3 text-right">${(post.attributedRevenueCents / 100).toFixed(0)}</td>
                    <td className="py-2 pr-3 text-right">
                      <span className={`font-bold ${VIRALITY_COLOR(post.viralityScore ?? 0)}`}>{post.viralityScore ?? 0}</span>
                    </td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => scoreMutation.mutate({ id: post.id })} title="AI Score">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(post)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300" onClick={() => {
                          if (confirm("Delete this post?")) deleteMutation.mutate({ id: post.id });
                        }}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={11} className="py-8 text-center text-muted-foreground">
                      No posts tracked yet — click "Add Post" to start
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Post Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Post" : "Add New Post"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Basic Info */}
            <div className="col-span-2">
              <Label className="text-xs">Topic / Hook *</Label>
              <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Why You Wake at 3AM" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Published Date *</Label>
              <Input type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Format *</Label>
              <Select value={form.format} onValueChange={v => setForm(f => ({ ...f, format: v as Format }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["reel", "carousel", "post", "story", "live"].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Content Pillar</Label>
              <Select value={form.pillar} onValueChange={v => setForm(f => ({ ...f, pillar: v as Pillar }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["education", "emotion", "promotion", "social_proof", "entertainment"].map(p => <SelectItem key={p} value={p}>{p.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">CTA Type</Label>
              <Select value={form.ctaType} onValueChange={v => setForm(f => ({ ...f, ctaType: v as CtaType }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["dm_keyword", "link_in_bio", "comment", "save", "share", "none"].map(c => <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.ctaType === "dm_keyword" && (
              <div>
                <Label className="text-xs">CTA Keyword</Label>
                <Input value={form.ctaKeyword} onChange={e => setForm(f => ({ ...f, ctaKeyword: e.target.value }))} placeholder="e.g. SLEEP" className="mt-1" />
              </div>
            )}
            <div className="col-span-2">
              <Label className="text-xs">Caption (optional)</Label>
              <Textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={2} className="mt-1 text-xs" />
            </div>

            {/* Reach & Visibility */}
            <div className="col-span-2 border-t border-border/30 pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">📊 Reach & Visibility</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "reach", label: "Reach" },
                  { key: "impressions", label: "Impressions" },
                  { key: "plays", label: "Plays (Reels)" },
                  { key: "watchThroughRate", label: "Watch-Through %" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" min={0} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} className="mt-1 h-8 text-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Engagement */}
            <div className="col-span-2 border-t border-border/30 pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">❤️ Engagement</p>
              <div className="grid grid-cols-4 gap-3">
                {["likes", "comments", "saves", "shares"].map(key => (
                  <div key={key}>
                    <Label className="text-xs capitalize">{key}</Label>
                    <Input type="number" min={0} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} className="mt-1 h-8 text-xs" />
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion */}
            <div className="col-span-2 border-t border-border/30 pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2">💰 Conversion</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "profileVisits", label: "Profile Visits" },
                  { key: "linkClicks", label: "Link Clicks" },
                  { key: "dmsReceived", label: "DMs Received" },
                  { key: "dmConversions", label: "DM Conversions" },
                  { key: "attributedRevenueCents", label: "Revenue (cents)" },
                  { key: "newFollowers", label: "New Followers" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-xs">{label}</Label>
                    <Input type="number" min={0} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))} className="mt-1 h-8 text-xs" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
              {editId ? "Update Post" : "Add Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follower Snapshot Modal */}
      <Dialog open={showFollowerModal} onOpenChange={setShowFollowerModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Follower Snapshot</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Date</Label>
              <Input type="date" value={followerForm.snapshotDate} onChange={e => setFollowerForm(f => ({ ...f, snapshotDate: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Follower Count</Label>
              <Input type="number" min={0} value={followerForm.followerCount} onChange={e => setFollowerForm(f => ({ ...f, followerCount: parseInt(e.target.value) || 0 }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Following Count</Label>
              <Input type="number" min={0} value={followerForm.followingCount} onChange={e => setFollowerForm(f => ({ ...f, followingCount: parseInt(e.target.value) || 0 }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Total Posts Published</Label>
              <Input type="number" min={0} value={followerForm.totalPosts} onChange={e => setFollowerForm(f => ({ ...f, totalPosts: parseInt(e.target.value) || 0 }))} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowerModal(false)}>Cancel</Button>
            <Button onClick={() => addSnapshotMutation.mutate(followerForm)} disabled={addSnapshotMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
              Save Snapshot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
