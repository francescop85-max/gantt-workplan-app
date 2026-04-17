'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleImport() {
    if (!file) return
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('name', name || file.name.replace('.xlsx', ''))
    const res = await fetch('/api/import', { method: 'POST', body: fd })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Import failed')
      return
    }
    const { workplan } = await res.json()
    onClose()
    router.push(`/workplan/${workplan.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-600">
                <path d="M3 11v3h10v-3M8 2v9M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Import from Excel</h2>
              <p className="text-xs text-slate-400">Upload a .xlsx workplan file</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 mb-4 text-xs text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-700 mb-1">Required columns:</p>
            Title · Responsible · Planned Start · Planned End · Actual Start · Actual End · Progress (%) · Depends On · Comments · Level
          </div>

          <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={e => setFile(e.target.files?.[0] ?? null)} />

          <button
            onClick={() => inputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-5 text-sm font-medium transition-all mb-3 ${
              file
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50'
            }`}
          >
            {file ? (
              <span className="flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4l5-3 5 3v8H2V4z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 14V8h4v6" stroke="currentColor" strokeWidth="1.3"/></svg>
                {file.name}
              </span>
            ) : 'Click to choose .xlsx file'}
          </button>

          <input
            type="text"
            placeholder="Workplan name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm mb-4 focus:outline-none focus:border-blue-500 transition-colors"
          />

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-red-500 flex-shrink-0"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || loading}
              className="px-5 py-2.5 text-sm font-semibold bg-[#0d1b2a] text-white rounded-xl hover:bg-[#1e3151] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="white" strokeWidth="2" strokeDasharray="20" strokeDashoffset="10"/></svg>}
              {loading ? 'Importing...' : 'Import Workplan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
