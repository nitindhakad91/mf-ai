import React, { useEffect, useMemo, useRef } from "react";
 
export default function ReviewSendModal({
  open,
  title = "Review & Send",
  value,
  onChange,
  onClose,
  onSave,
  saving,
  email,
  onEmailChange,
  onSend,
  sending,
  statusText,
}) {
  const textareaRef = useRef(null);
 
  // Focus textarea when modal opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);
 
  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
 
  const canSend = useMemo(() => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
    const bodyOk = (value || "").trim().length > 0;
    return emailOk && bodyOk && !sending;
  }, [email, value, sending]);
 
  if (!open) return null;
 
  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
 
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <div className="text-base font-extrabold">{title}</div>
              <div className="text-xs text-slate-300">
                Edit the answer, save it, then email it.
              </div>
            </div>
 
            <button
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
              title="Close (Esc)"
            >
              ✕ Close
            </button>
          </div>
 
          {/* Body */}
          <div className="grid gap-4 p-5">
            {!!statusText && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {statusText}
              </div>
            )}
 
            {/* Editable answer */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">
                Answer (editable)
              </div>
 
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                rows={12}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-slate-400 focus:border-sky-400/40"
                placeholder="Edit the assistant answer here..."
              />
 
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-slate-400">
                  Tip: Press <span className="text-slate-200">Esc</span> to close
                </div>
 
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-2xl bg-gradient-to-r from-emerald-500/35 to-sky-500/25 px-4 py-2 text-sm font-bold text-white hover:from-emerald-500/50 hover:to-sky-500/35 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save edited answer"}
                </button>
              </div>
            </div>
 
            {/* Email */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm font-semibold">Send via email</div>
 
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={email}
                  onChange={(e) => onEmailChange?.(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400/40"
                  placeholder="recipient@example.com"
                />
 
                <button
                  onClick={onSend}
                  disabled={!canSend}
                  className="rounded-2xl bg-gradient-to-r from-sky-500/40 to-indigo-500/30 px-5 py-3 text-sm font-bold text-white hover:from-sky-500/55 hover:to-indigo-500/40 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </div>
 
              <div className="mt-2 text-[11px] text-slate-400">
                Must be a valid email and answer must not be empty.
              </div>
            </div>
          </div>
 
          {/* Footer */}
          <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="text-[11px] text-slate-400">
              You can extend this later with subject/cc/bcc attachments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}