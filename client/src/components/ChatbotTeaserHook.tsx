/*
 * Variant B: Chatbot Teaser Hook
 *
 * Design: Animated chat bubble that slides in from the bottom-right,
 * pre-seeded with a curiosity-driven opening question.
 * After 3 seconds, a typing indicator appears, then the message reveals.
 * Clicking the bubble opens the full Lucy chatbot.
 *
 * Conversion event: fired when user clicks the CTA inside the bubble.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { getSessionId } from "@/lib/ab-hooks";
import { trpc } from "@/lib/trpc";
import type { HookVariant } from "@/lib/ab-hooks";

const OPENER_MESSAGES = [
  "Quick question — when was the last time you woke up and genuinely thought \"that was the best sleep I've had in years\"?",
  "Curious: what would change in your life if you woke up fully rested every single morning?",
  "Most people accept tired as their baseline. What if you didn't have to?",
];

interface ChatbotTeaserHookProps {
  onConversion?: () => void;
  onChatOpen?: () => void;
}

type Phase = "hidden" | "bubble" | "typing" | "message" | "expanded";

export default function ChatbotTeaserHook({ onConversion, onChatOpen }: ChatbotTeaserHookProps) {
  const [phase, setPhase] = useState<Phase>("hidden");
  const [dismissed, setDismissed] = useState(false);
  const [message] = useState(() => OPENER_MESSAGES[Math.floor(Math.random() * OPENER_MESSAGES.length)]);

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
    // Show bubble after 4 seconds
    const t1 = setTimeout(() => {
      setPhase("bubble");
      trackImpression();
    }, 4000);

    // Show typing indicator after 5.5s
    const t2 = setTimeout(() => setPhase("typing"), 5500);

    // Reveal message after 7.5s
    const t3 = setTimeout(() => setPhase("message"), 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [trackImpression]);

  const handleCTAClick = () => {
    trackAbEvent.mutate({
      variant: "chatbot" as HookVariant,
      eventType: "conversion",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookConversion", { variant: "chatbot" });
    onConversion?.();
    onChatOpen?.();
    setDismissed(true);
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (dismissed) return null;
  const isVisible = (phase as string) !== "hidden";
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Message bubble */}
      <AnimatePresence>
        {(phase === "typing" || phase === "message" || phase === "expanded") && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative max-w-[280px] sm:max-w-[320px] bg-[#0d1220] border border-amber/25 rounded-2xl rounded-br-sm shadow-2xl shadow-amber/5 overflow-hidden"
          >
            {/* Top gradient bar */}
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

            {/* Message content */}
            <div className="px-4 py-3">
              {phase === "typing" ? (
                <div className="flex items-center gap-1 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-amber/50"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="text-foreground/80 text-sm leading-relaxed mb-3">
                    {message}
                  </p>
                  <button
                    onClick={handleCTAClick}
                    className="w-full bg-amber/10 hover:bg-amber/20 border border-amber/25 text-amber text-xs font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 hover:scale-[1.02] text-left"
                  >
                    💬 Tell me more — I want to sleep better
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat bubble button */}
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
