import React, { useEffect, useRef, useState } from 'react'
import { chat, latest, search as searchApi, health, ocrById, sendEmail } from './api'
import ChatMessage from './components/ChatMessage'
import SidebarItem from './components/SidebarItem'
import ImageOcrModal from './components/ImageOcrModal'
import ReviewSendModal from './components/ReviewSendModal'
 
export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me about the mainframe logs (e.g., “Why did ABC123 fail?”)' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiOk, setApiOk] = useState(null)
 
  const [latestItems, setLatestItems] = useState([])
  const [searchQ, setSearchQ] = useState('')
  const [searchItems, setSearchItems] = useState([])
 
  const bottomRef = useRef(null)
 
  const sampleImages = [
    { id: 1, src: '/samples/1.png', label: 'Sample 1' },
    { id: 2, src: '/samples/2.png', label: 'Sample 2' },
    { id: 3, src: '/samples/3.png', label: 'Sample 3' },
    { id: 4, src: '/samples/4.png', label: 'Sample 4' },
    { id: 5, src: '/samples/5.png', label: 'Sample 5' },
    { id: 6, src: '/samples/6.png', label: 'Sample 6' },
  ]
 
  // ✅ Modal / OCR state
  const [imgModalOpen, setImgModalOpen] = useState(false)
  const [selectedImgIdx, setSelectedImgIdx] = useState(0)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [extractedText, setExtractedText] = useState('')
 
  // ✅ Review & Send modal state
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewMsgIdx, setReviewMsgIdx] = useState(null)
  const [draftAnswer, setDraftAnswer] = useState('')
  const [draftEmail, setDraftEmail] = useState('')
  const [savingDraft, setSavingDraft] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [reviewStatus, setReviewStatus] = useState('')
 
  useEffect(() => {
    (async () => {
      try { await health(); setApiOk(true) } catch { setApiOk(false) }
    })()
  }, [])
 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])
 
  // ✅ Refresh Latest -> show JOBID + STATUS only
  async function refreshLatest() {
    try {
      const res = await latest(10)
      setLatestItems(res.results || [])  // ✅ changed from res.items
    } catch (e) { console.error(e) }
  }
 
  async function doSearch() {
    if (!searchQ.trim()) return
    try {
      const res = await searchApi(searchQ.trim(), 10)
      setSearchItems(res.items || [])
    } catch (e) { console.error(e) }
  }
 
  async function onSend(e) {
    e.preventDefault()
    const q = input.trim()
    if (!q || loading) return
 
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setInput('')
    setLoading(true)
 
    try {
      const res = await chat(q)
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer || '' }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }
 
  // ✅ Open OCR modal from sidebar click
  function openImage(idx) {
    setSelectedImgIdx(idx)
    setExtractedText('')
    setImgModalOpen(true)
  }
 
  // ✅ Close OCR modal
  function closeImageModal() {
    setImgModalOpen(false)
    setExtractedText('')
  }
 
  // ✅ Convert fixed sample (NO UPLOAD)
  async function convertSelectedImage() {
    const img = sampleImages[selectedImgIdx]
    setOcrLoading(true)
    try {
      const res = await ocrById(img.id)
      setExtractedText(res.text || '')
    } catch (e) {
      setExtractedText(`Error: ${e.message}`)
    } finally {
      setOcrLoading(false)
    }
  }
 
  // ✅ Open review modal for a specific assistant message
  function openReviewForMessage(idx) {
    const msg = messages[idx]
    if (!msg || msg.role !== 'assistant') return
 
    setReviewMsgIdx(idx)
    setDraftAnswer(msg.content || '')
    setDraftEmail('')
    setReviewStatus('')
    setReviewOpen(true)
  }
 
  function closeReviewModal() {
    setReviewOpen(false)
    setReviewMsgIdx(null)
    setDraftAnswer('')
    setDraftEmail('')
    setReviewStatus('')
  }
 
  async function saveEditedAnswer() {
    if (reviewMsgIdx == null) return
    setSavingDraft(true)
    try {
      setMessages(prev => {
        const copy = [...prev]
        copy[reviewMsgIdx] = { ...copy[reviewMsgIdx], content: draftAnswer }
        return copy
      })
      setReviewStatus('✅ Saved edited answer into chat.')
    } finally {
      setSavingDraft(false)
    }
  }
 
  async function sendEditedAnswer() {
    const to = (draftEmail || '').trim()
    const body = (draftAnswer || '').trim()
 
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)
    if (!emailOk) {
      setReviewStatus('❌ Please enter a valid email address.')
      return
    }
    if (!body) {
      setReviewStatus('❌ Answer is empty. Please add content before sending.')
      return
    }
 
    setSendingEmail(true)
    setReviewStatus('')
    try {
      await sendEmail({
        to,
        subject: 'Mainframe Log Assistant Response',
        body,
      })
      setReviewStatus(`✅ Sent email to ${to}`)
    } catch (e) {
      setReviewStatus(`❌ Send failed: ${e.message}`)
    } finally {
      setSendingEmail(false)
    }
  }
 
  const pill = apiOk === null
    ? { text: 'Checking API…', cls: 'bg-white/5 border-white/10 text-slate-300' }
    : apiOk
      ? { text: 'API Connected', cls: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200' }
      : { text: 'API Not Reachable', cls: 'bg-rose-500/10 border-rose-400/30 text-rose-200' }
 
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-24 left-1/2 h-[380px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-emerald-400/15 blur-3xl" />
      </div>
 
      {/* ✅ OCR Maximized modal */}
      <ImageOcrModal
        open={imgModalOpen}
        images={sampleImages}
        selectedIndex={selectedImgIdx}
        onSelect={(idx) => {
          setSelectedImgIdx(idx)
          setExtractedText('')
        }}
        onClose={closeImageModal}
        onConvert={convertSelectedImage}
        converting={ocrLoading}
        extractedText={extractedText}
      />
 
      {/* ✅ Review & Send maximized modal */}
      <ReviewSendModal
        open={reviewOpen}
        title="Review & Send"
        value={draftAnswer}
        onChange={setDraftAnswer}
        onClose={closeReviewModal}
        onSave={saveEditedAnswer}
        saving={savingDraft}
        email={draftEmail}
        onEmailChange={setDraftEmail}
        onSend={sendEditedAnswer}
        sending={sendingEmail}
        statusText={reviewStatus}
      />
 
      <div className="relative mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[360px_1fr]">
        <aside className="hidden lg:flex flex-col gap-4 border-r border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold tracking-wide">POC MF AI</div>
              <div className="text-xs text-slate-300">Hackathon UI (Tailwind)</div>
            </div>
            <div className={`rounded-full border px-3 py-1 text-[11px] ${pill.cls}`}>{pill.text}</div>
          </div>
 
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Latest Jobs</div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                onClick={refreshLatest}
              >
                Refresh
              </button>
            </div>
 
           <div className="grid gap-1.5">
  {latestItems.length === 0 ? (
    <div className="text-[11px] text-slate-300">No jobs yet. Click Refresh.</div>
  ) : latestItems.slice(0, 5).map((it, idx) => {
    const jobid = it.jobid || 'UNKNOWN_JOB'
    const status = (it.status || 'N/A').toUpperCase()
 
    const statusCls =
      status === 'SUCCESS' || status === 'OK' || status === 'COMPLETED'
        ? 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
        : status === 'FAILED' || status === 'ERROR' || status === 'ABEND'
          ? 'bg-rose-500/15 text-rose-200 border-rose-400/30'
          : status === 'RUNNING' || status === 'INPROGRESS'
            ? 'bg-amber-500/15 text-amber-200 border-amber-400/30'
            : 'bg-white/10 text-slate-200 border-white/10'
 
    return (
      <div
        key={`${jobid}-${idx}`}
        className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5"
      >
        {/* Job ID (left) */}
        <div className="text-[11px] font-semibold tracking-wide text-slate-100 truncate">
          {jobid}
        </div>
 
        {/* Status pill (right) */}
        <div className={`shrink-0 rounded-full border px-2 py-[2px] text-[10px] font-bold ${statusCls}`}>
          {status}
        </div>
      </div>
    )
  })}
</div>
          </div>
 
          {/* ✅ Sample images */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Sample images</div>
              <div className="text-[11px] text-slate-400">Click any to maximize</div>
            </div>
 
            <div className="grid grid-cols-3 gap-3">
              {sampleImages.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => openImage(idx)}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10"
                  title={img.label}
                >
                  <img
                    src={img.src}
                    alt={img.label}
                    className="h-20 w-full object-cover transition group-hover:scale-[1.02]"
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>
 
        <main className="flex min-h-screen flex-col">
          <header className="border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-extrabold">Mainframe Log Chatbot</div>
                <div className="text-xs text-slate-300">FastAPI backend + Bedrock summaries</div>
              </div>
              <div className={`rounded-full border px-3 py-1 text-[11px] lg:hidden ${pill.cls}`}>{pill.text}</div>
            </div>
          </header>
 
          <section className="flex-1 overflow-auto px-5 py-4">
            {messages.map((m, idx) => (
              <ChatMessage
                key={idx}
                role={m.role}
                content={m.content}
                onReview={m.role === 'assistant' ? () => openReviewForMessage(idx) : undefined}
              />
            ))}
            {loading && <ChatMessage role="assistant" content="Thinking…" />}
            <div ref={bottomRef} />
          </section>
 
          <form onSubmit={onSend} className="border-t border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="flex gap-2">
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-400/40"
                placeholder='Ask: "Why did JOB ABC123 fail?"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-sky-500/40 to-emerald-400/30 px-5 py-3 text-sm font-bold text-white hover:from-sky-500/55 hover:to-emerald-400/40 disabled:opacity-60"
              >
                Send
              </button>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Tip: Try <span className="text-slate-200">"Show recent abends"</span> or{" "}
              <span className="text-slate-200">"What caused RC=08"</span>.
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}