'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Workplan } from '@/types'
import WorkplanCard from '@/components/WorkplanCard'
import ImportModal from '@/components/ImportModal'

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        {children}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [workplans, setWorkplans] = useState<Workplan[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { loadWorkplans() }, [])

  async function loadWorkplans() {
    setLoading(true)
    const res = await fetch('/api/workplans')
    setWorkplans(await res.json())
    setLoading(false)
  }

  async function createWorkplan() {
    if (!newName.trim()) return
    const res = await fetch('/api/workplans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, description: newDesc }),
    })
    const wp = await res.json()
    setShowNew(false)
    setNewName('')
    setNewDesc('')
    router.push(`/workplan/${wp.id}`)
  }

  async function deleteWorkplan(id: string) {
    if (!confirm('Delete this workplan? This cannot be undone.')) return
    await fetch(`/api/workplans/${id}`, { method: 'DELETE' })
    setWorkplans(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-600">Project Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Workplans</h1>
          <p className="text-slate-500 mt-1 text-sm">
            {loading ? '' : workplans.length === 0 ? 'No workplans yet — create one to get started.' : `${workplans.length} workplan${workplans.length !== 1 ? 's' : ''} · Click any card to open`}
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-2 border-slate-200 text-slate-700 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 10v3h11v-3M7.5 2v8M4.5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Import Excel
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold bg-[#0d1b2a] text-white rounded-xl hover:bg-[#1e3151] transition-all shadow-md shadow-slate-900/20"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Workplan
          </button>
        </div>
      </div>

      {/* Workplan grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 border-l-4 border-l-slate-200 p-5 h-40 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="flex-1">
                  <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded w-1/3 mb-4" />
              <div className="flex gap-2">
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
                <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : workplans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-slate-400">
              <rect x="2" y="4" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 10h12M8 14h8M8 18h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-slate-700 mb-1">No workplans yet</p>
          <p className="text-slate-400 text-sm mb-6">Create your first workplan or import from Excel</p>
          <div className="flex gap-3">
            <button onClick={() => setShowImport(true)} className="px-4 py-2 text-sm font-semibold border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">Import Excel</button>
            <button onClick={() => setShowNew(true)} className="px-4 py-2 text-sm font-semibold bg-[#0d1b2a] text-white rounded-xl hover:bg-[#1e3151]">+ New Workplan</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workplans.map(wp => (
            <WorkplanCard key={wp.id} workplan={wp} onDelete={deleteWorkplan} />
          ))}
        </div>
      )}

      {/* New workplan modal */}
      {showNew && (
        <Modal onClose={() => setShowNew(false)}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-[#0d1b2a] flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">New Workplan</h2>
            </div>
            <input
              type="text"
              placeholder="Workplan name *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createWorkplan()}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mb-3 focus:outline-none focus:border-blue-500 transition-colors"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm mb-5 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={createWorkplan}
                disabled={!newName.trim()}
                className="px-5 py-2.5 text-sm font-semibold bg-[#0d1b2a] text-white rounded-xl hover:bg-[#1e3151] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Create Workplan
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showImport && <ImportModal onClose={() => { setShowImport(false); loadWorkplans() }} />}
    </div>
  )
}
