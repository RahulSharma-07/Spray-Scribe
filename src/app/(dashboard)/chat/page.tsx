"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, User, Sparkles, 
  MessageSquare, Eraser, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { MarkdownRenderer } from "@/components/tools/MarkdownRenderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [liveCredits, setLiveCredits] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const credits = liveCredits ?? (session?.user as any)?.credits ?? 0;

  // Always scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    // Fetch live credits from DB — admin may have updated them
    let currentCredits = credits;
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        currentCredits = data.credits;
        setLiveCredits(data.credits);
      }
    } catch { /* fall back to session value */ }

    if (currentCredits < 1) {
      toast.error("You need at least 1 credit to chat.");
      return;
    }

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.map(({ role, content }) => ({ role, content })) }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to get response");
        return;
      }

      const assistantMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: data.output };
      setMessages((prev) => [...prev, assistantMessage]);
      // Update live credits from API response — no NextAuth session update needed
      if (typeof data.creditsRemaining === "number") {
        setLiveCredits(data.creditsRemaining);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear all messages?")) setMessages([]);
  };

  return (
    <div className="flex flex-col max-w-5xl mx-auto" style={{ height: "calc(100vh - 140px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white leading-tight">AI Chat Mode</h1>
            <p className="text-gray-400 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              1 credit per message · <span className="text-yellow-400 font-semibold">{credits}</span> remaining
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2.5 rounded-xl glass border border-white/08 text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-all flex items-center gap-2 text-sm"
        >
          <Eraser className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Chat Container — flex-1 + min-h-0 is the key for scroll to work */}
      <div className="flex-1 min-h-0 glass rounded-3xl border border-white/08 flex flex-col overflow-hidden">

        {/* Scrollable messages area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/05 border border-white/08 flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="font-display text-xl font-bold text-white mb-2">Hello! I'm your AI Assistant</h2>
              <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
                I can help you brainstorm ideas, write content, or answer questions. How can I help you today?
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  "Give me 5 blog ideas about AI",
                  "Write an Instagram caption for a travel photo",
                  "How do I optimize my YouTube SEO?",
                  "Explain React hooks for beginners",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="p-4 rounded-2xl glass border border-white/08 text-left text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all group"
                  >
                    {suggestion}
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all inline-block float-right" />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg self-start mt-1 ${
                      msg.role === "user" ? "btn-gradient" : "bg-white/10 border border-white/10"
                    }`}>
                      {msg.role === "user"
                        ? <User className="w-5 h-5 text-white" />
                        : <Bot className="w-5 h-5 text-blue-400" />}
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600/20 border border-blue-500/20 text-blue-50"
                        : "glass border border-white/08 text-gray-200"
                    }`}>
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="p-4 rounded-2xl glass border border-white/08 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar — fixed at bottom of chat container */}
        <div className="flex-shrink-0 p-4 border-t border-white/08 bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/12 transition-all pr-14"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 rounded-xl btn-gradient text-white shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-gray-600 font-medium">
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Llama 3.3 70B</span>
            <span className="flex items-center gap-1"><Bot className="w-3 h-3" /> Markdown Formatted</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Context Aware</span>
          </div>
        </div>
      </div>
    </div>
  );
}
