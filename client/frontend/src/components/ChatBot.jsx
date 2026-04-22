import React, { useState, useRef, useEffect } from "react";
import { aiChat } from "../services/api";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import { BsShieldCheck } from "react-icons/bs";

const WELCOME = {
  id: "welcome",
  role: "ai",
  text: "Hi 👋 I'm your SafeSpeak Mentor. I can help you:\n• Report an incident step by step\n• Understand what happens after you report\n• Stay safe right now\n• Answer any questions you have\n\nWhat do you need help with?",
  resources: [],
  isEmergency: false,
  intent: "general",
};

const QUICK_PROMPTS = [
  { label: "📋 How do I report?", text: "How do I submit a report? Walk me through the steps." },
  { label: "🛡️ I need safety help", text: "I might be in danger right now. What should I do?" },
  { label: "🔍 Track my case", text: "I already submitted a report. How do I track it?" },
  { label: "😟 I'm scared", text: "I'm scared and don't know what to do or where to start." },
];

const EMERGENCY_KEYWORDS = ["suicide", "kill myself", "end my life", "want to die", "overdose"];

// Exported so other pages can open the chat programmatically
export let openChatBot = () => {};

export default function ChatBot() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([WELCOME]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [showQuick, setShowQuick] = useState(true);
  const [unread, setUnread]       = useState(0);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    openChatBot = () => setOpen(true);
  }, []);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, messages]);

  const send = async (overrideText) => {
    const text = (overrideText || input).trim();
    if (!text || loading) return;
    setInput("");
    setShowQuick(false);

    const userMsg = { id: Date.now().toString(), role: "user", text };
    const history = messages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiChat(text, history);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: res.response || "I'm here to help. Please reach out to a crisis line if you need immediate support.",
        resources: res.resources || [],
        isEmergency: res.isEmergency || EMERGENCY_KEYWORDS.some((k) => text.toLowerCase().includes(k)),
        intent: res.intent || "general",
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          text: "I'm having trouble connecting right now. If you need immediate help, please call +251965485715.",
          resources: [{ name: "SafeSpeak Emergency Line", contact: "+251965485715", type: "crisis" }],
          isEmergency: false,
          intent: "general",
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
      {/* Floating message button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#1a2340] text-white shadow-xl flex items-center justify-center hover:bg-[#243060] transition-all duration-200 hover:scale-105"
        aria-label="Open SafeSpeak Mentor Chat"
      >
        {open ? (
          <FiX size={22} />
        ) : (
          <span className="relative">
            <FiMessageCircle size={26} />
            {unread > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[370px] max-h-[580px] flex flex-col rounded-2xl shadow-2xl border border-gray-200 bg-white overflow-hidden">

          {/* Header */}
          <div className="bg-[#1a2340] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
              <BsShieldCheck size={18} className="text-sky-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">SafeSpeak Mentor</p>
              <p className="text-white/50 text-[10px]">Confidential · Step-by-step guidance · Always here</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white/40 text-[10px]">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-[#1a2340] flex items-center justify-center mr-2 mt-1 shrink-0">
                    <BsShieldCheck size={12} className="text-sky-300" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-[#1a2340] text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                }`}>
                  {m.isEmergency && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 mb-2 text-xs text-red-700 font-semibold">
                      🚨 Emergency — Please seek help immediately
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.resources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Resources</p>
                      {m.resources.map((r, i) =>
                        r.type === "link" ? (
                          <a key={i} href={r.contact} className="block text-xs text-sky-600 hover:underline font-medium">
                            🔗 {r.name}
                          </a>
                        ) : (
                          <p key={i} className="text-xs text-sky-600">
                            📞 {r.name}: <span className="font-semibold">{r.contact}</span>
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Quick prompts */}
            {showQuick && !loading && (
              <div className="flex flex-col gap-2 pt-1 pl-8">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => send(q.text)}
                    className="text-xs text-left bg-white border border-[#1a2340]/20 text-[#1a2340] rounded-xl px-3 py-2 hover:bg-[#1a2340] hover:text-white transition font-medium"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-[#1a2340] flex items-center justify-center shrink-0">
                  <BsShieldCheck size={12} className="text-sky-300" />
                </div>
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
              placeholder="Ask me anything — I'm here to help..."
              className="flex-1 resize-none text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a2340] max-h-24"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-[#1a2340] text-white flex items-center justify-center hover:bg-[#243060] disabled:opacity-40 transition shrink-0"
              aria-label="Send message"
            >
              <FiSend size={15} />
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 pb-2 bg-white">
            🔒 Confidential · Not a substitute for emergency services
          </p>
        </div>
      )}
    </>
  );
}
