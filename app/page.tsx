'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Workplan } from '@/types'
import WorkplanCard from '@/components/WorkplanCard'
import ImportModal from '@/components/ImportModal'

export default function HomePage() {
  const [workplans, setWorkplans] = useState<Workplan[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const router = useRouter()

  useEffect(() => { loadWorkplans() }, [])

  async function loadWorkplans() {
    const res = await fetch('/api/workplans')
    setWorkplans(await res.json())
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
    if (!confirm('Delete this workplan?')) return
    await fetch(`/api/workplans/${id}`, { method: 'DELETE' })
    setWorkplans(prev => prev.filter(w => w.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Workplans</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage project workplans with Gantt charts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Import Excel
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Workplan
          </button>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">New Workplan</h2>
            <input
              type="text"
              placeholder="Workplan name *"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
              <button
                onClick={createWorkplan}
                disabled={!newName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && <ImportModal onClose={() => { setShowImport(false); loadWorkplans() }} />}

      {workplans.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">No workplans yet.</p>
          <p className="text-sm mt-1">Create a new workplan or import from Excel to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workplans.map(wp => (
            <WorkplanCard key={wp.id} workplan={wp} onDelete={deleteWorkplan} />
          ))}
        </div>
      )}
    </div>
  )
}
