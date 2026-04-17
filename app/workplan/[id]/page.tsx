'use client'
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Task, Workplan } from '@/types'
import { computeCodes, indentTask, outdentTask } from '@/lib/taskUtils'
import TaskTable from '@/components/TaskTable'
import dynamic from 'next/dynamic'
import ShareModal from '@/components/ShareModal'

const GanttChart = dynamic(() => import('@/components/GanttChart'), { ssr: false })

type ViewMode = 'Day' | 'Week' | 'Month'

export default function WorkplanEditorPage() {
  const { id } = useParams<{ id: string }>()

  const [workplan, setWorkplan] = useState<Workplan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const [showShare, setShowShare] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/workplans/${id}`).then(r => r.json()).then(setWorkplan)
    fetch(`/api/workplans/${id}/tasks`).then(r => r.json()).then(setTasks)
  }, [id])

  const save = useCallback(async (updatedTasks: Task[]) => {
    setSaving(true)
    const recoded = computeCodes(updatedTasks)
    await Promise.all(
      recoded.map(task =>
        fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        })
      )
    )
    setTasks(recoded)
    setSaving(false)
  }, [])

  function updateField(taskId: string, field: keyof Task, value: string | number | null) {
    setTasks(prev => computeCodes(prev.map(t => t.id === taskId ? { ...t, [field]: value } : t)))
  }

  async function addRoot() {
    const maxPos = tasks.filter(t => !t.parent_id).reduce((m, t) => Math.max(m, t.position), -1)
    const res = await fetch(`/api/workplans/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: null, position: maxPos + 1, title: '' }),
    })
    const newTask = await res.json()
    setTasks(prev => computeCodes([...prev, newTask]))
  }

  async function addBelow(taskId: string) {
    const task = tasks.find(t => t.id === taskId)!
    const siblings = tasks.filter(t => t.parent_id === task.parent_id && t.position > task.position)
    const res = await fetch(`/api/workplans/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parent_id: task.parent_id, position: task.position + 1, title: '' }),
    })
    const newTask = await res.json()
    // shift siblings
    const updated = tasks.map(t =>
      siblings.find(s => s.id === t.id) ? { ...t, position: t.position + 1 } : t
    )
    setTasks(computeCodes([...updated, newTask]))
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Delete this task?')) return
    await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
    setTasks(prev => computeCodes(prev.filter(t => t.id !== taskId)))
  }

  function handleIndent(taskId: string) {
    setTasks(prev => computeCodes(indentTask(prev, taskId)))
  }

  function handleOutdent(taskId: string) {
    setTasks(prev => computeCodes(outdentTask(prev, taskId)))
  }

  const handleDateChange = useCallback((taskId: string, start: Date, end: Date) => {
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    setTasks(prev => computeCodes(prev.map(t =>
      t.id === taskId ? { ...t, planned_start: fmt(start), planned_end: fmt(end) } : t
    )))
  }, [])

  if (!workplan) return <div className="text-gray-500 py-10 text-center">Loading...</div>

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-700 text-sm">← Back</Link>
          <h1 className="text-xl font-bold text-gray-900">{workplan.name}</h1>
          {saving && <span className="text-xs text-gray-400 animate-pulse">Saving...</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/workplan/${id}/dashboard`}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Dashboard
          </Link>
          <button onClick={() => setShowShare(true)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            Share
          </button>
          <button onClick={() => save(tasks)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
          <button onClick={() => window.print()}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Print PDF
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 no-print">
          <h2 className="text-sm font-semibold text-gray-700">Task List</h2>
        </div>
        <div className="p-4">
          <TaskTable
            tasks={tasks}
            onUpdate={updateField}
            onDelete={deleteTask}
            onAddBelow={addBelow}
            onAddRoot={addRoot}
            onIndent={handleIndent}
            onOutdent={handleOutdent}
          />
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print-full">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between no-print">
          <h2 className="text-sm font-semibold text-gray-700">Gantt Chart</h2>
          <div className="flex gap-1">
            {(['Day', 'Week', 'Month'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === m ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <GanttChart tasks={tasks} viewMode={viewMode} onDateChange={handleDateChange} />
        </div>
      </div>

      {showShare && <ShareModal workplanId={id} onClose={() => setShowShare(false)} />}
    </div>
  )
}
