import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart3, ListChecks, ShieldAlert, Users } from "lucide-react";
import { useState } from "react";

export default function AdminPage() {
  const { user } = useAuth();
  const overviewQuery = trpc.admin.overview.useQuery();
  const qaListQuery = trpc.admin.qaList.useQuery();
  const contentListQuery = trpc.admin.contentList.useQuery();
  const updateQaItem = trpc.admin.updateQaItem.useMutation({
    onSuccess: () => qaListQuery.refetch(),
  });
  const upsertContent = trpc.admin.upsertContent.useMutation({
    onSuccess: () => contentListQuery.refetch(),
  });
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [contentDraft, setContentDraft] = useState({
    slug: "new-sleep-note",
    title: "New Sleep Note",
    summary: "A premium content summary.",
    body: "A calm and practical DeepSleepReset content block.",
    contentType: "tip" as "tip" | "audio" | "video" | "checkin",
    dayNumber: 4,
    isPremium: 1,
    isPublished: 1,
  });

  if (user?.role !== "admin") {
    return (
      <div className="container py-12">
        <Card className="glass-card border-none">
          <CardContent className="space-y-4 p-8">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-2">Admin-only area</Badge>
            <h1 className="font-display text-5xl">Access restricted</h1>
            <p className="max-w-2xl leading-8 text-muted-foreground">
              The DeepSleepReset QA checklist and operations dashboard are visible only to admin users.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totals = overviewQuery.data?.totals;
  const qaItems = qaListQuery.data ?? [];

  return (
    <div className="container py-10 md:py-12">
      <div className="space-y-8">
        <div className="space-y-3">
          <Badge variant="secondary" className="rounded-full px-4 py-2">Owner operations</Badge>
          <h1 className="font-display text-6xl">DeepSleepReset admin dashboard</h1>
          <p className="max-w-3xl leading-8 text-muted-foreground">
            Review subscriber growth, funnel momentum, and the admin-only pre-launch QA checklist before you move toward publication.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card className="glass-card border-none">
            <CardContent className="flex items-center gap-4 p-6">
              <Users className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-3xl font-semibold">{totals?.subscribers ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardContent className="flex items-center gap-4 p-6">
              <ShieldAlert className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Active members</p>
                <p className="text-3xl font-semibold">{totals?.activeMembers ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-none">
            <CardContent className="flex items-center gap-4 p-6">
              <BarChart3 className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Funnel events</p>
                <p className="text-3xl font-semibold">{totals?.funnelEvents ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-display text-4xl">Recent funnel signals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(overviewQuery.data?.recentEvents ?? []).length === 0 ? (
                <div className="rounded-3xl bg-background/70 p-5 text-muted-foreground">
                  No funnel events have been recorded yet.
                </div>
              ) : (
                (overviewQuery.data?.recentEvents ?? []).map((event) => (
                  <div key={event.id} className="rounded-3xl bg-background/70 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{event.eventType}</p>
                    <p className="mt-2 leading-7 text-foreground">{event.detail || "No additional detail provided."}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card border-none">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit rounded-full px-4 py-2">Program content management</Badge>
                <CardTitle className="font-display text-4xl">Premium feed editor</CardTitle>
                <p className="leading-7 text-muted-foreground">
                  Add or update DeepSleepReset program items for the premium members feed.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Input value={contentDraft.slug} onChange={(event) => setContentDraft((current) => ({ ...current, slug: event.target.value }))} placeholder="Slug" />
                  <Input value={contentDraft.title} onChange={(event) => setContentDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" />
                  <Input value={contentDraft.summary} onChange={(event) => setContentDraft((current) => ({ ...current, summary: event.target.value }))} placeholder="Summary" className="md:col-span-2" />
                  <Input value={contentDraft.body} onChange={(event) => setContentDraft((current) => ({ ...current, body: event.target.value }))} placeholder="Body" className="md:col-span-2" />
                  <Input type="number" value={contentDraft.dayNumber} onChange={(event) => setContentDraft((current) => ({ ...current, dayNumber: Number(event.target.value) || 1 }))} placeholder="Day number" />
                  <Select value={contentDraft.contentType} onValueChange={(value: "tip" | "audio" | "video" | "checkin") => setContentDraft((current) => ({ ...current, contentType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tip">Tip</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="checkin">Check-in</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => upsertContent.mutate(contentDraft)} disabled={upsertContent.isPending}>
                  Save premium content item
                </Button>
                <div className="space-y-3">
                  {(contentListQuery.data ?? []).map((item) => (
                    <div key={item.id} className="rounded-3xl bg-background/70 p-4">
                      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Day {item.dayNumber} · {item.contentType}</p>
                      <h3 className="mt-1 text-xl font-semibold">{item.title}</h3>
                      <p className="mt-2 leading-7 text-muted-foreground">{item.summary}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-none">
              <CardHeader className="space-y-3">
                <Badge variant="outline" className="w-fit rounded-full px-4 py-2">Admin-only pre-launch QA audit checklist</Badge>
                <CardTitle className="font-display text-4xl">Launch readiness</CardTitle>
                <p className="leading-7 text-muted-foreground">
                  Confirm design polish, premium gating, Petra availability, and email resilience before publication.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {qaItems.map((item) => (
                  <div key={item.id} className="space-y-4 rounded-3xl bg-background/70 p-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <ListChecks className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">{item.label}</h2>
                      </div>
                      <p className="leading-7 text-muted-foreground">{item.description}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[180px_1fr_auto]">
                      <Select defaultValue={item.status} onValueChange={(value: "pending" | "pass" | "fail") => updateQaItem.mutate({ id: item.id, status: value, notes: notes[item.id] })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="pass">Pass</SelectItem>
                          <SelectItem value="fail">Fail</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        value={notes[item.id] ?? item.notes ?? ""}
                        placeholder="Optional audit notes"
                        onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                      />
                      <Button
                        variant="outline"
                        onClick={() => updateQaItem.mutate({ id: item.id, status: item.status, notes: notes[item.id] ?? item.notes ?? "" })}
                      >
                        Save notes
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
