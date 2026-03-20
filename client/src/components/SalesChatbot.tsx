/*
 * SalesChatbot — "Lucy / Lucie" AI Sales Assistant
 * 
 * Personality: Inspired by Leila Hormozi — confident, direct, value-focused, genuinely caring
 * Trigger: Shows after 45s on page OR 50% scroll
 * Email capture: After 2 user messages, Lucy asks for email naturally
 * Survey: After 5+ messages, show 1-5 star satisfaction survey
 * Insights: After conversation ends (chat closed), extract AI insights
 * i18n: Strings from useLanguage()
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Moon, Mail, CheckCircle, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Generate a stable session ID for this browser session
function getSessionId(): string {
  const key = "dsr-chat-session";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function SalesChatbot() {
  const { t, locale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasBeenTriggered, setHasBeenTriggered] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [stickyCtaVisible, setStickyCtaVisible] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [capturedEmail, setCapturedEmail] = useState<string | undefined>();
  const [emailInput, setEmailInput] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Survey state
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyRating, setSurveyRating] = useState(0);
  const [surveyHover, setSurveyHover] = useState(0);
  const [surveyComment, setSurveyComment] = useState("");
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  // Insights extraction state
  const [insightsExtracted, setInsightsExtracted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(getSessionId());

  const leadCaptureMutation = trpc.leads.capture.useMutation();
  const chatInsightsMutation = trpc.chatInsights.save.useMutation();
  const chatSurveyMutation = trpc.chatSurveys.submit.useMutation();

  // Track sticky CTA visibility to avoid overlap on mobile
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const pastHero = scrollY > 600;
      const nearBottom = scrollY + viewportHeight > docHeight * 0.8;
      setStickyCtaVisible(pastHero && !nearBottom);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const chatMutation = trpc.chat.send.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, showEmailForm, showSurvey]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Focus email input when email form shows
  useEffect(() => {
    if (showEmailForm) {
      setTimeout(() => emailInputRef.current?.focus(), 100);
    }
  }, [showEmailForm]);

  // Extract insights when chat closes (if enough messages and not already extracted)
  const extractInsights = useCallback(async (msgs: ChatMessage[]) => {
    if (insightsExtracted || msgs.length < 3) return;
    const userMsgs = msgs.filter(m => m.role === "user");
    if (userMsgs.length < 2) return;

    setInsightsExtracted(true);
    try {
      await chatInsightsMutation.mutateAsync({
        sessionId: sessionId.current,
        email: capturedEmail,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
      });
    } catch {
      // Silent — insights extraction should never break UX
    }
  }, [insightsExtracted, capturedEmail, chatInsightsMutation]);

  // Handle chat close — extract insights and maybe show survey
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Extract insights in background
    extractInsights(messages);
    // Show survey after 5+ user messages and not yet shown
    if (userMessageCount >= 5 && !surveySubmitted && !showSurvey) {
      setTimeout(() => {
        setShowSurvey(true);
        setIsOpen(true); // Re-open to show survey
      }, 500);
    }
  }, [messages, userMessageCount, surveySubmitted, showSurvey, extractInsights]);

  // Trigger after 45s or 50% scroll
  useEffect(() => {
    if (hasBeenTriggered) return;
    const timer = setTimeout(() => {
      triggerChatbot();
    }, 45000);
    const handleScroll = () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent >= 50) {
        triggerChatbot();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasBeenTriggered]);

  const triggerChatbot = useCallback(() => {
    if (hasBeenTriggered) return;
    setHasBeenTriggered(true);
    setIsVisible(true);
    setShowPulse(true);

    const proactiveMessages = t.chatbot.proactiveMessages;
    const proactiveMsg = proactiveMessages[Math.floor(Math.random() * proactiveMessages.length)];
    setMessages([{ role: "assistant", content: proactiveMsg }]);

    setTimeout(() => setShowPulse(false), 10000);
  }, [hasBeenTriggered, t.chatbot.proactiveMessages]);

  const handleEmailSubmit = async () => {
    const email = emailInput.trim();
    if (!email || emailSubmitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setEmailSubmitting(true);
    try {
      const abVariant = localStorage.getItem("dsr-ab-variant") || undefined;
      await leadCaptureMutation.mutateAsync({ email, source: "chatbot", abVariant });
      // Store email for returning customer detection on /order page
      localStorage.setItem("dsr-lead-email", email);
      setEmailCaptured(true);
      setCapturedEmail(email);
      setShowEmailForm(false);
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead", { content_name: "chatbot_email_capture" });
      }
      const confirmMsg = locale === "es"
        ? "Perfecto! 🌙 Tu guía de sueño está en camino. Mientras tanto, ¿hay algo más que pueda ayudarte?"
        : "Perfect! 🌙 Your sleep guide is on its way. In the meantime, is there anything else I can help you with?";
      setMessages(prev => [...prev, { role: "assistant", content: confirmMsg }]);
    } catch {
      // Silent
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleSurveySubmit = async () => {
    if (surveyRating === 0 || surveySubmitting) return;
    setSurveySubmitting(true);
    try {
      await chatSurveyMutation.mutateAsync({
        sessionId: sessionId.current,
        email: capturedEmail,
        rating: surveyRating,
        comment: surveyComment.trim() || undefined,
      });
      setSurveySubmitted(true);
      setShowSurvey(false);
      // Add thank you message
      const thankMsg = locale === "es"
        ? "¡Gracias por tu valoración! 🌙 Nos ayuda a mejorar."
        : "Thank you for your feedback! 🌙 It helps us improve.";
      setMessages(prev => [...prev, { role: "assistant", content: thankMsg }]);
    } catch {
      setSurveySubmitted(true);
      setShowSurvey(false);
    } finally {
      setSurveySubmitting(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const newCount = userMessageCount + 1;
    setUserMessageCount(newCount);

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),
      });

      // After 2 user messages, trigger email capture (if not already captured)
      if (newCount >= 2 && !emailCaptured && !showEmailForm) {
        const emailAskMsg = locale === "es"
          ? result.reply + "\n\n💌 ¿Puedo enviarte una guía gratuita de sueño a tu correo?"
          : result.reply + "\n\n💌 Can I send you a free sleep guide to your email?";
        setMessages(prev => [...prev, { role: "assistant", content: emailAskMsg }]);
        setTimeout(() => setShowEmailForm(true), 800);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: result.reply }]);
      }

      // After 5 user messages, show survey prompt once
      if (newCount === 5 && !surveySubmitted) {
        const surveyPromptMsg = locale === "es"
          ? "¿Cómo te ha parecido nuestra conversación hasta ahora? Me encantaría saber tu opinión 😊"
          : "How has our conversation been so far? I'd love to hear your thoughts 😊";
        setTimeout(() => {
          setMessages(prev => [...prev, { role: "assistant", content: surveyPromptMsg }]);
          setTimeout(() => setShowSurvey(true), 600);
        }, 1500);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: t.chatbot.errorMessage },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed right-4 z-[60] flex flex-col items-end gap-3 transition-all duration-300"
      style={{ bottom: stickyCtaVisible ? '7rem' : '1.5rem' }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div
          className="w-[360px] max-w-[calc(100vw-2rem)] bg-[#0d1220] border border-amber/20 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          style={{
            animation: "chatSlideUp 0.3s ease-out forwards",
            maxHeight: "min(560px, calc(100vh - 120px))",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-amber/10 to-transparent border-b border-amber/15">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-amber/20 flex items-center justify-center">
                <Moon className="w-4 h-4 text-amber" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0d1220]" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground/90 text-sm">{t.chatbot.name}</p>
              <p className="text-foreground/40 text-xs">{t.chatbot.title} • {t.chatbot.status}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-foreground/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: "200px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber/20 text-foreground/90 rounded-br-md"
                      : "bg-white/5 text-foreground/80 rounded-bl-md border border-white/5"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 border border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-amber/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Email capture inline form */}
            {showEmailForm && !emailCaptured && (
              <div className="flex justify-start">
                <div className="max-w-[90%] bg-amber/10 border border-amber/20 rounded-2xl rounded-bl-md px-3.5 py-3 text-sm">
                  <div className="flex items-center gap-2 mb-2 text-amber/80">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium">
                      {locale === "es" ? "Envíame tu email" : "Drop your email"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={emailInputRef}
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleEmailSubmit()}
                      placeholder={locale === "es" ? "tu@email.com" : "you@email.com"}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-foreground/90 placeholder:text-foreground/30 outline-none focus:border-amber/40 transition-colors min-w-0"
                    />
                    <button
                      onClick={handleEmailSubmit}
                      disabled={emailSubmitting}
                      className="bg-amber/20 hover:bg-amber/30 text-amber px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0"
                    >
                      {emailSubmitting ? "..." : (locale === "es" ? "Enviar" : "Send")}
                    </button>
                  </div>
                  <button
                    onClick={() => setShowEmailForm(false)}
                    className="mt-1.5 text-xs text-foreground/30 hover:text-foreground/50 transition-colors"
                  >
                    {locale === "es" ? "No gracias" : "No thanks"}
                  </button>
                </div>
              </div>
            )}

            {/* Email captured confirmation badge */}
            {emailCaptured && (
              <div className="flex justify-center">
                <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  {locale === "es" ? "¡Guía enviada!" : "Guide sent!"}
                </div>
              </div>
            )}

            {/* Satisfaction Survey */}
            {showSurvey && !surveySubmitted && (
              <div className="flex justify-start">
                <div className="max-w-[95%] bg-amber/5 border border-amber/15 rounded-2xl rounded-bl-md px-3.5 py-3 text-sm w-full">
                  <p className="text-foreground/70 text-xs font-medium mb-2">
                    {locale === "es" ? "¿Cómo valoras esta conversación?" : "How would you rate this chat?"}
                  </p>
                  {/* Star rating */}
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onMouseEnter={() => setSurveyHover(star)}
                        onMouseLeave={() => setSurveyHover(0)}
                        onClick={() => setSurveyRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (surveyHover || surveyRating)
                              ? "text-amber fill-amber"
                              : "text-foreground/20"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {/* Optional comment */}
                  {surveyRating > 0 && (
                    <textarea
                      value={surveyComment}
                      onChange={e => setSurveyComment(e.target.value)}
                      placeholder={locale === "es" ? "Comentario opcional..." : "Optional comment..."}
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-foreground/80 placeholder:text-foreground/25 outline-none focus:border-amber/30 transition-colors resize-none mb-2"
                    />
                  )}
                  <div className="flex gap-2">
                    {surveyRating > 0 && (
                      <button
                        onClick={handleSurveySubmit}
                        disabled={surveySubmitting}
                        className="bg-amber/20 hover:bg-amber/30 text-amber px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {surveySubmitting ? "..." : (locale === "es" ? "Enviar" : "Submit")}
                      </button>
                    )}
                    <button
                      onClick={() => setShowSurvey(false)}
                      className="text-xs text-foreground/30 hover:text-foreground/50 transition-colors px-2"
                    >
                      {locale === "es" ? "Omitir" : "Skip"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-white/5">
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5 focus-within:border-amber/30 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chatbot.placeholder}
                className="flex-1 bg-transparent text-foreground/90 text-sm placeholder:text-foreground/30 outline-none"
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isTyping}
                className="p-1.5 rounded-lg bg-amber/20 text-amber hover:bg-amber/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        className={`relative w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-foreground/10 border border-foreground/20"
            : "bg-amber border border-amber/50 cta-pulse"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground/70 mx-auto" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-background mx-auto" />
            {showPulse && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </>
        )}
      </button>
    </div>
  );
}
