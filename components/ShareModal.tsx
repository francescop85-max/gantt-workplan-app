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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Share via Email</h2>
        {sent ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-medium">Email sent!</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 text-sm bg-gray-100 rounded-lg">Close</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">Recipient will get a read-only link to this workplan.</p>
            <input
              type="email"
              placeholder="recipient@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={handleSend}
                disabled={!email || loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
