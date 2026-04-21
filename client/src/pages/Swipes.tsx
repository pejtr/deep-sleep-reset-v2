/*
 * Email Swipe Vault — /swipes
 * DFY email templates for affiliates and solo ad buyers
 * Solo Ads Freedom Stack model: provide pre-written swipes to maximize conversions
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Copy, CheckCheck, Mail, Zap } from "lucide-react";
import { toast } from "sonner";

const SWIPES = [
  {
    id: 1,
    subject: "Subject: I couldn't sleep for 3 years... until I tried THIS",
    tag: "Curiosity",
    tagColor: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    body: `Hey [First Name],

I want to tell you something I've never shared publicly.

For 3 years, I averaged maybe 4 hours of broken sleep a night.

I tried everything. Melatonin. Magnesium. Blackout curtains. White noise machines. Chamomile tea. You name it.

Nothing worked.

Then I discovered a simple 7-night protocol based on something called "sleep pressure reset" — and my first full night of sleep happened on Night 3.

I'm not going to explain the whole thing here (it would take too long), but I found a guide that walks you through it step by step:

>> [YOUR AFFILIATE LINK]

It's only $5 right now (I have no idea why it's that cheap).

If you've been struggling to sleep, this is the most important thing you'll read today.

To better nights,
[Your Name]

P.S. The price goes up soon. Don't wait on this one.`,
  },
  {
    id: 2,
    subject: "Subject: Why you're still tired after 8 hours of sleep",
    tag: "Benefit",
    tagColor: "text-amber/80 bg-amber/10 border-amber/20",
    body: `Hey [First Name],

Here's something most doctors won't tell you:

The NUMBER of hours you sleep matters far less than the QUALITY of your sleep cycles.

You could sleep 9 hours and still wake up exhausted. (Sound familiar?)

That's because most people with sleep problems are stuck in what researchers call "shallow sleep loops" — your body never reaches the deep restorative stages where actual recovery happens.

The good news? There's a specific sequence of techniques that can break this pattern in as little as 7 nights.

I found a $5 guide that explains the whole protocol:

>> [YOUR AFFILIATE LINK]

It covers:
✓ The "sleep pressure reset" technique
✓ The 4-minute racing mind shutdown
✓ The body scan method that physically relaxes your nervous system
✓ The light protocol that resets your internal clock

For $5, it's a no-brainer.

Sleep well,
[Your Name]`,
  },
  {
    id: 3,
    subject: "Subject: [URGENT] Your sleep is costing you more than you think",
    tag: "Fear of Loss",
    tagColor: "text-red-400 bg-red-400/10 border-red-400/20",
    body: `Hey [First Name],

Quick question: How much is bad sleep costing you?

Not just in terms of energy or mood — but in actual, measurable ways:

→ Reduced cognitive function (studies show sleep deprivation cuts IQ by 20-40%)
→ Increased cortisol (the stress hormone that causes weight gain and anxiety)
→ Weakened immune system (you get sick 3x more often)
→ Shortened lifespan (chronic sleep deprivation is linked to heart disease, diabetes, and early death)

I know that sounds dramatic. But it's the science.

The good news is that it's reversible — and faster than you think.

I came across a 7-night protocol that specifically targets the root cause of most sleep problems. It's not another "sleep hygiene" checklist. It's a step-by-step reset.

And right now it's only $5:

>> [YOUR AFFILIATE LINK]

This is the kind of thing you'll wish you'd found years ago.

To your health,
[Your Name]

P.S. The $5 price is temporary. Grab it before it goes up.`,
  },
  {
    id: 4,
    subject: "Subject: What your chronotype says about your sleep problems",
    tag: "Curiosity + Science",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    body: `Hey [First Name],

Did you know that most sleep advice is completely wrong for 3 out of 4 people?

Here's why: Sleep researchers have identified 4 distinct chronotypes — Lion, Bear, Wolf, and Dolphin. Each one has a different optimal sleep window, energy peak, and ideal wake time.

The problem? 90% of sleep advice is written for Bears (the most common type). If you're a Wolf or Dolphin, following standard advice will actually make your sleep WORSE.

I found a free quiz that identifies your chronotype in 60 seconds:

>> https://deep-sleep-reset.com/chronotype-quiz

After you take it, you'll also see a $5 protocol that gives you a personalized 7-night sleep reset based on your specific type.

It's the most targeted sleep solution I've seen at this price point.

Sleep smarter,
[Your Name]`,
  },
  {
    id: 5,
    subject: "Subject: The Navy SEAL breathing trick that puts you to sleep in 4 minutes",
    tag: "Intrigue",
    tagColor: "text-green-400 bg-green-400/10 border-green-400/20",
    body: `Hey [First Name],

Navy SEALs are trained to fall asleep anywhere, anytime — even in combat zones.

The technique they use is called the 4-7-8 breathing pattern. And it works by activating your parasympathetic nervous system (the "rest and digest" mode) within minutes.

Here's the basic version:
- Inhale for 4 seconds
- Hold for 7 seconds
- Exhale for 8 seconds
- Repeat 3-4 times

Most people who try this for the first time fall asleep within 10 minutes.

But here's the thing — this is just ONE of the 7 techniques in a protocol I found that's specifically designed to fix broken sleep cycles.

The full 7-night protocol is only $5 right now:

>> [YOUR AFFILIATE LINK]

Night 4 of the protocol is entirely dedicated to breathing techniques like this one. Night 3 covers a body scan method. Night 2 is a cognitive offload technique for racing minds.

It's genuinely the most practical sleep guide I've seen.

Sleep well,
[Your Name]`,
  },
];

export default function Swipes() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (swipe: (typeof SWIPES)[0]) => {
    const text = `${swipe.subject}\n\n${swipe.body}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(swipe.id);
      toast.success("Swipe copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold text-amber tracking-wide">
              Deep Sleep Reset
            </span>
          </div>
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 rounded-full px-4 py-1.5 text-amber text-xs font-medium mb-4">
            <Mail className="w-3.5 h-3.5" />
            Affiliate Email Swipe Vault
          </div>
          <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-4">
            5 DFY Email Swipes
          </h1>
          <p className="text-foreground/60 text-base leading-relaxed max-w-xl mx-auto">
            Copy-paste these proven email templates to promote Deep Sleep Reset.
            Replace <code className="bg-card/50 px-1 rounded text-amber text-xs">[YOUR AFFILIATE LINK]</code> with your link and{" "}
            <code className="bg-card/50 px-1 rounded text-amber text-xs">[Your Name]</code> with your name.
          </p>
        </div>

        {/* Affiliate link reminder */}
        <div className="bg-card/30 border border-amber/20 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Zap className="w-5 h-5 text-amber shrink-0 mt-0.5" />
          <div>
            <p className="text-foreground/80 text-sm font-medium mb-1">Your affiliate link</p>
            <p className="text-foreground/50 text-xs">
              Sign up at{" "}
              <a href="/affiliates" className="text-amber underline">
                deep-sleep-reset.com/affiliates
              </a>{" "}
              to get your unique tracking link. You earn 50% commission on every sale.
            </p>
          </div>
        </div>

        {/* Swipes */}
        <div className="space-y-6">
          {SWIPES.map((swipe, i) => (
            <motion.div
              key={swipe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="border border-border/20 rounded-xl bg-card/10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/15 bg-card/20">
                <div className="flex items-center gap-3">
                  <span className="text-foreground/40 text-xs font-mono">#{swipe.id}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${swipe.tagColor}`}
                  >
                    {swipe.tag}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(swipe)}
                  className="flex items-center gap-1.5 text-xs text-foreground/50 hover:text-amber transition-colors px-3 py-1.5 rounded-lg hover:bg-amber/10"
                >
                  {copiedId === swipe.id ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-amber" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy swipe
                    </>
                  )}
                </button>
              </div>

              {/* Subject line */}
              <div className="px-5 py-3 border-b border-border/10 bg-amber/3">
                <p className="text-amber/80 text-xs font-medium mb-0.5">Subject line:</p>
                <p className="text-foreground/85 text-sm font-medium">{swipe.subject.replace("Subject: ", "")}</p>
              </div>

              {/* Body */}
              <div className="px-5 py-4">
                <pre className="text-foreground/60 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {swipe.body}
                </pre>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-foreground/30 text-xs">
          <p>These swipes are for affiliates only. Do not redistribute without permission.</p>
          <p className="mt-1">
            Questions?{" "}
            <a href="mailto:support@deep-sleep-reset.com" className="text-amber/50 hover:text-amber transition-colors">
              support@deep-sleep-reset.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
