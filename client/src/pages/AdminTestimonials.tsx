/**
 * Admin Testimonials Moderation Page
 * Review, approve, reject, and feature customer testimonials.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  CheckCircle,
  XCircle,
  Sparkles,
  Moon,
  ArrowLeft,
  Loader2,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

type StatusFilter = "pending" | "approved" | "rejected" | "all";

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-foreground/30 text-sm">No rating</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-amber-400 text-amber-400" : "text-foreground/20"}`}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color = "text-foreground",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border/30 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs text-foreground/50 uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function AdminTestimonials() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: stats } = trpc.testimonials.adminStats.useQuery();
  const { data: listData, isLoading } = trpc.testimonials.adminList.useQuery({
    status: statusFilter,
    limit: 50,
    offset: 0,
  });

  const approveMutation = trpc.testimonials.approve.useMutation({
    onSuccess: () => {
      utils.testimonials.adminList.invalidate();
      utils.testimonials.adminStats.invalidate();
      toast.success("Testimonial approved");
      setApprovingId(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setApprovingId(null);
    },
  });

  const rejectMutation = trpc.testimonials.reject.useMutation({
    onSuccess: () => {
      utils.testimonials.adminList.invalidate();
      utils.testimonials.adminStats.invalidate();
      toast.success("Testimonial rejected");
      setRejectingId(null);
    },
    onError: (err) => {
      toast.error(err.message);
      setRejectingId(null);
    },
  });

  const toggleFeaturedMutation = trpc.testimonials.toggleFeatured.useMutation({
    onSuccess: (data) => {
      utils.testimonials.adminList.invalidate();
      toast.success(data.featured ? "Marked as featured" : "Removed from featured");
    },
  });

  const STATUS_TABS: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: `Pending${stats ? ` (${stats.pending})` : ""}` },
    { key: "approved", label: `Approved${stats ? ` (${stats.approved})` : ""}` },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="gap-2 text-foreground/50 hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <div className="w-px h-5 bg-border/30" />
            <Moon className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-sm">Testimonials</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Requests" value={stats.total} icon={Users} />
            <StatCard
              label="Submitted"
              value={`${stats.submitted} (${stats.responseRate}%)`}
              icon={MessageSquare}
              color="text-blue-400"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon={CheckCircle}
              color="text-green-400"
            />
            <StatCard
              label="Avg Rating"
              value={stats.avgRating > 0 ? `${stats.avgRating} ★` : "—"}
              icon={TrendingUp}
              color="text-amber-400"
            />
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                statusFilter === tab.key
                  ? "bg-amber-400 text-background border-amber-400"
                  : "bg-transparent text-foreground/50 border-border/30 hover:border-amber-400/50 hover:text-foreground/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonial list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : !listData?.rows.length ? (
          <div className="text-center py-20">
            <MessageSquare className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
            <p className="text-foreground/40">No {statusFilter === "all" ? "" : statusFilter} testimonials yet.</p>
            {statusFilter === "pending" && (
              <p className="text-foreground/30 text-sm mt-2">
                Testimonial requests are sent automatically on Day 7 of the email sequence.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {listData.rows.map((row) => (
              <div
                key={row.id}
                className={`bg-card border rounded-xl p-6 transition-all ${
                  row.featured ? "border-amber-400/40 shadow-amber-400/5 shadow-lg" : "border-border/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="w-9 h-9 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {(row.name || row.email)?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{row.name || "Anonymous"}</p>
                      <p className="text-foreground/40 text-xs">{row.email}</p>
                    </div>
                    <StarDisplay rating={row.rating} />
                    {row.nightsToResult && (
                      <Badge variant="outline" className="text-xs border-border/30 text-foreground/50">
                        Night {row.nightsToResult}
                      </Badge>
                    )}
                    {row.featured ? (
                      <Badge className="text-xs bg-amber-400/20 text-amber-400 border-amber-400/30">
                        ⭐ Featured
                      </Badge>
                    ) : null}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        row.status === "approved"
                          ? "border-green-400/30 text-green-400"
                          : row.status === "rejected"
                          ? "border-red-400/30 text-red-400"
                          : "border-yellow-400/30 text-yellow-400"
                      }`}
                    >
                      {row.status}
                    </Badge>
                  </div>
                  <p className="text-foreground/30 text-xs whitespace-nowrap">
                    {row.submittedAt
                      ? new Date(row.submittedAt).toLocaleDateString()
                      : "Not submitted"}
                  </p>
                </div>

                {row.body ? (
                  <blockquote className="text-foreground/70 text-sm leading-relaxed border-l-2 border-amber-400/30 pl-4 mb-4 italic">
                    "{row.body}"
                  </blockquote>
                ) : (
                  <p className="text-foreground/30 text-sm italic mb-4">No testimonial submitted yet.</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {row.status !== "approved" && row.body && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setApprovingId(row.id);
                        approveMutation.mutate({ id: row.id });
                      }}
                      disabled={approvingId === row.id}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 gap-1.5"
                    >
                      {approvingId === row.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Approve
                    </Button>
                  )}
                  {row.status === "approved" && (
                    <Button
                      size="sm"
                      onClick={() => toggleFeaturedMutation.mutate({ id: row.id })}
                      disabled={toggleFeaturedMutation.isPending}
                      className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 gap-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      {row.featured ? "Unfeature" : "Feature"}
                    </Button>
                  )}
                  {row.status !== "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRejectingId(row.id);
                        rejectMutation.mutate({ id: row.id });
                      }}
                      disabled={rejectingId === row.id}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 gap-1.5"
                    >
                      {rejectingId === row.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
