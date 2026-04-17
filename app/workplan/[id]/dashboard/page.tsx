'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Task, Workplan } from '@/types'
import dynamic from 'next/dynamic'

const DashboardView = dynamic(() => import('@/components/DashboardView'), { ssr: false })

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>()
  const [workplan, setWorkplan] = useState<Workplan | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    fetch(`/api/workplans/${id}`).then(r => r.json()).then(setWorkplan)
    fetch(`/api/workplans/${id}/tasks`).then(r => r.json()).then(setTasks)
  }, [id])

  if (!workplan) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-slate-400">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="20"/></svg>
        Loading dashboard...
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3 min-w-0">
          <Link href={`/workplan/${id}`} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Editor
          </Link>
          <div className="h-4 w-px bg-slate-200 flex-shrink-0" />
          <h1 className="text-lg font-bold text-slate-900 truncate">{workplan.name}</h1>
          <span className="text-xs font-semibold text-slate-400 flex-shrink-0">Dashboard</span>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2" y="4" width="9" height="6" rx="1" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V2h5v2M4 10v1h5v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          Print PDF
        </button>
      </div>
      <DashboardView tasks={tasks} />
    </div>
  )
}
