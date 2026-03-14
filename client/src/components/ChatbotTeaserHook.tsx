/*
 * Variant B: Chatbot Teaser Hook — 3-Question Qualifying Script
 *
 * Strategy:
 *  - Slides in from bottom-right after 4 seconds
 *  - Lucy asks 3 short qualifying questions (tap to answer)
 *  - Based on answers, shows a personalized CTA (high/medium/low urgency)
 *  - Clicking CTA fires conversion event and opens the full chatbot
 *
 * Conversion event: fired when user clicks the personalized CTA.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles, ChevronRight } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { getSessionId } from "@/lib/ab-hooks";
import { trpc } from "@/lib/trpc";
import type { HookVariant } from "@/lib/ab-hooks";

// ─── Qualifying Script ────────────────────────────────────────────────────────
interface QualifyingQuestion {
  text: string;
  options: { label: string; urgency: number }[]; // urgency 0-2 (low → high)
}

const QUALIFYING_QUESTIONS: QualifyingQuestion[] = [
  {
    text: "How long have you been struggling with sleep?",
    options: [
      { label: "Just started", urgency: 0 },
      { label: "A few months", urgency: 1 },
      { label: "Over a year", urgency: 2 },
    ],
  },
  {
    text: "How does poor sleep affect your day?",
    options: [
      { label: "Slightly tired", urgency: 0 },
      { label: "Low energy & focus", urgency: 1 },
      { label: "It's ruining my life", urgency: 2 },
    ],
  },
  {
    text: "Have you tried anything to fix it?",
    options: [
      { label: "Not yet", urgency: 0 },
      { label: "A few things", urgency: 1 },
      { label: "Everything — nothing works", urgency: 2 },
    ],
  },
];

function getPersonalizedCTA(totalUrgency: number): { headline: string; cta: string; sub: string } {
  if (totalUrgency >= 5) {
    return {
      headline: "You need a real protocol — not tips.",
      cta: "🚀 Start the 7-Night Reset — $5",
      sub: "Science-backed CBT-I. Works in 7 nights.",
    };
  } else if (totalUrgency >= 3) {
    return {
      headline: "Your sleep is fixable — faster than you think.",
      cta: "💡 See the 7-Night Protocol — $5",
      sub: "Thousands have reset their sleep with this.",
    };
  } else {
    return {
      headline: "Even mild sleep issues compound over time.",
      cta: "✨ Explore the Reset — $5",
      sub: "Less than one coffee. 30-day guarantee.",
    };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface ChatbotTeaserHookProps {
  onConversion?: () => void;
  onChatOpen?: () => void;
}

type Phase = "hidden" | "bubble" | "typing" | "question" | "result";

export default function ChatbotTeaserHook({ onConversion, onChatOpen }: ChatbotTeaserHookProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [dismissed, setDismissed] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [totalUrgency, setTotalUrgency] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const trackAbEvent = trpc.ab.trackEvent.useMutation();

  const trackImpression = useCallback(() => {
    trackAbEvent.mutate({
      variant: "chatbot" as HookVariant,
      eventType: "impression",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookImpression", { variant: "chatbot" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t1 = setTimeout(() => {
      setPhase("bubble");
      trackImpression();
    }, 4000);

    const t2 = setTimeout(() => setIsTyping(true), 5500);

    const t3 = setTimeout(() => {
      setIsTyping(false);
      setPhase("question");
    }, 7200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [trackImpression]);

  const handleAnswer = useCallback((urgency: number) => {
    const newUrgency = totalUrgency + urgency;
    setTotalUrgency(newUrgency);

    if (currentQ < QUALIFYING_QUESTIONS.length - 1) {
      // Show typing before next question
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentQ(q => q + 1);
      }, 900);
    } else {
      // All 3 questions answered — show personalized result
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setPhase("result");
      }, 1000);
    }
  }, [totalUrgency, currentQ]);

  const handleCTAClick = useCallback(() => {
    trackAbEvent.mutate({
      variant: "chatbot" as HookVariant,
      eventType: "conversion",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookConversion", { variant: "chatbot" });
    onConversion?.();
    onChatOpen?.();
    setDismissed(true);
  }, [trackAbEvent, onConversion, onChatOpen]);

  const handleDismiss = () => setDismissed(true);

  if (dismissed) return null;
  const isVisible = (phase as string) !== "hidden";
  if (!isVisible) return null;

  const cta = getPersonalizedCTA(totalUrgency);
  const question = QUALIFYING_QUESTIONS[currentQ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Expanded chat panel */}
      <AnimatePresence>
        {(phase === "question" || phase === "result" || isTyping) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-[290px] sm:w-[320px] bg-[#0d1220] border border-amber/25 rounded-2xl rounded-br-sm shadow-2xl shadow-amber/5 overflow-hidden"
          >
            {/* Gradient top bar */}
            <div className="h-0.5 bg-gradient-to-r from-amber/0 via-amber/60 to-amber/0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-amber/15 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0d1220]" />
                </div>
                <div>
                  <p className="text-foreground/90 text-xs font-semibold">Lucy</p>
                  <p className="text-green-400 text-[10px]">Sleep Guide · Online</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-foreground/30 hover:text-foreground/60 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress dots */}
            {phase === "question" && (
              <div className="flex gap-1.5 px-4 pt-3">
                {QUALIFYING_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i < currentQ ? "bg-amber" : i === currentQ ? "bg-amber/60" : "bg-foreground/10"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Content */}
            <div className="px-4 py-3">
              <AnimatePresence mode="wait">
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 py-1"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-amber/50"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Question */}
                {!isTyping && phase === "question" && (
                  <motion.div
                    key={`q-${currentQ}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-foreground/80 text-sm leading-relaxed mb-3">
                      {question.text}
                    </p>
                    <div className="space-y-2">
                      {question.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt.urgency)}
                          className="w-full text-left text-xs text-foreground/70 hover:text-foreground bg-foreground/5 hover:bg-amber/10 border border-border/10 hover:border-amber/30 rounded-lg px-3 py-2.5 transition-all duration-200 flex items-center justify-between group"
                        >
                          {opt.label}
                          <ChevronRight className="w-3.5 h-3.5 text-foreground/20 group-hover:text-amber/60 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Personalized result */}
                {!isTyping && phase === "result" && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="text-foreground/80 text-sm font-medium leading-snug mb-1">
                      {cta.headline}
                    </p>
                    <p className="text-foreground/45 text-xs mb-3">{cta.sub}</p>
                    <button
                      onClick={handleCTAClick}
                      className="w-full bg-amber/10 hover:bg-amber/20 border border-amber/30 text-amber text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                      {cta.cta}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating chat button */}
      <AnimatePresence>
        {isVisible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={handleCTAClick}
            className="relative w-14 h-14 rounded-full bg-amber flex items-center justify-center shadow-lg shadow-amber/30 hover:scale-110 transition-transform duration-200"
            aria-label="Open sleep chat"
          >
            <MessageCircle className="w-6 h-6 text-background" />
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-amber/40"
              animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
