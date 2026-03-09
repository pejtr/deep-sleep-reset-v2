/*
 * ReturningCustomerBanner
 * 
 * Shown on the /order page when a returning customer is detected.
 * Lets them skip the order bump and go directly to upsells or a special offer.
 * 
 * Detection: checks localStorage for a stored email, then queries the DB.
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";

export default function ReturningCustomerBanner() {
  const [email, setEmail] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Try to get stored email from localStorage (set when chatbot captures email)
  useEffect(() => {
    const stored = localStorage.getItem("dsr-lead-email");
    if (stored) setEmail(stored);
  }, []);

  const { data: customerData } = trpc.customers.checkReturning.useQuery(
    { email: email! },
    { enabled: !!email && !dismissed }
  );

  const isReturning = customerData?.isReturning ?? false;
  const purchasedProducts = customerData?.purchasedProducts ?? [];

  // Has upsells available (hasn't bought both upsells yet)
  const hasUpsell1 = !purchasedProducts.includes("upsell1");
  const hasUpsell2 = !purchasedProducts.includes("upsell2");

  if (!isReturning || dismissed) return null;

  const handleOneClickUpsell = async () => {
    setLoading(true);
    // Send them to the first upsell they haven't bought
    if (hasUpsell1) {
      window.location.href = "/upsell-1";
    } else if (hasUpsell2) {
      window.location.href = "/upsell-2";
    } else {
      // Already bought everything — send to thank you
      window.location.href = "/thank-you";
    }
    setLoading(false);
  };

  return (
    <div className="mb-8 border border-amber/30 rounded-2xl p-5 bg-amber/5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 rounded-full bg-amber/20 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-amber" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground/90 text-sm mb-1">
            Welcome back! 👋
          </p>
          <p className="text-foreground/60 text-sm mb-3">
            We see you already own the Deep Sleep Reset. 
            {(hasUpsell1 || hasUpsell2) && " Ready to add the next upgrade?"}
          </p>
          {(hasUpsell1 || hasUpsell2) && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleOneClickUpsell}
                disabled={loading}
                className="inline-flex items-center gap-2 bg-amber text-background font-semibold px-4 py-2 rounded-lg text-sm transition-all hover:bg-amber/90 disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {loading ? "Loading..." : "Go to my next upgrade"}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-foreground/40 hover:text-foreground/60 text-sm px-3 py-2 transition-colors"
              >
                No thanks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
