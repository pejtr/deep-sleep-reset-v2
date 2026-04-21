import { useState } from "react";

const FAQS = [
  {
    q: "What exactly is the Deep Sleep Reset?",
    a: "It's a 7-night science-backed sleep protocol based on CBT-I (Cognitive Behavioral Therapy for Insomnia) — the same method sleep clinics charge $800+ for. You get a personalized plan based on your chronotype (Lion, Bear, Wolf, or Dolphin) delivered as a PDF guide.",
  },
  {
    q: "How is this different from melatonin or sleep aids?",
    a: "Sleep aids mask the symptom. CBT-I fixes the root cause. The Deep Sleep Reset retrains your brain's sleep drive and circadian rhythm — no pills, no dependency, no side effects. 80% of people see improvement within the first 3 nights.",
  },
  {
    q: "What is a chronotype and why does it matter?",
    a: "Your chronotype is your biological sleep preference — when your body naturally wants to sleep and wake. Lion types thrive at 5am; Wolf types peak at midnight. Ignoring your chronotype is like swimming against the current. Our quiz identifies yours in 60 seconds.",
  },
  {
    q: "I've tried everything. Why would this work?",
    a: "Most sleep advice is generic. This protocol is personalized to your chronotype, lifestyle, and sleep blockers. The quiz identifies your specific pattern, and the guide gives you a precise 7-night schedule — not vague tips like 'avoid screens.'",
  },
  {
    q: "How do I get the guide after purchase?",
    a: "Instantly. After payment, you're redirected to the Thank You page with a direct download link. You also receive an email with the link within 2 minutes. No waiting, no shipping.",
  },
  {
    q: "Is the $5 price really all I pay?",
    a: "Yes. The core 7-Night Deep Sleep Reset guide is $5 — one-time, no subscription. After purchase, we offer optional upgrades (30-Day Program, Audio Sessions, Toolkit) but these are completely optional. You can skip them and still get full value from the $5 guide.",
  },
  {
    q: "What's included in the Premium membership?",
    a: "Premium (from $9.99/month) includes: monthly new sleep protocol, weekly AI-generated sleep score report, access to the private Sleep Optimizers community, and monthly live Q&A recordings. You can cancel anytime from your account.",
  },
  {
    q: "Can I get a refund if it doesn't work?",
    a: "Yes — 30-day money-back guarantee, no questions asked. If you follow the 7-night protocol and don't see improvement, email us and we'll refund you in full. We've had less than 2% refund rate since launch.",
  },
  {
    q: "Is this safe for people with sleep disorders (insomnia, sleep apnea)?",
    a: "The CBT-I protocol is clinically validated and safe for most adults with insomnia. If you have diagnosed sleep apnea, we recommend using this alongside your CPAP therapy, not as a replacement. Always consult your doctor for serious medical conditions.",
  },
  {
    q: "How quickly will I see results?",
    a: "Most users report falling asleep faster by Night 2-3. By Night 7, the majority experience deeper, more consistent sleep. The protocol works fastest when you follow it consistently — even on weekends.",
  },
  {
    q: "Do I need any special equipment or apps?",
    a: "Nothing. Just a PDF reader (your phone works fine) and the willingness to follow the schedule for 7 nights. No app subscriptions, no wearables required — though a sleep tracker can help you see your progress.",
  },
  {
    q: "I still have a question. How can I reach you?",
    a: "Email us at support@deep-sleep-reset.com — we respond within 24 hours on weekdays. Premium members get priority support and can also chat with Petra, our AI sleep assistant, directly in the Members Area.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-4 bg-[oklch(0.09_0.02_255)]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <p className="text-center text-[0.68rem] font-bold text-[oklch(0.82_0.16_65)] uppercase tracking-[0.22em] mb-4">
          Got Questions?
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-black text-center text-white mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-[oklch(0.55_0.04_265)] mb-12 text-sm">
          Everything you need to know before you start your sleep transformation.
        </p>

        {/* Accordion */}
        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[oklch(0.82_0.16_65/0.4)] bg-[oklch(0.12_0.025_265)]"
                    : "border-[oklch(0.22_0.03_265)] bg-[oklch(0.11_0.02_265)] hover:border-[oklch(0.82_0.16_65/0.2)]"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
                  aria-expanded={isOpen}
                >
                  <span className={`font-semibold text-sm leading-snug ${isOpen ? "text-[oklch(0.88_0.14_65)]" : "text-white"}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      isOpen
                        ? "bg-[oklch(0.82_0.16_65/0.2)] text-[oklch(0.82_0.16_65)] rotate-45"
                        : "bg-[oklch(0.18_0.03_265)] text-[oklch(0.55_0.04_265)]"
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5">
                    <div className="h-px bg-[oklch(0.82_0.16_65/0.1)] mb-4" />
                    <p className="text-[oklch(0.72_0.04_265)] text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-10 text-center glass-card rounded-2xl p-6 border border-[oklch(0.82_0.16_65/0.1)]">
          <p className="text-white font-semibold mb-1">Still have a question?</p>
          <p className="text-[oklch(0.55_0.04_265)] text-sm mb-4">
            Premium members can chat with Petra, our AI sleep expert, 24/7.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:support@deep-sleep-reset.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[oklch(0.82_0.16_65/0.3)] text-[oklch(0.82_0.16_65)] text-sm font-semibold hover:bg-[oklch(0.82_0.16_65/0.08)] transition-colors"
            >
              ✉ Email Support
            </a>
            <a
              href="/premium"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[oklch(0.82_0.16_65/0.15)] text-[oklch(0.88_0.14_65)] text-sm font-semibold hover:bg-[oklch(0.82_0.16_65/0.22)] transition-colors border border-[oklch(0.82_0.16_65/0.2)]"
            >
              ✨ Chat with Petra (Premium)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
