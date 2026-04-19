/*
 * Funnel Optimization Checklist
 * Solo Ads Freedom Stack model: live checklist of all CRO elements
 * Shows green/red status for each conversion element in admin
 */

import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";

interface CheckItem {
  label: string;
  description: string;
  status: "ok" | "warn" | "missing";
  link?: string;
}

function CheckRow({ item }: { item: CheckItem }) {
  const icons = {
    ok: <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />,
    warn: <AlertCircle className="w-4 h-4 text-amber/70 shrink-0" />,
    missing: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
  };
  const colors = {
    ok: "border-green-500/10 bg-green-500/5",
    warn: "border-amber/10 bg-amber/5",
    missing: "border-red-500/10 bg-red-500/5",
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${colors[item.status]}`}>
      {icons[item.status]}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-foreground/85 text-xs font-medium">{item.label}</p>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/30 hover:text-amber transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <p className="text-foreground/40 text-xs mt-0.5 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

export default function FunnelChecklist() {
  const items: CheckItem[] = [
    {
      label: "Squeeze Page (/squeeze)",
      description: "Email capture before sales page — solo ad traffic entry point",
      status: "ok",
      link: "/squeeze",
    },
    {
      label: "Bridge Page (/bridge)",
      description: "Post-purchase confirmation page before upsell chain",
      status: "ok",
      link: "/bridge",
    },
    {
      label: "Exit Intent Popup",
      description: "Captures abandoning visitors with last-chance offer",
      status: "ok",
    },
    {
      label: "Chronotype Quiz (/chronotype-quiz)",
      description: "Top-of-funnel lead magnet for organic & social traffic",
      status: "ok",
      link: "/chronotype-quiz",
    },
    {
      label: "Sales Chatbot",
      description: "AI chatbot on home page to answer objections and convert",
      status: "ok",
    },
    {
      label: "Order Bump (/order)",
      description: "Pre-checkout upsell — Sleep Optimizer Toolkit add-on",
      status: "ok",
      link: "/order",
    },
    {
      label: "Upsell 1 — Anxiety Dissolve ($10)",
      description: "Post-purchase upsell with sticky CTA bar and decline link",
      status: "ok",
      link: "/upsell-1",
    },
    {
      label: "Upsell 2 — Sleep Optimizer Toolkit ($10)",
      description: "Second upsell with sticky CTA bar and decline link",
      status: "ok",
      link: "/upsell-2",
    },
    {
      label: "Upsell 3 — Advanced Mastery ($19)",
      description: "Third upsell with sticky CTA bar and decline link",
      status: "ok",
      link: "/upsell-3",
    },
    {
      label: "Thank You Page (/thank-you)",
      description: "Post-funnel page with affiliate CTA and social sharing",
      status: "ok",
      link: "/thank-you",
    },
    {
      label: "Email Swipe Vault (/swipes)",
      description: "DFY email templates for affiliates and solo ad buyers",
      status: "ok",
      link: "/swipes",
    },
    {
      label: "Funnel Progress Bar",
      description: "Visual progress indicator across all funnel steps",
      status: "ok",
    },
    {
      label: "Social Proof Toast",
      description: "Live purchase notifications to build FOMO",
      status: "ok",
    },
    {
      label: "Meta Pixel",
      description: "Facebook Pixel for retargeting and conversion tracking",
      status: "ok",
    },
    {
      label: "Email Sequence (7-day post-purchase)",
      description: "Automated 7-day nurture sequence — Day 0 welcome + 6 content/upsell emails via Brevo",
      status: "ok",
      link: "/admin/email-sequence",
    },
    {
      label: "Affiliate Program (/affiliates)",
      description: "50% commission affiliate program for traffic partners",
      status: "ok",
      link: "/affiliates",
    },
    {
      label: "ROI Calculator",
      description: "Break-even calculator on order page for solo ad buyers",
      status: "ok",
    },
    {
      label: "A/B Test System",
      description: "Headline A/B testing for home page conversion optimization",
      status: "ok",
    },
  ];

  const okCount = items.filter((i) => i.status === "ok").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const missingCount = items.filter((i) => i.status === "missing").length;
  const score = Math.round((okCount / items.length) * 100);

  return (
    <div className="space-y-3">
      {/* Score header */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/20 bg-card/20">
        <div>
          <p className="text-foreground/80 text-sm font-semibold">Funnel Health Score</p>
          <p className="text-foreground/40 text-xs mt-0.5">
            {okCount} active · {warnCount} warnings · {missingCount} missing
          </p>
        </div>
        <div className="text-right">
          <p
            className={`text-3xl font-bold ${
              score >= 90 ? "text-green-400" : score >= 70 ? "text-amber" : "text-red-400"
            }`}
          >
            {score}%
          </p>
          <p className="text-foreground/30 text-xs">conversion ready</p>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item, i) => (
          <CheckRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}
