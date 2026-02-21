const API_BASE = 'http://localhost:9000'
 
export async function health() {
  const r = await fetch(`${API_BASE}/health`)
  if (!r.ok) throw new Error('health failed')
  return r.json()
}

export async function todaySummary() {
  const r = await fetch(`${API_BASE}/today-summary`)
  if (!r.ok) throw new Error(`today-summary failed: ${r.status}`)
  return r.json()
}

export async function latest(limit = 5) {
  const r = await fetch(`${API_BASE}/latest?limit=${limit}`)
  if (!r.ok) throw new Error('latest failed')
  return r.json()
}
 
export async function search(q, limit = 10) {
  const url = new URL(`${API_BASE}/search`)
  url.searchParams.set('q', q)
  url.searchParams.set('limit', String(limit))
  const r = await fetch(url)
  if (!r.ok) throw new Error('search failed')
  return r.json()
}
 
export async function chat(question) {
  const r = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(t || 'chat failed')
  }
  return r.json()
}
 
// ✅ fixed sample OCR by id (NO UPLOAD)
export async function ocrById(id) {
  const res = await fetch(`${API_BASE}/ocr/${id}`)
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return res.json()
}
 
// ✅ NEW: send email (needs backend endpoint POST /email/send)
export async function sendEmail({ to, subject, body }) {
  const r = await fetch(`${API_BASE}/email/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to,
      subject: subject || 'Mainframe Log Assistant Response',
      body
    })
  })
 
  if (!r.ok) {
    const t = await r.text()
    throw new Error(t || 'email send failed')
  }
  return r.json()
}