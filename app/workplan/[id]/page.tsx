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

  if (!workplan) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="20"/></svg>
        Loading workplan...
      </div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </Link>
          <div className="h-4 w-px bg-slate-200 flex-shrink-0" />
          <h1 className="text-lg font-bold text-slate-900 truncate">{workplan.name}</h1>
          {saving && <span className="text-xs text-blue-500 animate-pulse flex-shrink-0 font-medium">Saving...</span>}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/workplan/${id}/dashboard`}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="7" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="1" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="7" y="7" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
            Dashboard
          </Link>
          <button onClick={() => setShowShare(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="10" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="3" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4.5 7.3l4 2.2M4.5 5.7l4-2.2" stroke="currentColor" strokeWidth="1.3"/></svg>
            Share
          </button>
          <button onClick={() => save(tasks)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 8v3h9V8M6.5 2v6M4.5 6l2 2 2-2" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Save
          </button>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V2h5v2M4 10v1h5v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Print PDF
          </button>
        </div>
      </div>

      {/* Task Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 no-print flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Task List</h2>
          <span className="text-xs text-slate-400">{tasks.length} tasks</span>
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print-full">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <h2 className="text-sm font-bold text-slate-700">Gantt Chart</h2>
          <div className="flex gap-1 bg-slate-200 rounded-lg p-0.5">
            {(['Day', 'Week', 'Month'] as ViewMode[]).map(m => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${viewMode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
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
