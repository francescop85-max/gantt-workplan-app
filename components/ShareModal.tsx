'use client'
import { useState } from 'react'

export default function ShareModal({ workplanId, onClose }: { workplanId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workplan_id: workplanId, recipient_email: email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Failed to send')
      return
    }
    setSent(true)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-600">
                <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 7l4-2.5M6 9l4 2.5" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Share via Email</h2>
              <p className="text-xs text-slate-400">Send a read-only link to this workplan</p>
            </div>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-emerald-600">
                  <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-semibold text-slate-800 mb-1">Email sent!</p>
              <p className="text-xs text-slate-400 mb-5">The recipient will receive a link shortly.</p>
              <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">Close</button>
            </div>
          ) : (
            <>
              <input
                type="email"
                placeholder="recipient@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm mb-3 focus:outline-none focus:border-blue-500 transition-colors"
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-3">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-500 flex-shrink-0"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button
                  onClick={handleSend}
                  disabled={!email || loading}
                  className="px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {loading && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10"/></svg>}
                  {loading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
