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
    <div className="text-center py-20 text-gray-400">
      <p className="text-lg font-medium">Workplan not found.</p>
      <p className="text-sm mt-1">This link may have expired or been revoked.</p>
    </div>
  )

  if (!workplan) return <div className="text-gray-500 py-10 text-center">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{workplan.name}</h1>
          <p className="text-xs text-gray-400 mt-1">
            Shared workplan · Last updated {new Date(workplan.updated_at).toLocaleDateString('en-GB')}
          </p>
        </div>
        <button onClick={() => window.print()}
          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Print PDF
        </button>
      </div>

      {/* Read-only task list */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Task List</h2>
        </div>
        <div className="overflow-x-auto p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Code','Title','Responsible','Plan Start','Plan End','Act. Start','Act. End','%','Status'].map(h => (
                  <th key={h} className="px-2 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const depth = t.code ? t.code.split('.').length - 1 : 0
                const status = computeStatus(t)
                return (
                  <tr key={t.id} className="border-b border-gray-100">
                    <td className="px-2 py-1.5 text-xs text-gray-400 font-mono">{t.code}</td>
                    <td className="px-2 py-1.5" style={{ paddingLeft: `${8 + depth * 16}px` }}>
                      <span className={depth === 0 ? 'font-semibold' : depth === 1 ? 'font-medium' : 'text-sm'}>
                        {t.title}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-xs text-gray-600">{t.responsible || '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{t.planned_start ?? '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{t.planned_end ?? '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{t.actual_start ?? '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{t.actual_end ?? '—'}</td>
                    <td className="px-2 py-1.5 text-xs">{t.progress}%</td>
                    <td className="px-2 py-1.5"><StatusBadge status={status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gantt */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm print-full">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Gantt Chart</h2>
        </div>
        <div className="p-4">
          <GanttChart tasks={tasks} viewMode="Week" />
        </div>
      </div>
    </div>
  )
}
