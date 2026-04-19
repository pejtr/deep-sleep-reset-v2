import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function CheckoutSuccessPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="glass-card w-full max-w-3xl border-none">
        <CardContent className="space-y-6 p-8 text-center md:p-12">
          <div className="mx-auto flex h-18 w-18 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-9 w-9 text-primary" />
          </div>
          <Badge variant="secondary" className="rounded-full px-4 py-2">Purchase confirmed</Badge>
          <div className="space-y-3">
            <h1 className="font-display text-5xl">Welcome to DeepSleepReset Premium</h1>
            <p className="mx-auto max-w-2xl leading-8 text-muted-foreground">
              Your checkout is complete. Your members area, progress dashboard, and Petra access are now ready to open.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-full px-8" onClick={() => setLocation("/members")}>
              Open Members Area
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" onClick={() => setLocation("/")}>
              Return to homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
