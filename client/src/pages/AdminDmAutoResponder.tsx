/**
 * Instagram DM Auto-Responder Admin Page
 *
 * Features:
 * - Keyword rule manager (create, edit, delete, enable/disable)
 * - DM template editor with {name} placeholder support
 * - Live comment event feed
 * - DM sent log
 * - Stats dashboard (total comments, matched, DMs sent, conversion rate)
 * - Webhook config (Meta App ID, App Secret, Page Access Token, Verify Token)
 * - Manual comment scan trigger
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Power,
  PowerOff,
  RefreshCw,
  Settings,
  BarChart2,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DmRule {
  id: number;
  keyword: string;
  dmTemplate: string;
  matchMode: "exact" | "contains";
  enabled: number;
  triggerCount: number;
  dmsSent: number;
  postFilter: string | null;
  createdAt: Date;
}

interface RuleFormData {
  keyword: string;
  dmTemplate: string;
  matchMode: "exact" | "contains";
  enabled: number;
}

const DEFAULT_TEMPLATE = `Hey {name}! 👋

Thanks for your comment! Here's the link to the 7-Night Deep Sleep Reset — just $5 and you can start tonight:

👉 https://deep-sleep-reset.com

It's backed by CBT-I science and comes with a 30-day money-back guarantee. Sleep well! 🌙`;

// ─── Stats Cards ──────────────────────────────────────────────────────────────

function StatsCards() {
  const { data: stats, isLoading } = trpc.igDmAutoResponder.getDmStats.useQuery();

  const cards = [
    {
      label: "Comments Scanned",
      value: stats?.totalComments ?? 0,
      icon: Eye,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Keyword Matches",
      value: stats?.totalMatched ?? 0,
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      label: "DMs Sent",
      value: stats?.totalDmsSent ?? 0,
      icon: Send,
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      label: "Conversion Rate",
      value: `${stats?.conversionRate ?? 0}%`,
      icon: BarChart2,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card key={card.label} className="bg-card/50 border-border/30">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="text-xl font-bold text-foreground">
                  {isLoading ? "—" : card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Rule Form Dialog ─────────────────────────────────────────────────────────

function RuleFormDialog({
  open,
  onClose,
  editRule,
}: {
  open: boolean;
  onClose: () => void;
  editRule?: DmRule | null;
}) {
  const utils = trpc.useUtils();
  const [form, setForm] = useState<RuleFormData>({
    keyword: editRule?.keyword ?? "",
    dmTemplate: editRule?.dmTemplate ?? DEFAULT_TEMPLATE,
    matchMode: editRule?.matchMode ?? "contains",
    enabled: editRule?.enabled ?? 1,
  });

  const createMutation = trpc.igDmAutoResponder.createRule.useMutation({
    onSuccess: () => {
      toast.success("Rule created!");
      utils.igDmAutoResponder.getRules.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.igDmAutoResponder.updateRule.useMutation({
    onSuccess: () => {
      toast.success("Rule updated!");
      utils.igDmAutoResponder.getRules.invalidate();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = () => {
    if (!form.keyword.trim()) return toast.error("Keyword is required");
    if (!form.dmTemplate.trim()) return toast.error("DM template is required");
    if (editRule) {
      updateMutation.mutate({ id: editRule.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editRule ? "Edit Rule" : "New Keyword Rule"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="text-sm font-medium mb-1 block">Keyword</label>
            <Input
              placeholder="e.g. SLEEP, INFO, LINK"
              value={form.keyword}
              onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value.toUpperCase() }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Case-insensitive. When someone comments this word, they get a DM.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Match Mode</label>
            <Select
              value={form.matchMode}
              onValueChange={(v) => setForm((f) => ({ ...f, matchMode: v as "exact" | "contains" }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contains">Contains — triggers if comment includes the keyword anywhere</SelectItem>
                <SelectItem value="exact">Exact word — triggers only if comment is exactly the keyword</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">DM Message Template</label>
            <Textarea
              rows={8}
              placeholder="Your DM message..."
              value={form.dmTemplate}
              onChange={(e) => setForm((f) => ({ ...f, dmTemplate: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use <code className="bg-muted px-1 rounded">{"{name}"}</code> to personalize with the commenter's username.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : editRule ? "Update Rule" : "Create Rule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Rules Tab ────────────────────────────────────────────────────────────────

function RulesTab() {
  const utils = trpc.useUtils();
  const { data: rules, isLoading } = trpc.igDmAutoResponder.getRules.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState<DmRule | null>(null);

  const deleteMutation = trpc.igDmAutoResponder.deleteRule.useMutation({
    onSuccess: () => {
      toast.success("Rule deleted");
      utils.igDmAutoResponder.getRules.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleMutation = trpc.igDmAutoResponder.updateRule.useMutation({
    onSuccess: () => utils.igDmAutoResponder.getRules.invalidate(),
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          When a comment contains a keyword, the user automatically receives a DM.
        </p>
        <Button size="sm" onClick={() => { setEditRule(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-1" /> New Rule
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading rules...</div>
      )}

      {!isLoading && (!rules || rules.length === 0) && (
        <div className="text-center py-12 border border-dashed border-border/40 rounded-xl">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No rules yet. Create your first keyword rule.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Example: keyword "SLEEP" → sends DM with checkout link
          </p>
          <Button size="sm" className="mt-4" onClick={() => { setEditRule(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Create First Rule
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {rules?.map((rule) => (
          <Card key={rule.id} className={`border-border/30 transition-opacity ${rule.enabled ? "" : "opacity-50"}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={rule.enabled ? "default" : "secondary"} className="font-mono text-sm">
                      {rule.keyword}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {rule.matchMode}
                    </Badge>
                    {rule.enabled ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Paused</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {rule.dmTemplate}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Triggered: <strong className="text-foreground">{rule.triggerCount}</strong></span>
                    <span>DMs sent: <strong className="text-green-400">{rule.dmsSent}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    title={rule.enabled ? "Pause rule" : "Activate rule"}
                    onClick={() => toggleMutation.mutate({ id: rule.id, enabled: rule.enabled ? 0 : 1 })}
                  >
                    {rule.enabled ? (
                      <PowerOff className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Power className="w-4 h-4 text-green-400" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8"
                    onClick={() => { setEditRule(rule as DmRule); setShowForm(true); }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm(`Delete rule "${rule.keyword}"?`)) {
                        deleteMutation.mutate({ id: rule.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <RuleFormDialog
        open={showForm}
        onClose={() => setShowForm(false)}
        editRule={editRule}
      />
    </div>
  );
}

// ─── Comment Feed Tab ─────────────────────────────────────────────────────────

function CommentFeedTab() {
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.igDmAutoResponder.getCommentEvents.useQuery({ limit: 50 });
  const scanMutation = trpc.igDmAutoResponder.scanComments.useMutation({
    onSuccess: (data) => {
      toast.success(`Scanned ${data.scanned} comments — ${data.matched} matched — ${data.dmsSent} DMs sent`);
      utils.igDmAutoResponder.getCommentEvents.invalidate();
      utils.igDmAutoResponder.getDmStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const statusColors: Record<string, string> = {
    scanned: "text-muted-foreground",
    matched: "text-yellow-400",
    dm_sent: "text-green-400",
    dm_failed: "text-red-400",
    skipped: "text-muted-foreground/50",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    scanned: <Eye className="w-3 h-3" />,
    matched: <Zap className="w-3 h-3" />,
    dm_sent: <CheckCircle className="w-3 h-3" />,
    dm_failed: <XCircle className="w-3 h-3" />,
    skipped: <Eye className="w-3 h-3" />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          All comments scanned by the auto-responder. Real-time via Meta webhooks.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => scanMutation.mutate({})}
          disabled={scanMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${scanMutation.isPending ? "animate-spin" : ""}`} />
          Manual Scan
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      )}

      {!isLoading && (!comments || comments.length === 0) && (
        <div className="text-center py-12 border border-dashed border-border/40 rounded-xl">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No comments scanned yet.</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Comments will appear here once the Meta webhook is connected.
          </p>
        </div>
      )}

      <div className="space-y-2">
        {comments?.map((event) => (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/20"
          >
            <div className={`mt-0.5 ${statusColors[event.status] ?? "text-muted-foreground"}`}>
              {statusIcons[event.status]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium">@{event.igUsername ?? event.igUserId}</span>
                {event.keywordMatched && (
                  <Badge variant="outline" className="text-xs font-mono">{event.keywordMatched}</Badge>
                )}
                <span className={`text-xs ml-auto ${statusColors[event.status]}`}>
                  {event.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{event.commentText}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DM Log Tab ───────────────────────────────────────────────────────────────

function DmLogTab() {
  const { data: logs, isLoading } = trpc.igDmAutoResponder.getDmLog.useQuery({ limit: 50 });

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Every DM sent by the auto-responder — success and failure log.
      </p>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <div className="text-center py-12 border border-dashed border-border/40 rounded-xl">
          <Send className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm">No DMs sent yet.</p>
        </div>
      )}

      <div className="space-y-2">
        {logs?.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/20"
          >
            <div className={`mt-0.5 ${log.success ? "text-green-400" : "text-red-400"}`}>
              {log.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-medium">@{log.igUsername ?? log.igUserId}</span>
                <span className={`text-xs ml-auto ${log.success ? "text-green-400" : "text-red-400"}`}>
                  {log.success ? "Delivered" : "Failed"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{log.message}</p>
              {log.errorMessage && (
                <p className="text-xs text-red-400 mt-1">{log.errorMessage}</p>
              )}
              <p className="text-xs text-muted-foreground/50 mt-1">
                {new Date(log.sentAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Webhook Config Tab ───────────────────────────────────────────────────────

function WebhookConfigTab() {
  const utils = trpc.useUtils();
  const { data: cfg, isLoading } = trpc.igDmAutoResponder.getWebhookConfig.useQuery();
  const [form, setForm] = useState({
    metaAppId: "",
    metaAppSecret: "",
    pageAccessToken: "",
    verifyToken: "",
  });

  const saveMutation = trpc.igDmAutoResponder.saveWebhookConfig.useMutation({
    onSuccess: () => {
      toast.success("Webhook config saved!");
      utils.igDmAutoResponder.getWebhookConfig.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const webhookUrl = typeof window !== "undefined"
    ? `${window.location.origin}/api/instagram/webhook`
    : "https://your-domain.com/api/instagram/webhook";

  return (
    <div className="space-y-6">
      {/* Setup Guide */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-amber-400">Meta App Setup Required</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>To receive real-time comment notifications, you need a Meta App with Instagram permissions:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to <strong>developers.facebook.com</strong> → Create App → Business type</li>
            <li>Add product: <strong>Instagram Graph API</strong></li>
            <li>Request permissions: <code className="bg-muted px-1 rounded">instagram_manage_comments</code> + <code className="bg-muted px-1 rounded">instagram_manage_messages</code></li>
            <li>Set webhook URL to: <code className="bg-muted px-1 rounded text-xs break-all">{webhookUrl}</code></li>
            <li>Subscribe to <strong>comments</strong> webhook field</li>
            <li>Generate a <strong>Page Access Token</strong> and paste it below</li>
          </ol>
          <p className="text-amber-400/80 mt-2">
            ⚡ <strong>Faster alternative:</strong> Use ManyChat (free) for instant "Comment to DM" — no app approval needed.
          </p>
        </CardContent>
      </Card>

      {/* Webhook URL */}
      <div>
        <label className="text-sm font-medium mb-1 block">Your Webhook URL</label>
        <div className="flex gap-2">
          <Input value={webhookUrl} readOnly className="font-mono text-xs" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => { navigator.clipboard.writeText(webhookUrl); toast.success("Copied!"); }}
          >
            Copy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Paste this URL in Meta App → Webhooks → Callback URL
        </p>
      </div>

      {/* Credentials */}
      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Meta App ID</label>
          <Input
            placeholder={cfg?.metaAppId ?? "Enter Meta App ID"}
            value={form.metaAppId}
            onChange={(e) => setForm((f) => ({ ...f, metaAppId: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Meta App Secret</label>
          <Input
            type="password"
            placeholder={cfg?.metaAppSecret ?? "Enter App Secret"}
            value={form.metaAppSecret}
            onChange={(e) => setForm((f) => ({ ...f, metaAppSecret: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Page Access Token</label>
          <Input
            type="password"
            placeholder={cfg?.pageAccessToken ?? "Enter Page Access Token"}
            value={form.pageAccessToken}
            onChange={(e) => setForm((f) => ({ ...f, pageAccessToken: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Long-lived token from Meta Business Suite → Settings → Advanced → Page Access Tokens
          </p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Webhook Verify Token</label>
          <Input
            placeholder="Any secret string you choose (e.g. deepsleepreset_webhook_2024)"
            value={form.verifyToken}
            onChange={(e) => setForm((f) => ({ ...f, verifyToken: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground mt-1">
            You'll paste this same string in Meta App → Webhooks → Verify Token
          </p>
        </div>
      </div>

      <Button
        onClick={() => saveMutation.mutate(form)}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? "Saving..." : "Save Webhook Config"}
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDmAutoResponder() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/admin/instagram">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground px-2">
                  ← Instagram Autopilot
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              DM Auto-Responder
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Automatically reply to comments with keyword triggers via Instagram DM
            </p>
          </div>
        </div>

        {/* Stats */}
        <StatsCards />

        {/* Tabs */}
        <Tabs defaultValue="rules">
          <TabsList className="mb-6">
            <TabsTrigger value="rules">
              <Zap className="w-4 h-4 mr-1" /> Keyword Rules
            </TabsTrigger>
            <TabsTrigger value="comments">
              <Eye className="w-4 h-4 mr-1" /> Comment Feed
            </TabsTrigger>
            <TabsTrigger value="dmlog">
              <Send className="w-4 h-4 mr-1" /> DM Log
            </TabsTrigger>
            <TabsTrigger value="webhook">
              <Settings className="w-4 h-4 mr-1" /> Webhook Setup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules">
            <RulesTab />
          </TabsContent>
          <TabsContent value="comments">
            <CommentFeedTab />
          </TabsContent>
          <TabsContent value="dmlog">
            <DmLogTab />
          </TabsContent>
          <TabsContent value="webhook">
            <WebhookConfigTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
