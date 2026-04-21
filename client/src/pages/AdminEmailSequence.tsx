import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ArrowLeft,
  Play,
  UserPlus,
  Pause,
  Ban,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    completed: { label: "Completed", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    paused: { label: "Paused", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    unsubscribed: { label: "Unsub", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const s = map[status] || { label: status, className: "bg-gray-500/20 text-gray-400" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${s.className}`}>
      {s.label}
    </span>
  );
}

// ─── Enrollment row with expandable send log ──────────────────────────────────

function EnrollmentRow({ enrollment }: { enrollment: any }) {
  const [expanded, setExpanded] = useState(false);
  const utils = trpc.useUtils();

  const { data: sendLog } = trpc.emailSequence.getSendLog.useQuery(
    { enrollmentId: enrollment.id },
    { enabled: expanded }
  );

  const updateStatus = trpc.emailSequence.updateEnrollmentStatus.useMutation({
    onSuccess: () => {
      utils.emailSequence.getEnrollments.invalidate();
      toast.success("Status updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const dayLabels = [
    "", // Day 0 placeholder
    "Night 2: Racing Mind",
    "Night 3: Body Scan",
    "Night 4: 4-7-8 Breath",
    "Night 5: Light & Dark + Upsell",
    "Night 6: Stimulus Control",
    "Night 7: Lock-In + Final Upsell",
  ];

  const progress = enrollment.status === "completed"
    ? 100
    : Math.round(((enrollment.nextDayToSend - 1) / 6) * 100);

  return (
    <div className="border border-white/5 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white truncate">{enrollment.email}</span>
            {enrollment.name && (
              <span className="text-xs text-white/40">{enrollment.name}</span>
            )}
            <StatusBadge status={enrollment.status} />
            {enrollment.purchasedUpsell === 1 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Upsell ✓
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 bg-white/10 rounded-full h-1.5 max-w-[200px]">
              <div
                className="h-1.5 rounded-full bg-amber-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-white/40">
              {enrollment.status === "completed"
                ? "All 6 emails sent"
                : enrollment.status === "active"
                ? `Next: Day ${enrollment.nextDayToSend} — ${dayLabels[enrollment.nextDayToSend] || "Done"}`
                : enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {enrollment.status === "active" && (
            <button
              onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: enrollment.id, status: "paused" }); }}
              className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-amber-400 transition-colors"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {enrollment.status === "paused" && (
            <button
              onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: enrollment.id, status: "active" }); }}
              className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-emerald-400 transition-colors"
              title="Resume"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          {enrollment.status !== "unsubscribed" && (
            <button
              onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: enrollment.id, status: "unsubscribed" }); }}
              className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
              title="Unsubscribe"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/30" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/30" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 bg-black/20 px-4 py-3">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Send History</p>
          {!sendLog ? (
            <p className="text-xs text-white/30">Loading...</p>
          ) : sendLog.length === 0 ? (
            <p className="text-xs text-white/30">No emails sent yet.</p>
          ) : (
            <div className="space-y-2">
              {sendLog.map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-xs">
                  {log.success === 1 ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  )}
                  <span className="text-white/60 w-12 shrink-0">Day {log.dayNumber}</span>
                  <span className="text-white/50 truncate flex-1">{log.subject}</span>
                  <span className="text-white/30 shrink-0">
                    {new Date(log.sentAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Manual enroll modal ──────────────────────────────────────────────────────

function ManualEnrollModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const utils = trpc.useUtils();

  const enroll = trpc.emailSequence.enrollManual.useMutation({
    onSuccess: () => {
      utils.emailSequence.getEnrollments.invalidate();
      utils.emailSequence.getStats.invalidate();
      toast.success(`${email} enrolled in sequence`);
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1220] border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-white font-semibold mb-4">Manually Enroll Customer</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">Name (optional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <Button variant="outline" className="flex-1 border-white/10 text-white/60" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            disabled={!email || enroll.isPending}
            onClick={() => enroll.mutate({ email, name: name || undefined })}
          >
            {enroll.isPending ? "Enrolling..." : "Enroll"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminEmailSequence() {
  const { user, loading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "unsubscribed" | "paused">("all");
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const { data: stats, refetch: refetchStats } = trpc.emailSequence.getStats.useQuery();
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = trpc.emailSequence.getEnrollments.useQuery({ status: statusFilter });

  const processQueue = trpc.emailSequence.processQueue.useMutation({
    onSuccess: (result) => {
      refetchStats();
      refetchEnrollments();
      toast.success(`Queue processed: ${result.sent} sent, ${result.errors} errors`);
    },
    onError: (e) => toast.error(e.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center">
        <p className="text-white/50">Admin access required.</p>
      </div>
    );
  }

  const daySequence = [
    { day: 0, label: "Day 0 (Immediate)", subject: "🌙 Your 7-Night Deep Sleep Reset — Access Inside", type: "Welcome" },
    { day: 1, label: "Day 1", subject: "Night 2: The technique that shuts down a racing mind in 10 minutes", type: "Content" },
    { day: 2, label: "Day 2", subject: "Night 3: Your body is holding tension you don't even know about", type: "Content" },
    { day: 3, label: "Day 3", subject: "Night 4: The breathing pattern that activates your body's off switch", type: "Content + Soft Upsell" },
    { day: 4, label: "Day 4", subject: "Night 5: How light is secretly destroying your sleep", type: "Content + Hard Upsell 💰" },
    { day: 5, label: "Day 5", subject: "Night 6: The psychological trick that makes your bed feel like a sleeping pill", type: "Content + Social Proof" },
    { day: 6, label: "Day 6", subject: "🌙 Night 7: You made it. Here's your sleep ritual for life.", type: "Final + Upsell + Referral 💰" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {showEnrollModal && <ManualEnrollModal onClose={() => setShowEnrollModal(false)} />}

      {/* Header */}
      <div className="border-b border-white/5 bg-[#0d1220]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">Email Sequence</h1>
              <p className="text-xs text-white/40">7-Day Post-Purchase Nurture</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-white/10 text-white/60 hover:text-white gap-2"
              onClick={() => processQueue.mutate()}
              disabled={processQueue.isPending}
            >
              {processQueue.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Process Queue
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-black font-semibold gap-2"
              onClick={() => setShowEnrollModal(true)}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Enroll
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Enrolled", value: stats.totalEnrolled, icon: Users, color: "text-blue-400" },
              { label: "Active", value: stats.active, icon: Clock, color: "text-emerald-400" },
              { label: "Completed", value: stats.completed, icon: CheckCircle, color: "text-amber-400" },
              { label: "Delivery Rate", value: `${stats.deliveryRate}%`, icon: TrendingUp, color: "text-purple-400" },
            ].map((stat) => (
              <Card key={stat.label} className="bg-white/3 border-white/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/40">{stat.label}</span>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upsell conversion */}
        {stats && (
          <Card className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-500/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">Upsell Conversions (Audio Pack $27)</p>
                <p className="text-xs text-white/40 mt-0.5">Customers who purchased after Day 4 or Day 6 email</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-400">{stats.upsellConversions}</p>
                <p className="text-xs text-white/40">{stats.upsellRate}% conversion rate</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sequence overview */}
        <Card className="bg-white/3 border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-white/80 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              Sequence Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {daySequence.map((email) => (
                <div key={email.day} className="flex items-start gap-4 px-6 py-3">
                  <div className="w-14 shrink-0">
                    <span className="text-xs font-medium text-amber-400/70">{email.label}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70 truncate">{email.subject}</p>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      email.type.includes("Upsell 💰")
                        ? "bg-purple-500/20 text-purple-400"
                        : email.type === "Welcome"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}>
                      {email.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollments list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white/80">Enrollments</h2>
            <div className="flex gap-1">
              {(["all", "active", "completed", "paused", "unsubscribed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-amber-500 text-black"
                      : "bg-white/5 text-white/40 hover:text-white"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !enrollments || enrollments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
              <Mail className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No enrollments yet.</p>
              <p className="text-white/25 text-xs mt-1">Customers are automatically enrolled when they purchase the 7-Night Deep Sleep Reset.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {enrollments.map((enrollment) => (
                <EnrollmentRow key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
