import React, { useEffect, useState } from "react"
import { todaySummary } from "../api" // adjust path if needed
 
function DonutChart({
  total = 0,
  successPercent = 0,
  failedPercent = 0,
  successCount = 0,
  failedCount = 0,
}) {
  // purely presentation based on backend-provided percentages
  const r = 46
  const c = 2 * Math.PI * r
  const successLen = (Math.max(0, Number(successPercent) || 0) / 100) * c
  const failedLen = (Math.max(0, Number(failedPercent) || 0) / 100) * c
 
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.10)"
            strokeWidth="12"
          />
 
          {/* Success slice */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(16,185,129,0.9)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${successLen} ${c - successLen}`}
            strokeDashoffset="0"
            transform="rotate(-90 60 60)"
          />
 
          {/* Failed slice */}
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="rgba(244,63,94,0.9)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${failedLen} ${c - failedLen}`}
            strokeDashoffset={-successLen}
            transform="rotate(-90 60 60)"
          />
 
          {/* Center text uses API total */}
          <text
            x="60"
            y="57"
            textAnchor="middle"
            className="fill-slate-100"
            style={{ fontSize: 14, fontWeight: 800 }}
          >
            {total}
          </text>
          <text
            x="60"
            y="74"
            textAnchor="middle"
            className="fill-slate-300"
            style={{ fontSize: 10, fontWeight: 600 }}
          >
            total
          </text>
        </svg>
      </div>
 
      <div className="text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="font-semibold">Success</span>
          <span className="text-slate-300">
            {Number(successPercent || 0).toFixed(2)}%
          </span>
          <span className="text-slate-400">({successCount})</span>
        </div>
 
        <div className="mt-2 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="font-semibold">Failed</span>
          <span className="text-slate-300">
            {Number(failedPercent || 0).toFixed(2)}%
          </span>
          <span className="text-slate-400">({failedCount})</span>
        </div>
      </div>
    </div>
  )
}
 
export default function DashboardModal({ open, onClose }) {
  const [loading, setLoading] = useState(false)
  const [errorText, setErrorText] = useState("")
  const [data, setData] = useState(null)
 
  // Fetch when modal opens
  useEffect(() => {
    if (!open) return
    let alive = true
 
    ;(async () => {
      setLoading(true)
      setErrorText("")
      try {
        const res = await todaySummary()
        if (alive) setData(res)
      } catch (e) {
        if (alive) setErrorText(e?.message || "Failed to load today summary")
      } finally {
        if (alive) setLoading(false)
      }
    })()
 
    return () => {
      alive = false
    }
  }, [open])
 
  if (!open) return null
 
  const jobs = data?.today_jobs || []
 
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
 
      <div className="absolute inset-0 p-3 sm:p-6">
        <div className="mx-auto flex h-full max-w-[1200px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-4">
            <div>
              <div className="text-base font-extrabold">Dashboard</div>
              <div className="text-xs text-slate-300">
                Today’s summary from backend <code>/today-summary</code>
              </div>
            </div>
 
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Close
            </button>
          </div>
 
          <div className="flex-1 overflow-auto p-5">
            {loading ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-200">
                Loading dashboard…
              </div>
            ) : errorText ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-5 text-sm text-rose-200">
                {errorText}
              </div>
            ) : (
              <>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-slate-300">
                      Jobs processed today
                    </div>
                    <div className="mt-2 text-4xl font-extrabold tracking-tight">
                      {data?.today_job_processed ?? 0}
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      (This is returned by the backend.)
                    </div>
                  </div>
 
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-slate-300">
                      Success vs Failed (today)
                    </div>
                    <div className="mt-3">
                      <DonutChart
                        total={data?.today_job_processed ?? 0}
                        successPercent={data?.success_percent ?? 0}
                        failedPercent={data?.failed_percent ?? 0}
                        successCount={data?.success_today ?? 0}
                        failedCount={data?.failed_today ?? 0}
                      />
                    </div>
                  </div>
                </div>
 
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">Today jobs</div>
                    <div className="text-xs text-slate-400">
                      {jobs.length} items (from API)
                    </div>
                  </div>
 
                  {jobs.length === 0 ? (
                    <div className="text-sm text-slate-300">
                      No jobs returned by API.
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {jobs.slice(0, 100).map((j, idx) => (
                        <div
                          key={`${j.jobid}-${idx}`}
                          className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/30 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-100">
                              {j.jobid}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Status:{" "}
                              <span className="font-bold text-slate-200">
                                {String(j.status || "n/a").toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
 
                      {jobs.length > 100 && (
                        <div className="pt-2 text-xs text-slate-400">
                          Showing first 100 items.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
 
          <div className="border-t border-white/10 bg-white/[0.03] px-5 py-3 text-[11px] text-slate-400">
            Source: backend <code>/today-summary</code>
          </div>
        </div>
      </div>
    </div>
  )
}