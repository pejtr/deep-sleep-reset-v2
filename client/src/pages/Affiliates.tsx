/*
 * Affiliates Page — ClickBank Partner Program
 * Design: Midnight Noir — consistent with the rest of the funnel
 * Purpose: Recruit affiliates to promote the Deep Sleep Reset on ClickBank
 */

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "wouter";
import {
  Moon,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Gift,
  Zap,
  CheckCircle,
  ArrowRight,
  Copy,
  Mail,
  Globe,
  Megaphone,
} from "lucide-react";

// Animated section wrapper
function FadeIn({ children, className = "" }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

const commissionTiers = [
  {
    product: "The 7-Night Deep Sleep Reset",
    price: "$5.00",
    commission: "75%",
    payout: "$3.75",
    type: "Front-End",
  },
  {
    product: "Anxiety Dissolve Audio Pack",
    price: "$10.00",
    commission: "50%",
    payout: "$5.00",
    type: "Upsell #1",
  },
  {
    product: "Sleep Optimizer Toolkit",
    price: "$10.00",
    commission: "50%",
    payout: "$5.00",
    type: "Upsell #2",
  },
];

const whyPromote = [
  {
    icon: TrendingUp,
    title: "High Conversion Rate",
    desc: "Our $5 front-end converts at 8-12% cold traffic. Low price = low resistance = high volume.",
  },
  {
    icon: DollarSign,
    title: "Earn Up To $13.75 Per Sale",
    desc: "With both upsells, your average earnings per click (EPC) can reach $1.50+.",
  },
  {
    icon: BarChart3,
    title: "Proven Funnel",
    desc: "Professionally written sales copy, optimized upsell sequence, and tested Meta Ads creatives.",
  },
  {
    icon: Users,
    title: "Massive Market",
    desc: "1 in 3 adults struggle with sleep. The sleep aid market is worth $86B+ globally.",
  },
  {
    icon: Gift,
    title: "Recurring Buyers List",
    desc: "Every buyer enters our email sequence, generating backend commissions for months.",
  },
  {
    icon: Zap,
    title: "Ready-Made Creatives",
    desc: "We provide email swipes, ad copy, banner ads, and social media posts — just copy & paste.",
  },
];

const promotionMethods = [
  {
    icon: Mail,
    title: "Email Marketing",
    desc: "Send our proven email swipes to your health, wellness, or self-improvement list.",
  },
  {
    icon: Globe,
    title: "Blog / SEO",
    desc: "Write sleep-related content and embed your affiliate link. Evergreen traffic = passive income.",
  },
  {
    icon: Megaphone,
    title: "Paid Ads (Meta/Google)",
    desc: "Use our tested ad creatives on Facebook, Instagram, or Google. We provide the copy.",
  },
];

const emailSwipes = [
  {
    subject: "The $5 trick that fixed my insomnia",
    preview: "I used to lie awake until 3 AM every night. Then I found this weird 7-night protocol...",
  },
  {
    subject: "Why sleeping pills are making your insomnia WORSE",
    preview: "New research shows that the #1 sleep aid is actually disrupting your natural sleep cycle...",
  },
  {
    subject: "She slept 8 hours straight for the first time in 10 years",
    preview: "Sarah was a chronic insomniac. Melatonin didn't work. Sleep apps didn't work. But this did...",
  },
];

export default function Affiliates() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative z-10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Moon className="w-5 h-5 text-amber" />
              <span className="font-[var(--font-display)] text-lg font-semibold tracking-wide text-amber">
                Deep Sleep Reset
              </span>
            </div>
          </Link>
          <a
            href="https://accounts.clickbank.com/signup/"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-shimmer bg-amber hover:bg-amber-light text-background font-semibold px-5 py-2.5 rounded-lg text-sm transition-all duration-300 hover:scale-105"
          >
            Sign Up on ClickBank
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-light/30 to-background" />
        <div className="ambient-glow w-[400px] h-[400px] bg-amber/6 top-1/4 right-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 text-center" style={{ animation: 'revealUp 1s ease-out forwards' }}>
            <p className="text-amber text-sm uppercase tracking-[0.3em] mb-6 font-medium">
              Affiliate Partner Program
            </p>
            <h1 className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 text-foreground">
              Earn Up To{" "}
              <span className="gradient-text-animated">$13.75</span>{" "}
              Per Sale
            </h1>
            <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto leading-relaxed mb-8">
              Promote the #1 low-ticket sleep product on ClickBank. High conversions, proven funnel, 
              ready-made creatives — everything you need to start earning today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://accounts.clickbank.com/signup/"
                target="_blank"
                rel="noopener noreferrer"
                className="cta-pulse cta-shimmer inline-flex items-center justify-center gap-3 bg-amber text-background font-bold px-8 py-4 rounded-lg text-lg transition-all duration-300 hover:scale-105 hover:bg-amber-light"
              >
                Become an Affiliate
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="#commission"
                className="inline-flex items-center justify-center gap-2 border border-amber/30 text-amber hover:bg-amber/10 px-8 py-4 rounded-lg text-lg transition-all duration-300"
              >
                View Commission Structure
              </a>
            </div>
        </div>
      </section>

      {/* Quick Stats Bar */}
      <FadeIn>
        <div className="max-w-4xl mx-auto px-4 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Front-End Price", value: "$5" },
              { label: "Max Commission/Sale", value: "$13.75" },
              { label: "Conversion Rate", value: "8-12%" },
              { label: "Cookie Duration", value: "60 Days" },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <p className="text-amber font-[var(--font-display)] text-2xl sm:text-3xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* Why Promote */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              Why Promote Deep Sleep Reset?
            </h2>
            <p className="text-foreground text-center max-w-2xl mx-auto mb-14">
              A proven, high-converting offer in one of the largest health niches on the planet.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyPromote.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="group border border-border/50 rounded-xl p-6 bg-card/50 backdrop-blur-sm hover:bg-card/60 hover:border-amber/20 transition-all duration-500 h-full">
                    <div className="w-12 h-12 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center mb-4 group-hover:bg-amber/20 breathe-glow transition-all duration-500">
                      <Icon className="w-5 h-5 text-amber" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-foreground leading-relaxed text-sm">
                      {item.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commission Structure */}
      <section id="commission" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/30 to-background" />
        <div className="ambient-glow w-[300px] h-[300px] bg-amber/5 top-1/3 left-0 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              Commission Structure
            </h2>
            <p className="text-foreground text-center max-w-xl mx-auto mb-12">
              Earn on every product in our funnel. The more your referrals buy, the more you earn.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="overflow-hidden rounded-xl border border-border/50">
              {/* Table header */}
              <div className="grid grid-cols-5 bg-card/60 border-b border-border/50 px-4 sm:px-6 py-4 text-sm font-medium text-foreground uppercase tracking-wider">
                <span className="col-span-2">Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Commission</span>
                <span className="text-center">Your Payout</span>
              </div>
              {/* Table rows */}
              {commissionTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-5 px-4 sm:px-6 py-5 items-center ${
                    i < commissionTiers.length - 1 ? "border-b border-border/20" : ""
                  } hover:bg-card/30 transition-colors`}
                >
                  <div className="col-span-2">
                    <p className="font-medium text-foreground text-sm sm:text-base">
                      {tier.product}
                    </p>
                    <span className="text-xs text-amber/60 font-medium">{tier.type}</span>
                  </div>
                  <p className="text-center text-foreground">{tier.price}</p>
                  <p className="text-center text-amber font-bold">{tier.commission}</p>
                  <p className="text-center text-green-400 font-bold">{tier.payout}</p>
                </div>
              ))}
              {/* Total row */}
              <div className="grid grid-cols-5 px-4 sm:px-6 py-5 bg-amber/5 border-t border-amber/20">
                <div className="col-span-2">
                  <p className="font-bold text-foreground">Maximum Per Customer</p>
                </div>
                <p className="text-center text-foreground">$25.00</p>
                <p className="text-center text-amber font-bold">—</p>
                <p className="text-center text-green-400 font-bold text-lg">$13.75</p>
              </div>
            </div>
          </FadeIn>

          {/* EPC Calculator */}
          <FadeIn delay={0.2}>
            <div className="mt-10 p-6 rounded-xl border border-amber/15 bg-card/50">
              <h3 className="font-[var(--font-display)] text-xl font-semibold mb-4 text-center">
                Earnings Per Click (EPC) Example
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-foreground/80 text-sm mb-1">1,000 Clicks</p>
                  <p className="text-foreground text-sm">× 10% conversion</p>
                  <p className="text-amber font-bold text-2xl mt-2">100 Sales</p>
                </div>
                <div>
                  <p className="text-foreground/80 text-sm mb-1">100 Front-End Sales</p>
                  <p className="text-foreground text-sm">+ 35 Upsell 1 + 25 Upsell 2</p>
                  <p className="text-green-400 font-bold text-2xl mt-2">$975 Earned</p>
                </div>
                <div>
                  <p className="text-foreground/80 text-sm mb-1">$975 ÷ 1,000 clicks</p>
                  <p className="text-foreground text-sm">Your Earnings Per Click</p>
                  <p className="gradient-text-animated font-bold text-2xl mt-2">$0.975 EPC</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How to Promote */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              How to Promote
            </h2>
            <p className="text-foreground text-center max-w-xl mx-auto mb-14">
              Three proven methods to drive traffic and earn commissions.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {promotionMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="text-center p-8 rounded-xl border border-border/50 bg-card/50 hover:border-amber/20 transition-all duration-500 h-full">
                    <div className="w-16 h-16 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center mx-auto mb-5 breathe-glow">
                      <Icon className="w-7 h-7 text-amber" />
                    </div>
                    <h3 className="font-[var(--font-display)] text-xl font-semibold mb-3 text-foreground">
                      {method.title}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {method.desc}
                    </p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* Email Swipes */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/20 to-background" />
        <div className="relative max-w-4xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-4">
              Ready-Made Email Swipes
            </h2>
            <p className="text-foreground text-center max-w-xl mx-auto mb-12">
              Copy, paste, and send. We've written the emails for you.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {emailSwipes.map((swipe, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="group border border-border/50 rounded-xl p-5 sm:p-6 bg-card/50 hover:bg-card/60 hover:border-amber/15 transition-all duration-500">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">
                        Subject: <span className="text-amber/80">{swipe.subject}</span>
                      </p>
                      <p className="text-foreground text-sm leading-relaxed">
                        {swipe.preview}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(swipe.subject)}
                      className="shrink-0 p-2 rounded-lg hover:bg-amber/10 text-foreground/50 hover:text-amber transition-all"
                      title="Copy subject line"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started Steps */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-center mb-14">
              Get Started in 3 Steps
            </h2>
          </FadeIn>

          <div className="space-y-8">
            {[
              {
                step: 1,
                title: "Create a ClickBank Account",
                desc: "Sign up for a free ClickBank account at clickbank.com. It takes less than 2 minutes.",
              },
              {
                step: 2,
                title: "Find Our Product",
                desc: "Search for \"Deep Sleep Reset\" in the ClickBank Marketplace under Health & Fitness > Sleep Aids. Generate your unique affiliate hop link.",
              },
              {
                step: 3,
                title: "Start Promoting",
                desc: "Use our ready-made email swipes, ad creatives, and banner ads to drive traffic to your affiliate link. You earn commission on every sale.",
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="flex items-start gap-6">
                  <div className="shrink-0 w-14 h-14 rounded-full bg-amber/10 border border-amber/25 flex items-center justify-center breathe-glow">
                    <span className="font-[var(--font-display)] text-amber font-bold text-xl">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-[var(--font-display)] text-xl font-semibold mb-2 text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ClickBank Info Box */}
      <FadeIn>
        <div className="max-w-3xl mx-auto px-4 mb-20">
          <div className="rounded-xl border border-amber/15 bg-card/50 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-[var(--font-display)] text-lg font-semibold mb-2">
                  About ClickBank
                </h3>
                <p className="text-foreground leading-relaxed text-sm">
                  ClickBank is one of the world's largest digital product marketplaces, trusted by 
                  100,000+ affiliates worldwide. They handle all payments, tracking, and commission 
                  payouts automatically. You get paid every two weeks via direct deposit, wire transfer, 
                  or check — no matter where you are in the world.
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light/40 to-background" />
        <div className="ambient-glow w-[350px] h-[350px] bg-amber/6 top-1/3 right-0 translate-x-1/3" />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <FadeIn>
            <h2 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-foreground text-lg mb-8 max-w-xl mx-auto">
              Join hundreds of affiliates already promoting the Deep Sleep Reset. 
              High conversions, proven funnel, generous commissions.
            </p>
            <a
              href="https://accounts.clickbank.com/signup/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-pulse cta-shimmer inline-flex items-center justify-center gap-3 bg-amber hover:bg-amber-light text-background font-bold px-10 py-5 rounded-xl text-xl transition-all duration-300 hover:scale-105"
            >
              Sign Up on ClickBank — It's Free
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="mt-6 text-foreground/50 text-sm">
              Questions? Email us at{" "}
              <a href="mailto:affiliates@deepsleep.com" className="text-amber/50 hover:text-amber transition-colors">
                affiliates@deepsleep.com
              </a>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber/50" />
              <span className="text-foreground/50 text-sm">Deep Sleep Reset — Affiliate Program</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-foreground/50">
              <Link href="/" className="hover:text-amber/60 transition-colors">Sales Page</Link>
              <Link href="/privacy" className="hover:text-amber/60 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-amber/60 transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
