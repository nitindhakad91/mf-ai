import React from 'react';

export default function ImageOcrModal({
  open,
  images,
  selectedIndex,
  onSelect,
  onClose,
  onConvert,
  converting,
  extractedText,
}) {
  if (!open) return null;

  const selected = images[selectedIndex];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop (click closes modal) */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="absolute inset-0 p-4 lg:p-10">
        <div className="mx-auto h-full max-w-[1200px] overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <div className="text-sm font-extrabold tracking-wide">
                Sample images
              </div>
              <div className="text-xs text-slate-300">
                Select an image and click Convert to extract text
              </div>
            </div>

            {/* ✅ Close button */}
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
            >
              ✕ Close
            </button>
          </div>

          {/* Body */}
          <div className="grid h-[calc(100%-64px)] grid-cols-1 lg:grid-cols-[340px_1fr]">
            {/* LEFT: Preview + Thumbnails */}
            <div className="border-b border-white/10 bg-white/[0.02] p-4 lg:border-b-0 lg:border-r">
              <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <img
                  src={selected.src}
                  alt={selected.label}
                  className="h-44 w-full rounded-xl bg-black/30 object-contain"
                />
                <div className="mt-2 text-xs text-slate-300">
                  {selected.label}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => onSelect(idx)}
                    className={[
                      'rounded-2xl border p-1 transition',
                      idx === selectedIndex
                        ? 'border-sky-400/50 bg-sky-500/10'
                        : 'border-white/10 bg-white/5 hover:bg-white/10',
                    ].join(' ')}
                    title={img.label}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="h-16 w-full rounded-xl object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Extracted text + Convert */}
            <div className="flex flex-col p-4">
              <div className="flex-1 overflow-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-2 text-sm font-semibold">Extracted Text</div>
                {extractedText ? (
                  <pre className="whitespace-pre-wrap break-words text-xs text-slate-200">
                    {extractedText}
                  </pre>
                ) : (
                  <div className="text-xs text-slate-300">
                    No text yet. Click{' '}
                    <span className="font-semibold text-slate-100">Convert</span>{' '}
                    to extract.
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button
                  onClick={onConvert}
                  disabled={converting}
                  className="rounded-2xl bg-gradient-to-r from-sky-500/40 to-emerald-400/30 px-5 py-3 text-sm font-bold text-white hover:from-sky-500/55 hover:to-emerald-400/40 disabled:opacity-60"
                >
                  {converting ? 'Converting…' : 'Convert'}
                </button>
              </div>
            </div>
          </div>
          {/* end body */}
        </div>
      </div>
    </div>
  );
}