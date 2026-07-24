import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberInput } from "@/components/ui/CyberInput";
import { Send, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Ask KI — KI Market Inventory" }] }),
  component: ChatPage,
});

function ChatPage() {
  return <ChatUI />;
}

function ChatUI() {
  const transport = useMemo(
    () =>
      new DefaultChatTransport({ api: "/api/chat", credentials: "same-origin" }),
    [],
  );
  const { messages, sendMessage, status } = useChat({ transport });
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function submit(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    void sendMessage({ text: t });
    setInput("");
  }

  const suggestions = [
    "How much have I made today?",
    "Which route is my most profitable?",
    "What time do I trade best?",
    "What is the safest opportunity right now?",
    "Am I profitable overall?",
  ];

  return (
    <AppShell title="Ask Waides KI">
      <GlassCard className="flex flex-col h-[calc(100vh-11rem)] p-0 lg:p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center mb-6 border border-white/20">
                <Zap className="w-8 h-8 text-white" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black text-white drop-shadow-md tracking-tight">System Initialization</h2>
              <p className="mt-3 text-sm text-slate-400 font-medium">
                Waides KI connects directly to your trading matrix. It answers using your actual tracked trades and live scanner data. It never invents numbers.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 active:translate-y-[1px] transition-all shadow-inner"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
            return (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role !== "user" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0 border border-white/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm whitespace-pre-wrap leading-relaxed shadow-lg backdrop-blur-md border ${
                    m.role === "user"
                      ? "bg-slate-800 text-white border-white/10 rounded-tr-sm"
                      : "bg-black/60 text-slate-200 border-cyan-500/30 rounded-tl-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_20px_rgba(6,182,212,0.1)]"
                  }`}
                >
                  {text}
                </div>
              </div>
            );
          })}
          {busy && (
            <div className="flex justify-start">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center mr-3 mt-1 shrink-0 border border-white/20 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-black/60 border border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] px-5 py-4 text-sm text-cyan-400">
                <span className="inline-flex gap-1.5 items-center h-full">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="border-t border-white/10 bg-black/20 p-4 flex gap-3 backdrop-blur-xl shrink-0"
        >
          <CyberInput
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Query matrix logs..."
            className="flex-1 mt-0 py-3.5 border-white/20 bg-black/60"
          />
          <CyberButton
            type="submit"
            disabled={!input.trim() || busy}
            className="px-6 h-full"
          >
            <Send className="w-5 h-5 mr-2 opacity-70" /> {busy ? "Uplinking…" : "Transmit"}
          </CyberButton>
        </form>
      </GlassCard>
    </AppShell>
  );
}
