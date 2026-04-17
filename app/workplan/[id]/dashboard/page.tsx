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

  if (!workplan) return <div className="text-gray-500 py-10 text-center">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-3">
          <Link href={`/workplan/${id}`} className="text-gray-400 hover:text-gray-700 text-sm">← Editor</Link>
          <h1 className="text-xl font-bold text-gray-900">{workplan.name} — Dashboard</h1>
        </div>
        <button onClick={() => window.print()}
          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Print PDF
        </button>
      </div>
      <DashboardView tasks={tasks} />
    </div>
  )
}
