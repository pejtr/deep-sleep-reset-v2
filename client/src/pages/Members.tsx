import { useAuth } from "@/_core/hooks/useAuth";
import { AIChatBox, Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Lock, MoonStar, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const starterMessages: Message[] = [
  {
    role: "assistant",
    content: "I am Petra, your Gentle Support companion inside DeepSleepReset. Tell me how your evening feels, and we will slow it down together.",
  },
];

export default function MembersPage() {
  const { user } = useAuth();
  const dashboardQuery = trpc.member.dashboard.useQuery();
  const feedQuery = trpc.member.feed.useQuery();
  const paymentsQuery = trpc.member.payments.useQuery();
  const checkInMutation = trpc.member.checkIn.useMutation({
    onSuccess: () => {
      dashboardQuery.refetch();
      feedQuery.refetch();
    },
  });
  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    },
  });
  const petraMutation = trpc.petra.chat.useMutation();
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [petraLoading, setPetraLoading] = useState(false);

  const progress = dashboardQuery.data?.progress;
  const completionRatio = progress ? Math.min(100, Math.round((progress.completedDays / 21) * 100)) : 0;
  const hasPremium = dashboardQuery.data?.hasPremium ?? false;

  const feedItems = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);

  const sendPetraMessage = async (content: string) => {
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setPetraLoading(true);

    try {
      const data = await petraMutation.mutateAsync({
        messages: nextMessages.filter((message) => message.role !== "system").map((message) => ({
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
        })),
      });
      const responseText = typeof data.content === "string"
        ? data.content
        : "Petra is taking a quiet pause. Please try again shortly.";
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: responseText,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "I am temporarily unavailable, but your reset can still continue with one slow breath and a softer evening pace.",
        },
      ]);
    } finally {
      setPetraLoading(false);
    }
  };

  if (!hasPremium) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(38,62,138,0.35),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(119,80,255,0.22),transparent_24%),linear-gradient(180deg,rgba(5,8,23,0.2),rgba(5,8,23,0.92))]" />
        <div className="container relative py-16 md:py-24">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-[rgba(8,11,28,0.7)] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl md:p-12">
            <div className="space-y-8 text-center md:text-left">
              <Badge variant="secondary" className="rounded-full border border-[#f0b25b]/20 bg-[rgba(240,178,91,0.12)] px-4 py-2 text-[#f3c57d]">
                Premium gating active
              </Badge>
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.34em] text-[#e7b15a]">Members access checkpoint</p>
                <h1 className="font-display text-5xl leading-[0.95] text-white md:text-7xl">
                  Your personalized reset is protected until Premium access is confirmed.
                </h1>
                <p className="mx-auto max-w-3xl text-base leading-8 text-[#c8cde0] md:mx-0 md:text-lg">
                  This area unlocks the DeepSleepReset program feed, Petra, and daily progress tracking. Your account is recognized, but your premium activation has not completed yet.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.18)] text-[#bf9bff]">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">DeepSleepReset Members Area</h2>
                  <p className="mt-3 leading-7 text-[#b8c0dc]">
                    Continue to secure checkout to unlock the program feed, Petra, sleep lessons, and premium check-ins calibrated to your chronotype direction.
                  </p>
                </div>
                <div className="rounded-[1.75rem] border border-[#9a77ff]/25 bg-[linear-gradient(180deg,rgba(130,91,255,0.18),rgba(130,91,255,0.08))] p-6 text-left">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#f0c486]">Status</p>
                  <p className="mt-3 text-3xl font-semibold text-white">Authenticated</p>
                  <p className="mt-2 leading-7 text-[#d0d5eb]">Your current session is active. The remaining step is premium confirmation.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => checkoutMutation.mutate()}
                  disabled={checkoutMutation.isPending}
                  className="cosmic-cta inline-flex appearance-none items-center justify-center rounded-[1.2rem] border-0 px-8 py-5 text-base font-semibold text-white shadow-[0_18px_55px_rgba(140,97,255,0.45)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {checkoutMutation.isPending ? "Preparing checkout..." : "Continue to secure checkout"}
                </button>
                <button
                  type="button"
                  onClick={() => window.location.assign("/")}
                  className="inline-flex appearance-none items-center justify-center rounded-[1.2rem] border border-white/12 bg-white/5 px-8 py-5 text-base font-semibold text-white transition hover:bg-white/8"
                >
                  Return to funnel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-12">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Card className="glass-card border-none">
            <CardContent className="space-y-6 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge variant="secondary" className="rounded-full px-4 py-2">Premium member</Badge>
                  <h1 className="mt-4 font-display text-5xl">Welcome back, {user?.name?.split(" ")[0] ?? "member"}.</h1>
                  <p className="mt-3 max-w-xl leading-8 text-muted-foreground">
                    Your DeepSleepReset environment is ready. Keep your rhythm gentle, visible, and consistent.
                  </p>
                </div>
                <MoonStar className="mt-2 h-10 w-10 text-primary" />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none bg-background/75 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Current day</p>
                    <p className="mt-2 text-3xl font-semibold">{progress?.currentDay ?? 1}</p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-background/75 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Completed days</p>
                    <p className="mt-2 text-3xl font-semibold">{progress?.completedDays ?? 0}</p>
                  </CardContent>
                </Card>
                <Card className="border-none bg-background/75 shadow-none">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="mt-2 text-3xl font-semibold">{progress?.streakDays ?? 0}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Program completion</span>
                  <span>{completionRatio}%</span>
                </div>
                <Progress value={completionRatio} className="h-3" />
              </div>

              <Button
                size="lg"
                className="rounded-full px-7"
                onClick={() => checkInMutation.mutate()}
                disabled={checkInMutation.isPending}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Log today’s check-in
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-display text-4xl">Premium content history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedItems.length === 0 ? (
                <div className="rounded-3xl bg-background/70 p-6 text-muted-foreground">
                  Premium content will appear here as soon as published items are available in your DeepSleepReset program feed.
                </div>
              ) : (
                feedItems.map((item) => (
                  <div key={item.id} className="rounded-3xl bg-background/70 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Day {item.dayNumber} · {item.contentType}</p>
                        <h2 className="mt-2 text-2xl font-semibold">{item.title}</h2>
                        <p className="mt-2 leading-7 text-muted-foreground">{item.summary}</p>
                      </div>
                      <Badge variant="outline" className="rounded-full">{item.completed ? "Completed" : `${item.progressPercent ?? 0}%`}</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="glass-card border-none">
            <CardHeader>
              <CardTitle className="font-display text-4xl">Payment history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(paymentsQuery.data ?? []).length === 0 ? (
                <div className="rounded-3xl bg-background/70 p-6 text-muted-foreground">
                  Your completed DeepSleepReset purchases will appear here after checkout confirmation.
                </div>
              ) : (
                (paymentsQuery.data ?? []).map((payment) => (
                  <div key={payment.id} className="rounded-3xl bg-background/70 p-5">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{payment.purchaseType} · {payment.status}</p>
                    <h2 className="mt-2 text-2xl font-semibold">{payment.productKey}</h2>
                    <p className="mt-2 leading-7 text-muted-foreground">Created {new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card border-none">
          <CardHeader className="space-y-3">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-2">Petra · Gentle Support</Badge>
            <CardTitle className="font-display text-4xl">A private conversation for Premium subscribers</CardTitle>
            <p className="max-w-2xl leading-7 text-muted-foreground">
              Petra is available only inside DeepSleepReset Premium. Ask for help with evening routines, gentle reframing, or small next steps when your sleep rhythm feels fragile.
            </p>
          </CardHeader>
          <CardContent>
            <AIChatBox
              messages={messages}
              onSendMessage={sendPetraMessage}
              isLoading={petraLoading}
              height={760}
              emptyStateMessage="Petra is ready when you are."
              suggestedPrompts={[
                "Petra, help me settle after a mentally heavy day.",
                "Give me a gentle pre-sleep reset for tonight.",
                "I missed yesterday. How do I restart without guilt?",
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
