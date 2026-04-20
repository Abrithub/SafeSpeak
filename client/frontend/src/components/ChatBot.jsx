import React, { useState, useRef, useEffect } from "react";
import { aiChat } from "../services/api";

const WELCOME = {
  id: "welcome",
  role: "ai",
  text: "Hi, I'm SafeSpeak AI. I'm here to listen and help — everything is confidential. How can I support you today?",
  resources: [],
  isEmergency: false,
};

const EMERGENCY_KEYWORDS = ["suicide", "kill myself", "end my life", "want to die", "overdose"];

export default function ChatBot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { id: Date.now().toString(), role: "user", text };
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiChat(text, history);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: res.response || "I'm here to help. Please reach out to a crisis line if you need immediate support.",
          resources: res.resources || [],
          isEmergency: res.isEmergency || EMERGENCY_KEYWORDS.some((k) => text.toLowerCase().includes(k)),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I'm having trouble connecting right now. If you need immediate help, please call 988 or text HOME to 741741.",
          resources: [{ name: "Crisis Text Line", contact: "Text HOME to 741741", type: "crisis" }],
          isEmergency: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a2340] text-white shadow-lg flex items-center justify-center text-2xl hover:bg-[#243060] transition"
        aria-label="Open AI Support Chat"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[560px] flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a2340] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-white text-sm font-semibold">SafeSpeak AI</p>
              <p className="text-white/50 text-[10px]">Confidential · Always available</p>
            </div>
            <span className="ml-auto w-2 h-2 rounded-full bg-green-400" title="Online" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1a2340] text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {m.isEmergency && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 mb-2 text-xs text-red-700 font-semibold">
                      🚨 Emergency — Please seek help immediately
                    </div>
                  )}
                  <p>{m.text}</p>
                  {m.resources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Resources</p>
                      {m.resources.map((r, i) => (
                        <p key={i} className="text-xs text-sky-600">
                          📞 {r.name}: <span className="font-semibold">{r.contact}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Type your message..."
              className="flex-1 resize-none text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340] max-h-24"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-[#1a2340] text-white flex items-center justify-center hover:bg-[#243060] disabled:opacity-40 transition shrink-0"
            >
              ➤
            </button>
          </div>

          {/* Footer disclaimer */}
          <p className="text-center text-[10px] text-gray-400 pb-2 bg-white">
            🔒 Confidential · Not a substitute for emergency services
          </p>
        </div>
      )}
    </>
  );
}
