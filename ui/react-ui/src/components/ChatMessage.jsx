import React from "react";
 
export default function ChatMessage({ role, content, onReview }) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
 
  return (
    <div
      className={`flex w-full ${
        isUser ? "justify-end" : "justify-start"
      } my-2`}
    >
      <div
        className={`max-w-[78ch] rounded-2xl border px-4 py-3 shadow-sm backdrop-blur
          ${
            isUser
              ? "bg-sky-500/15 border-sky-400/30"
              : "bg-emerald-400/10 border-emerald-300/25"
          }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-[11px] uppercase tracking-wide text-slate-300/80">
            {isUser ? "You" : "Assistant"}
          </div>
 
          {/* ✅ New action button */}
          {isAssistant && typeof onReview === "function" && (
            <button
              onClick={onReview}
              className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-100 hover:bg-white/10"
              title="Review & Send"
            >
              Review &amp; Send
            </button>
          )}
        </div>
 
        <div className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-100">
          {content}
        </div>
      </div>
    </div>
  );
}