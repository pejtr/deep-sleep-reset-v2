import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  Instagram, Calendar, BarChart2, Settings, Play, RefreshCw,
  CheckCircle, XCircle, Clock, Zap, TrendingUp, Eye, Heart,
  MessageCircle, Bookmark, ChevronDown, ChevronUp, Loader2, Plus,
  FlaskConical, Hash, Repeat2, Trophy, ArrowUpRight, Bot, Copy, ExternalLink, Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  published: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
  cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const TYPE_COLORS: Record<string, string> = {
  post: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  story: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminInstagram() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"calendar" | "analytics" | "abtests" | "hashtags" | "reposts" | "settings" | "luna">("calendar");
  const [expandedPost, setExpandedPost] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [newPostType, setNewPostType] = useState<"post" | "story">("post");

  const utils = trpc.useUtils();

  // Queries
  const { data: settings, isLoading: settingsLoading } = trpc.igAutopilot.getSettings.useQuery();
  const { data: scheduledPosts, isLoading: postsLoading } = trpc.igAutopilot.getScheduledPosts.useQuery({ limit: 30 });
  const { data: analytics } = trpc.igAutopilot.getAnalytics.useQuery({ limit: 20 });
  const { data: topTopics } = trpc.igAutopilot.getTopTopics.useQuery();
  const { data: topics } = trpc.igAutopilot.getTopics.useQuery();
  const { data: abTests } = trpc.igAutopilot.getAbTests.useQuery();
  const { data: hashtagStats } = trpc.igAutopilot.getHashtagStats.useQuery();
  const { data: repostQueue } = trpc.igAutopilot.getRepostQueue.useQuery();
  const { data: optimizedHashtags } = trpc.igAutopilot.getOptimizedHashtags.useQuery({ count: 20 });

  // Mutations
  const updateSettings = trpc.igAutopilot.updateSettings.useMutation({
    onSuccess: () => { utils.igAutopilot.getSettings.invalidate(); toast.success("Settings saved"); },
  });

  const generateWeek = trpc.igAutopilot.generateWeek.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getScheduledPosts.invalidate();
      const scheduled = data.results.filter(r => r.status === "scheduled").length;
      toast.success(`Generated ${scheduled} posts for the week! Content is ready in the calendar.`);
      setGenerating(false);
    },
    onError: (e) => { toast.error(e.message); setGenerating(false); },
  });

  const generateAndSchedule = trpc.igAutopilot.generateAndSchedule.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getScheduledPosts.invalidate();
      toast.success(`Generated: ${data.topic} — Post added to calendar.`);
    },
    onError: (e) => toast.error(e.message),
  });

  const publishDue = trpc.igAutopilot.publishDue.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getScheduledPosts.invalidate();
      toast.success(`Published ${data.published} post(s)`);
    },
  });

  const syncAnalytics = trpc.igAutopilot.syncAnalytics.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getAnalytics.invalidate();
      utils.igAutopilot.getTopTopics.invalidate();
      toast.success(`Synced ${data.synced} post(s)`);
    },
  });

  const cancelPost = trpc.igAutopilot.cancelPost.useMutation({
    onSuccess: () => utils.igAutopilot.getScheduledPosts.invalidate(),
  });

  const createAbTest = trpc.igAutopilot.createAbTest.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getAbTests.invalidate();
      utils.igAutopilot.getScheduledPosts.invalidate();
      toast.success(`A/B test created for topic: ${data.topic}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const evaluateAbTests = trpc.igAutopilot.evaluateAbTests.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getAbTests.invalidate();
      toast.success(`Evaluated ${data.evaluated} A/B test(s)`);
    },
  });

  const scanForReposts = trpc.igAutopilot.scanForReposts.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getRepostQueue.invalidate();
      toast.success(`Queued ${data.queued} post(s) for reposting`);
    },
  });

  const publishDueReposts = trpc.igAutopilot.publishDueReposts.useMutation({
    onSuccess: (data) => {
      utils.igAutopilot.getRepostQueue.invalidate();
      toast.success(`Republished ${data.published} post(s)`);
    },
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-amber-400 w-8 h-8" /></div>;
  if (!user || user.role !== "admin") { navigate("/"); return null; }

  const handleGenerateWeek = () => {
    setGenerating(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    generateWeek.mutate({
      startDate: startDate.toISOString().split("T")[0]!,
      postHourUtc: 9,
      storyHourUtc: 17,
    });
  };

  const handleGenerateNow = () => {
    const scheduledAt = new Date();
    scheduledAt.setMinutes(scheduledAt.getMinutes() + 5);
    generateAndSchedule.mutate({ type: newPostType, scheduledAt: scheduledAt.toISOString() });
  };

  const pendingCount = scheduledPosts?.filter(p => p.status === "pending").length || 0;
  const publishedCount = scheduledPosts?.filter(p => p.status === "published").length || 0;
  const dueNow = scheduledPosts?.filter(p => p.status === "pending" && new Date(p.scheduledAt) <= new Date()).length || 0;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d1220]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Instagram className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-white">Instagram Autopilot</h1>
              <p className="text-xs text-white/40">@deep.sleep.reset · AI-powered content engine</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white/40">Autopilot</span>
                <Switch
                  checked={settings.enabled === 1}
                  onCheckedChange={(v) => updateSettings.mutate({ enabled: v ? 1 : 0 })}
                />
                <span className={settings.enabled === 1 ? "text-green-400" : "text-white/40"}>
                  {settings.enabled === 1 ? "ON" : "OFF"}
                </span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/dm-autoresponder")} className="border-purple-500/40 text-purple-300 hover:text-white hover:border-purple-400">
              💬 DM Auto-Responder
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin")} className="border-white/20 text-white/60 hover:text-white">
              ← Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Scheduled", value: pendingCount, icon: Clock, color: "text-amber-400" },
            { label: "Published", value: publishedCount, icon: CheckCircle, color: "text-green-400" },
            { label: "Due Now", value: dueNow, icon: Zap, color: "text-red-400" },
            { label: "Topics Tracked", value: topTopics?.length || 0, icon: TrendingUp, color: "text-blue-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/50 text-xs">{label}</span>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={handleGenerateWeek}
            disabled={generating || generateWeek.isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
          >
            {generating || generateWeek.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating week...</>
              : <><Calendar className="w-4 h-4 mr-2" /> Generate Full Week</>}
          </Button>

          <div className="flex gap-2">
            <Select value={newPostType} onValueChange={(v) => setNewPostType(v as "post" | "story")}>
              <SelectTrigger className="w-28 bg-white/5 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="post">Post</SelectItem>
                <SelectItem value="story">Story</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerateNow}
              disabled={generateAndSchedule.isPending}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {generateAndSchedule.isPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><Plus className="w-4 h-4 mr-1" /> Generate 1</>}
            </Button>
          </div>

          {dueNow > 0 && (
            <Button
              onClick={() => publishDue.mutate()}
              disabled={publishDue.isPending}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              {publishDue.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
                : <><Play className="w-4 h-4 mr-2" />Publish {dueNow} Due</>}
            </Button>
          )}

          <Button
            onClick={() => syncAnalytics.mutate()}
            disabled={syncAnalytics.isPending}
            variant="outline"
            className="border-white/20 text-white/60 hover:text-white ml-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncAnalytics.isPending ? "animate-spin" : ""}`} />
            Sync Analytics
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
          {(["calendar", "analytics", "abtests", "hashtags", "reposts", "settings", "luna"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {tab === "calendar" && <Calendar className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "analytics" && <BarChart2 className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "abtests" && <FlaskConical className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "hashtags" && <Hash className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "reposts" && <Repeat2 className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "settings" && <Settings className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "luna" && <Bot className="w-3.5 h-3.5 inline mr-1.5" />}
              {tab === "abtests" ? "A/B Tests" : tab === "hashtags" ? "Hashtags" : tab === "reposts" ? "Reposts" : tab === "luna" ? "Luna Bot" : tab}
            </button>
          ))}
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-3">
            {postsLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-amber-400 w-6 h-6" />
              </div>
            )}
            {!postsLoading && (!scheduledPosts || scheduledPosts.length === 0) && (
              <div className="text-center py-16 text-white/30">
                <Instagram className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No posts scheduled yet</p>
                <p className="text-sm mt-1">Click "Generate Full Week" to create 7 days of AI content</p>
              </div>
            )}
            {scheduledPosts?.map(post => (
              <Card key={post.id} className="bg-white/5 border-white/10 overflow-hidden">
                <CardContent className="p-0">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  >
                    {/* Image preview */}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt={post.topic}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[post.type]}`}>
                          {post.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[post.status]}`}>
                          {post.status}
                        </span>
                        {post.performanceScore !== null && (
                          <span className="text-xs text-amber-400">⭐ {post.performanceScore}% engagement</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white truncate">{post.topic}</p>
                      <p className="text-xs text-white/40">{formatDate(post.scheduledAt)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {post.igPermalink && (
                        <a
                          href={post.igPermalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs text-blue-400 hover:underline"
                        >
                          View ↗
                        </a>
                      )}
                      {post.status === "pending" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); cancelPost.mutate({ id: post.id }); }}
                          className="text-red-400/60 hover:text-red-400 hover:bg-red-400/10 h-7 px-2"
                        >
                          Cancel
                        </Button>
                      )}
                      {expandedPost === post.id
                        ? <ChevronUp className="w-4 h-4 text-white/30" />
                        : <ChevronDown className="w-4 h-4 text-white/30" />}
                    </div>
                  </div>

                  {/* Expanded caption */}
                  {expandedPost === post.id && post.caption && (
                    <div className="px-4 pb-4 border-t border-white/10 pt-3">
                      <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Caption</p>
                      <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {/* Top Topics */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  Top Performing Topics (AI Learning)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!topTopics || topTopics.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">No analytics data yet. Publish posts and sync to start learning.</p>
                ) : (
                  <div className="space-y-3">
                    {topTopics.map((topic, i) => (
                      <div key={topic.id} className="flex items-center gap-3">
                        <span className="text-white/30 text-xs w-4">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white">{topic.label}</span>
                            <span className="text-xs text-amber-400 font-medium">{topic.avgEngagement}%</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                              style={{ width: `${Math.min(topic.avgEngagement * 5, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-white/30">{topic.count} posts</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Analytics */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  Recent Post Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analytics || analytics.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">No performance data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {analytics.slice(0, 10).map(a => (
                      <div key={a.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{a.topic}</p>
                          <p className="text-xs text-white/30">{formatDate(a.fetchedAt)}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/50 shrink-0">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{a.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-blue-400" />{a.comments}</span>
                          <span className="flex items-center gap-1"><Bookmark className="w-3 h-3 text-amber-400" />{a.saves}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-green-400" />{a.reach}</span>
                          <span className="text-amber-400 font-medium">{a.engagementRate}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* A/B Tests Tab */}
        {activeTab === "abtests" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">A/B Caption Testing</h2>
                <p className="text-white/40 text-sm">Generate 2 caption variants for the same post — AI picks the winner after 48h</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => evaluateAbTests.mutate()}
                  disabled={evaluateAbTests.isPending}
                  variant="outline"
                  className="border-white/20 text-white/60 hover:text-white"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Evaluate Tests
                </Button>
                <Button
                  onClick={() => {
                    const scheduledAt = new Date();
                    scheduledAt.setDate(scheduledAt.getDate() + 1);
                    scheduledAt.setUTCHours(9, 0, 0, 0);
                    createAbTest.mutate({ scheduledAt: scheduledAt.toISOString(), offsetMinutes: 60 });
                  }}
                  disabled={createAbTest.isPending}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                >
                  {createAbTest.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                    : <><FlaskConical className="w-4 h-4 mr-2" />New A/B Test</>}
                </Button>
              </div>
            </div>

            {!abTests || abTests.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No A/B tests yet</p>
                <p className="text-sm mt-1">Create a test to compare two caption variants and find what resonates most</p>
              </div>
            ) : (
              <div className="space-y-3">
                {abTests.map(test => (
                  <Card key={test.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-white">{test.topic}</p>
                          <p className="text-xs text-white/40">Evaluate: {formatDate(test.evaluateAt)}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full border ${
                          test.status === "running" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                          test.status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                          "bg-gray-500/20 text-gray-400 border-gray-500/30"
                        }`}>{test.status}</span>
                      </div>
                      {test.status === "completed" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div className={`p-3 rounded-lg border ${
                            test.winner === "a" ? "border-green-500/40 bg-green-500/10" : "border-white/10 bg-white/5"
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/50">Variant A</span>
                              {test.winner === "a" && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <p className="text-lg font-bold text-white">{test.engagementA ?? 0}%</p>
                            <p className="text-xs text-white/30">engagement rate</p>
                          </div>
                          <div className={`p-3 rounded-lg border ${
                            test.winner === "b" ? "border-green-500/40 bg-green-500/10" : "border-white/10 bg-white/5"
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/50">Variant B</span>
                              {test.winner === "b" && <Trophy className="w-3.5 h-3.5 text-amber-400" />}
                            </div>
                            <p className="text-lg font-bold text-white">{test.engagementB ?? 0}%</p>
                            <p className="text-xs text-white/30">engagement rate</p>
                          </div>
                        </div>
                      )}
                      {test.status === "running" && (
                        <div className="grid grid-cols-2 gap-3">
                          {["Variant A", "Variant B"].map(v => (
                            <div key={v} className="p-3 rounded-lg border border-white/10 bg-white/5">
                              <p className="text-xs text-white/50 mb-1">{v}</p>
                              <p className="text-sm text-white/40">Waiting for data...</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hashtag Optimizer Tab */}
        {activeTab === "hashtags" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-white font-semibold">Hashtag Optimizer</h2>
              <p className="text-white/40 text-sm">AI tracks which hashtags drive the most reach and auto-selects the best ones</p>
            </div>

            {/* AI Recommended Set */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  AI-Optimized Hashtag Set (Next Post)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!optimizedHashtags ? (
                  <div className="flex items-center gap-2 text-white/30 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating optimal hashtags...
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {optimizedHashtags.hashtags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-white/30">These hashtags are automatically appended to AI-generated captions</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hashtag Performance Table */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" />
                  Hashtag Performance Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hashtagStats || hashtagStats.length === 0 ? (
                  <p className="text-white/30 text-sm text-center py-4">No hashtag data yet. Publish posts and sync analytics to start tracking.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-2 text-xs text-white/30 uppercase tracking-wider pb-2 border-b border-white/10">
                      <span>Hashtag</span>
                      <span className="text-right">Used</span>
                      <span className="text-right">Avg Reach</span>
                      <span className="text-right">Avg Eng.</span>
                    </div>
                    {hashtagStats.map(h => (
                      <div key={h.id} className="grid grid-cols-4 gap-2 text-sm py-1.5 border-b border-white/5 last:border-0">
                        <span className="text-amber-300 truncate">{h.hashtag}</span>
                        <span className="text-right text-white/50">{h.timesUsed}x</span>
                        <span className="text-right text-white/70">{h.avgReach.toLocaleString()}</span>
                        <span className="text-right text-amber-400 font-medium">{h.avgEngagementRate}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reposts Tab */}
        {activeTab === "reposts" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold">Auto-Repost Top Performers</h2>
                <p className="text-white/40 text-sm">Posts with 10%+ engagement are automatically queued for reposting every 30 days</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => publishDueReposts.mutate()}
                  disabled={publishDueReposts.isPending}
                  className="bg-green-600 hover:bg-green-500 text-white"
                >
                  {publishDueReposts.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing...</>
                    : <><Play className="w-4 h-4 mr-2" />Publish Due Reposts</>}
                </Button>
                <Button
                  onClick={() => scanForReposts.mutate()}
                  disabled={scanForReposts.isPending}
                  variant="outline"
                  className="border-white/20 text-white/60 hover:text-white"
                >
                  {scanForReposts.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Scanning...</>
                    : <><RefreshCw className="w-4 h-4 mr-2" />Scan for Top Performers</>}
                </Button>
              </div>
            </div>

            {!repostQueue || repostQueue.length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <Repeat2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">No reposts queued</p>
                <p className="text-sm mt-1">Click "Scan for Top Performers" to find posts worth reposting (requires published posts with 10%+ engagement)</p>
              </div>
            ) : (
              <div className="space-y-3">
                {repostQueue.map(item => (
                  <Card key={item.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUpRight className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-white">Post #{item.originalPostId} repost</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            item.status === "pending" ? STATUS_COLORS.pending :
                            item.status === "published" ? STATUS_COLORS.published :
                            STATUS_COLORS.cancelled
                          }`}>{item.status}</span>
                        </div>
                        <p className="text-xs text-white/40">
                          Qualified at {item.qualifyingEngagementRate}% engagement · Scheduled: {formatDate(item.scheduledAt)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && settings && (
          <div className="space-y-4 max-w-lg">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Autopilot Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Auto-publish</p>
                    <p className="text-xs text-white/40">Automatically publish when scheduled time arrives</p>
                  </div>
                  <Switch
                    checked={settings.autoPublish === 1}
                    onCheckedChange={(v) => updateSettings.mutate({ autoPublish: v ? 1 : 0 })}
                  />
                </div>

                <div>
                  <p className="text-sm text-white mb-2">Content Tone</p>
                  <Select
                    value={settings.contentTone}
                    onValueChange={(v) => updateSettings.mutate({ contentTone: v as any })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="emotional">Emotional</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white mb-2">Post Time (UTC)</p>
                    <Select
                      value={settings.postTimeUtc}
                      onValueChange={(v) => updateSettings.mutate({ postTimeUtc: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00"].map(t => (
                          <SelectItem key={t} value={t}>{t} UTC</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm text-white mb-2">Story Time (UTC)</p>
                    <Select
                      value={settings.storyTimeUtc}
                      onValueChange={(v) => updateSettings.mutate({ storyTimeUtc: v })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00"].map(t => (
                          <SelectItem key={t} value={t}>{t} UTC</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/30">
                    The AI learns from post performance over time. Topics with higher engagement rates are weighted more heavily in future content generation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Available Topics */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm">Content Topics Pool ({topics?.length || 0} topics)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {topics?.map(t => (
                    <span key={t.id} className={`text-xs px-2 py-1 rounded-full border ${
                      t.tone === "educational" ? "bg-blue-500/10 text-blue-300 border-blue-500/20" :
                      t.tone === "emotional" ? "bg-pink-500/10 text-pink-300 border-pink-500/20" :
                      "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Luna Bot Tab */}
        {activeTab === "luna" && (
          <div className="space-y-6">
            {/* Luna Identity Card */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-900/40 to-pink-900/30 border-purple-500/30">
                <CardContent className="p-5 flex gap-4 items-start">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-profile-main-GinrBkQvqnNy8QT5oDqZcQ.png"
                    alt="Luna"
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-400/50 shrink-0"
                  />
                  <div>
                    <h3 className="font-semibold text-white text-sm">Luna | Sleep Coach 🌙</h3>
                    <p className="text-xs text-purple-300 mt-0.5">@luna.sleep.reset</p>
                    <p className="text-xs text-white/50 mt-2 leading-relaxed">AI-powered wellness persona for Deep Sleep Reset. Engages followers, answers DMs, and converts to sales.</p>
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">🤖 AI Disclosed</span>
                      <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">CBT-I Niche</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Funnel</p>
                  <div className="space-y-2 text-sm">
                    {[
                      { step: "1", label: "Reel/Post hooks attention", color: "text-blue-400" },
                      { step: "2", label: "Comment CTA → DM trigger", color: "text-purple-400" },
                      { step: "3", label: "Luna bot qualifies in DM", color: "text-pink-400" },
                      { step: "4", label: "Link sent → $5 purchase", color: "text-amber-400" },
                    ].map(({ step, label, color }) => (
                      <div key={step} className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold ${color}`}>{step}</span>
                        <span className="text-white/70 text-xs">{label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-5">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Quick Links</p>
                  <div className="space-y-2">
                    <a href="https://deep-sleep-reset.com" target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> deep-sleep-reset.com
                    </a>
                    <button
                      onClick={() => { navigator.clipboard.writeText("https://deep-sleep-reset.com"); toast.success("Link copied!"); }}
                      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" /> Copy product link
                    </button>
                    <button
                      onClick={() => { navigator.clipboard.writeText("Helping you sleep like you used to 🌙\nCBT-I based • Science-backed • Actually works\n🤖 AI-powered coach\n↓ Free 7-night sleep reset"); toast.success("Bio copied!"); }}
                      className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors">
                      <Copy className="w-3.5 h-3.5" /> Copy Instagram bio
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Visual Assets */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400" /> Luna Visual Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Profile Photo", url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-profile-main-GinrBkQvqnNy8QT5oDqZcQ.png", aspect: "aspect-square" },
                    { label: "Reel Cover — 3AM", url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-reel-cover-1-6ji7Nq7qo4ehbRcE9QRorT.png", aspect: "aspect-[9/16]" },
                    { label: "Post — Sleeping", url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-post-1-PoZHnJxumQsAj2SB5UR3wZ.png", aspect: "aspect-[4/5]" },
                    { label: "Carousel Slide 1", url: "https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-carousel-1-bUEwE6CxM7sCeyDLBiezoF.png", aspect: "aspect-[4/5]" },
                  ].map(({ label, url, aspect }) => (
                    <div key={label} className="space-y-1.5">
                      <div className={`${aspect} rounded-lg overflow-hidden bg-white/5 border border-white/10`}>
                        <img src={url} alt={label} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-white/50">{label}</p>
                        <button onClick={() => { navigator.clipboard.writeText(url); toast.success("URL copied!"); }}
                          className="text-white/30 hover:text-white/70 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-white/10 flex gap-3">
                  <div className="flex items-center gap-2">
                    <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-highlight-sleep-HrUKpkwFU7wYgbXHNYskSp.png" alt="Sleep Tips" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs text-white/50">Sleep Tips Highlight</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="https://d2xsxph8kpxj0f.cloudfront.net/310419663032296198/RrG9k2uFQkqVyNWK8WEbxj/luna-highlight-routine-iFcVcLcgFbHjNBJVSbzPsU.png" alt="Night Routine" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-xs text-white/50">Night Routine Highlight</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* DM Scripts */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-400" /> DM Scripts (Copy & Paste)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    trigger: 'Keyword: "3AM"',
                    script: `Hey! 👋 I saw you're dealing with the 3AM wake-up thing — I know exactly how awful that is.\n\nThe reason it happens is actually a cortisol spike that your body triggers right around that time. It's not random — your nervous system is stuck in a stress loop.\n\nI put together a 7-night protocol specifically for this. It's based on the same CBT-I method sleep clinics charge $800 for — but I made it accessible for $5.\n\nWant me to send you the link? It's helped a lot of people break the 3AM cycle for good. 🌙`,
                  },
                  {
                    trigger: 'Keyword: "help" / "can\'t sleep"',
                    script: `Hey, I'm really glad you reached out 💙\n\nFirst — you're not broken, and this isn't permanent. Sleep problems are almost always fixable with the right approach.\n\nCan I ask — is it falling asleep that's the problem, or staying asleep? Or both?\n\n(I ask because the fix is slightly different depending on which one it is)`,
                  },
                  {
                    trigger: 'Keyword: "price" / "how much"',
                    script: `It's $5 🙂\n\nI know that sounds almost too cheap for something that actually works — but I wanted to make it accessible to everyone. Sleep problems affect millions of people who can't afford $800 sleep clinics.\n\nThe full protocol is at: https://deep-sleep-reset.com\n\n30-day money-back guarantee. No risk. 💙`,
                  },
                  {
                    trigger: 'Generic fallback',
                    script: `Hey! Thanks for reaching out 🌙\n\nI'm Luna — I help people fix their sleep using the same CBT-I techniques that sleep clinics use (but without the $800 price tag).\n\nWhat's going on with your sleep? I'd love to help if I can.`,
                  },
                ].map(({ trigger, script }) => (
                  <div key={trigger} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-300">{trigger}</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(script); toast.success("Script copied!"); }}
                        className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed whitespace-pre-line line-clamp-3">{script}</p>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/10">
                  <p className="text-xs text-white/30">For automated DM responses, configure these scripts in the DM Auto-Responder →</p>
                  <button
                    onClick={() => window.location.href = "/admin/dm-autoresponder"}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> Open DM Auto-Responder
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Content Calendar Week 1 */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> Week 1 Launch Content Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { day: "Mon", format: "Reel", hook: "Why you wake up at 3AM (science explained)", cta: "DM me '3AM' if this is you", color: "text-blue-400" },
                    { day: "Tue", format: "Carousel", hook: "5 Reasons You Can't Sleep (And How to Fix Each One)", cta: "Comment which one is you 👇", color: "text-purple-400" },
                    { day: "Wed", format: "Story Poll", hook: "How long to fall asleep?", cta: "DM me if 30+ min", color: "text-pink-400" },
                    { day: "Thu", format: "Post", hook: "I tried melatonin for 6 months. Here's the truth.", cta: "Real fix in bio 🌙", color: "text-amber-400" },
                    { day: "Fri", format: "Reel", hook: "4-7-8 breathing — try this tonight", cta: "DM me how it went", color: "text-green-400" },
                    { day: "Sat", format: "Story", hook: "My night routine (honest version)", cta: "Link in bio for full system", color: "text-cyan-400" },
                    { day: "Sun", format: "Carousel", hook: "The 7-night sleep reset — what each night does", cta: "Full system at link in bio ☕", color: "text-rose-400" },
                  ].map(({ day, format, hook, cta, color }) => (
                    <div key={day} className="flex items-start gap-3 p-2.5 rounded-lg bg-white/5 border border-white/10">
                      <span className={`text-xs font-bold w-8 shrink-0 ${color}`}>{day}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs bg-white/10 text-white/60 px-1.5 py-0.5 rounded">{format}</span>
                          <span className="text-xs text-white/80 truncate">{hook}</span>
                        </div>
                        <p className="text-xs text-white/40">CTA: {cta}</p>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard.writeText(`${format}: ${hook}\nCTA: ${cta}`); toast.success("Copied!"); }}
                        className="text-white/20 hover:text-white/60 transition-colors shrink-0">
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instagram Setup Checklist */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Instagram Setup Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { label: "Create new Instagram account (fresh device/browser)", done: false },
                    { label: "Convert to Creator account (Settings → Account)", done: false },
                    { label: "Upload Luna profile photo", done: false },
                    { label: "Set name: Luna | Sleep Coach 🌙", done: false },
                    { label: "Set bio with AI disclosure + product link", done: false },
                    { label: "Set link in bio: https://deep-sleep-reset.com", done: false },
                    { label: "Create 5 Story Highlights (Sleep Tips, Night Routine, Results, FAQ, Get It)", done: false },
                    { label: "Complete 14-day warmup (2 Stories/day, no product link for first 7 days)", done: false },
                    { label: "Set up ManyChat or DM Auto-Responder for keyword triggers", done: false },
                    { label: "Post Week 1 content calendar", done: false },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-start gap-2.5 text-xs">
                      <div className={`w-4 h-4 rounded border shrink-0 mt-0.5 flex items-center justify-center ${
                        done ? "bg-green-500/20 border-green-500/50" : "border-white/20"
                      }`}>
                        {done && <CheckCircle className="w-3 h-3 text-green-400" />}
                      </div>
                      <span className={done ? "text-white/40 line-through" : "text-white/70"}>{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
