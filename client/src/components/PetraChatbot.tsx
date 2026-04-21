import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { MessageCircle, X, Send, Loader2, Moon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hi! I'm Petra, your sleep coach 🌙 I'm here to help you sleep better. What's keeping you up at night?",
};

export default function PetraChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant" as const, content: String(data.reply) }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
      }]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show notification bubble after 15s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) setHasNewMessage(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || sendMessageMutation.isPending) return;

    const newUserMessage: Message = { role: "user", content: text };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInputValue("");

    sendMessageMutation.mutate({
      messages: updatedMessages.filter(m => m.role !== "assistant" || m !== WELCOME_MESSAGE).slice(-10),
      userMessage: text,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Notification bubble */}
        {hasNewMessage && !isOpen && (
          <div className="absolute -top-14 right-0 bg-[oklch(0.12_0.025_265)] border border-[oklch(0.65_0.22_280/0.5)] rounded-2xl px-3 py-2 text-xs text-white whitespace-nowrap shadow-xl animate-bounce-slow">
            💤 Struggling to sleep?
            <div className="absolute bottom-[-6px] right-4 w-3 h-3 bg-[oklch(0.12_0.025_265)] border-r border-b border-[oklch(0.65_0.22_280/0.5)] rotate-45" />
          </div>
        )}

        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center"
          aria-label="Chat with Petra"
        >
          {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
          {hasNewMessage && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[oklch(0.08_0.02_265)] animate-pulse" />
          )}
        </button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-[oklch(0.22_0.04_265)] bg-[oklch(0.1_0.02_265)]" style={{ maxHeight: "480px" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)]">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🌙
            </div>
            <div>
              <p className="text-white font-bold text-sm">Petra</p>
              <p className="text-white/70 text-xs">AI Sleep Coach · Online</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-auto text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "320px" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                    <Moon size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[oklch(0.65_0.22_280)] text-white rounded-br-sm"
                      : "bg-[oklch(0.15_0.025_265)] text-[oklch(0.85_0.03_265)] rounded-bl-sm border border-[oklch(0.22_0.03_265)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] flex items-center justify-center text-sm mr-2 flex-shrink-0">
                  <Moon size={14} className="text-white" />
                </div>
                <div className="bg-[oklch(0.15_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-2xl rounded-bl-sm px-3 py-2">
                  <Loader2 size={16} className="text-[oklch(0.65_0.22_280)] animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {["I can't fall asleep", "I wake up at night", "What's a chronotype?", "Tell me about the $1 guide"].map(q => (
                <button
                  key={q}
                  onClick={() => {
                    setInputValue(q);
                    setTimeout(() => handleSend(), 0);
                    setInputValue(q);
                  }}
                  className="text-xs px-2.5 py-1 rounded-full bg-[oklch(0.15_0.025_265)] border border-[oklch(0.65_0.22_280/0.4)] text-[oklch(0.75_0.04_265)] hover:border-[oklch(0.65_0.22_280)] hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[oklch(0.18_0.03_265)] flex gap-2">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Petra anything..."
              rows={1}
              className="flex-1 resize-none bg-[oklch(0.15_0.025_265)] border border-[oklch(0.22_0.03_265)] rounded-xl px-3 py-2 text-sm text-white placeholder-[oklch(0.45_0.03_265)] focus:outline-none focus:border-[oklch(0.65_0.22_280/0.6)] transition-colors"
              style={{ maxHeight: "80px" }}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[oklch(0.65_0.22_280)] to-[oklch(0.55_0.22_290)] text-white flex items-center justify-center disabled:opacity-40 hover:scale-105 transition-all flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
