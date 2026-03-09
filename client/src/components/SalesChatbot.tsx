/*
 * SalesChatbot — "Lucie" AI Sales Assistant
 * 
 * Personality: Inspired by Leila Hormozi — confident, direct, value-focused, genuinely caring
 * Trigger: Shows after 45s on page OR 50% scroll
 * Hidden by default, admin-controllable
 * i18n: Strings from useLanguage()
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Moon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chat.send.useMutation();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

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

    // Pick a random proactive message from translations
    const proactiveMessages = t.chatbot.proactiveMessages;
    const proactiveMsg = proactiveMessages[Math.floor(Math.random() * proactiveMessages.length)];
    setMessages([{ role: "assistant", content: proactiveMsg }]);

    // Stop pulse after 10s
    setTimeout(() => setShowPulse(false), 10000);
  }, [hasBeenTriggered, t.chatbot.proactiveMessages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const result = await chatMutation.mutateAsync({
        messages: newMessages,
        scrollPercent: Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100),

      });

      setMessages(prev => [...prev, { role: "assistant", content: result.reply }]);
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
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="w-[360px] max-w-[calc(100vw-2rem)] bg-[#0d1220] border border-amber/20 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          style={{
            animation: "chatSlideUp 0.3s ease-out forwards",
            maxHeight: "min(520px, calc(100vh - 120px))",
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
              onClick={() => setIsOpen(false)}
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
        onClick={() => setIsOpen(!isOpen)}
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
