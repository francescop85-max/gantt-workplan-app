'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Task, Workplan } from '@/types'
import { computeStatus } from '@/lib/taskUtils'
import StatusBadge from '@/components/StatusBadge'
import dynamic from 'next/dynamic'

const GanttChart = dynamic(() => import('@/components/GanttChart'), { ssr: false })

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const [workplan, setWorkplan] = useState<Workplan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(r => { if (!r.ok) { setNotFound(true); return null } return r.json() })
      .then(data => { if (data) { setWorkplan(data.workplan); setTasks(data.tasks) } })
  }, [token])

  if (notFound) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-slate-400">
          <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M14 9v5M14 17.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="text-xl font-bold text-slate-700 mb-1">Workplan not found</p>
      <p className="text-slate-400 text-sm">This link may have expired or been revoked.</p>
    </div>
  )

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
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Read-only
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900">{workplan.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Shared workplan · Last updated {new Date(workplan.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V2h5v2M4 10v1h5v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Print PDF
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-700">Task List</h2>
          <span className="text-xs text-slate-400">{tasks.length} tasks</span>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-100">
                {['Code','Title','Responsible','Plan Start','Plan End','Act. Start','Act. End','%','Status'].map(h => (
                  <th key={h} className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const depth = t.code ? t.code.split('.').length - 1 : 0
                const status = computeStatus(t)
                const isOutput = depth === 0
                return (
                  <tr key={t.id} className={`border-b border-slate-100 ${isOutput ? 'bg-slate-50/60' : ''}`}>
                    <td className="px-2 py-2 text-xs text-slate-400 font-mono">{t.code}</td>
                    <td className="px-2 py-2" style={{ paddingLeft: `${8 + depth * 16}px` }}>
                      <span className={`text-sm ${isOutput ? 'font-bold text-slate-800' : depth === 1 ? 'font-semibold text-slate-700' : 'text-slate-600'}`}>
                        {t.title}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-xs text-slate-600">{t.responsible || '—'}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{t.planned_start ?? '—'}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{t.planned_end ?? '—'}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{t.actual_start ?? '—'}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{t.actual_end ?? '—'}</td>
                    <td className="px-2 py-2 text-xs text-slate-500">{t.progress}%</td>
                    <td className="px-2 py-2"><StatusBadge status={status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm print-full">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-700">Gantt Chart</h2>
        </div>
        <div className="p-4">
          <GanttChart tasks={tasks} viewMode="Week" />
        </div>
      </div>
    </div>
  )
}
