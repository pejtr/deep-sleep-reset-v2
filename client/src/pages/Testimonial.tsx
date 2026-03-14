/**
 * Testimonial Submission Page
 * Public page — accessed via unique token link sent in Day 7 email.
 * Allows customers to submit a star rating + written testimonial.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Moon, Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-10 h-10 transition-colors ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-foreground/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

const NIGHTS_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 10, 14];

const RATING_LABELS: Record<number, string> = {
  1: "Not helpful",
  2: "Slightly helpful",
  3: "Somewhat helpful",
  4: "Very helpful",
  5: "Life-changing!",
};

export default function Testimonial() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [nightsToResult, setNightsToResult] = useState<number | undefined>();
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch existing record to check if already submitted + get name
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } =
    trpc.testimonials.getByToken.useQuery(
      { token },
      { enabled: !!token, retry: false }
    );

  const submitMutation = trpc.testimonials.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Invalid Link</h1>
          <p className="text-foreground/50 text-sm">
            This testimonial link is missing a token. Please use the link from your email.
          </p>
        </div>
      </div>
    );
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">Link Not Found</h1>
          <p className="text-foreground/50 text-sm">
            This testimonial link is invalid or has expired. Please use the link from your Day 7 email.
          </p>
        </div>
      </div>
    );
  }

  if (submitted || tokenData?.alreadySubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-400/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-4">
            Thank you{tokenData?.name ? `, ${tokenData.name.split(" ")[0]}` : ""}! 🌙
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed mb-6">
            Your feedback means the world to us. If you gave consent, your story will help someone
            else finally get the sleep they deserve.
          </p>
          <a
            href="https://deep-sleep-reset.com"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            <Moon className="w-4 h-4" />
            Back to Deep Sleep Reset
          </a>
        </div>
      </div>
    );
  }

  const firstName = tokenData?.name?.split(" ")[0] || "there";
  const canSubmit = rating > 0 && body.trim().length >= 10;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-amber-400 tracking-wide text-sm uppercase">
            Deep Sleep Reset
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 text-xs font-medium uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            🎉 7 Nights Complete
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">
            You made it, {firstName}.
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed max-w-lg mx-auto">
            Seven nights ago, you decided to stop accepting broken sleep. We'd love to hear
            how it went — it takes 30 seconds and helps others like you.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border/30 rounded-2xl p-8 shadow-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              submitMutation.mutate({
                token,
                rating,
                body: body.trim(),
                nightsToResult,
                consentToPublish: consent,
              });
            }}
            className="space-y-8"
          >
            {/* Star rating */}
            <div className="text-center">
              <label className="block text-sm font-medium text-foreground/70 mb-4 uppercase tracking-widest">
                How would you rate the program?
              </label>
              <StarRating value={rating} onChange={setRating} />
              {rating > 0 && (
                <p className="mt-3 text-amber-400 text-sm font-medium">
                  {RATING_LABELS[rating]}
                </p>
              )}
            </div>

            {/* Written testimonial */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2 uppercase tracking-widest">
                What changed for you? *
              </label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="e.g. I used to lie awake for 2 hours every night. After Night 3, I started falling asleep within 20 minutes..."
                rows={5}
                className="bg-background border-border/40 text-foreground placeholder:text-foreground/30 resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-foreground/30">Minimum 10 characters</p>
                <p className="text-xs text-foreground/30">{body.length}/2000</p>
              </div>
            </div>

            {/* Nights to result */}
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-3 uppercase tracking-widest">
                How many nights until you noticed a difference?
              </label>
              <div className="flex flex-wrap gap-2">
                {NIGHTS_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNightsToResult(nightsToResult === n ? undefined : n)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                      nightsToResult === n
                        ? "bg-amber-400 text-background border-amber-400"
                        : "bg-transparent text-foreground/50 border-border/30 hover:border-amber-400/50 hover:text-foreground/80"
                    }`}
                  >
                    Night {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/20">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-amber-400 cursor-pointer"
              />
              <label htmlFor="consent" className="text-sm text-foreground/60 cursor-pointer leading-relaxed">
                I consent to Deep Sleep Reset displaying my testimonial on their website to help others
                who struggle with sleep. My first name and rating may be shown publicly.
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!canSubmit || submitMutation.isPending}
              className="w-full bg-amber-400 hover:bg-amber-300 text-background font-bold py-4 text-base rounded-xl transition-all"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Share My Results →"
              )}
            </Button>

            {submitMutation.isError && (
              <p className="text-red-400 text-sm text-center">
                {submitMutation.error.message || "Something went wrong. Please try again."}
              </p>
            )}

            <p className="text-center text-xs text-foreground/30">
              Completely optional · Your email is never shared · Takes 30 seconds
            </p>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/10 mt-16 py-8 text-center">
        <p className="text-foreground/30 text-xs">
          © {new Date().getFullYear()} Deep Sleep Reset ·{" "}
          <a href="/privacy" className="hover:text-foreground/50 transition-colors">
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
