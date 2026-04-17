'use client'
import { Task, TaskStatus } from '@/types'
import { computeStatus } from '@/lib/taskUtils'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const STATUS_COLORS: Record<TaskStatus, string> = {
  'Not Started': '#9ca3af',
  'In Progress': '#3b82f6',
  'Completed':   '#22c55e',
  'Delayed':     '#ef4444',
}

export default function DashboardView({ tasks }: { tasks: Task[] }) {
  const withStatus = tasks.map(t => ({ ...t, status: computeStatus(t) }))

  const statusCounts: Record<TaskStatus, number> = {
    'Not Started': 0, 'In Progress': 0, 'Completed': 0, 'Delayed': 0,
  }
  withStatus.forEach(t => { statusCounts[t.status!]++ })

  const totalTasks = tasks.length
  const completedCount = statusCounts['Completed']
  const overallProgress = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0

  const responsibleMap: Record<string, { total: number; completed: number }> = {}
  withStatus.forEach(t => {
    const r = t.responsible || 'Unassigned'
    if (!responsibleMap[r]) responsibleMap[r] = { total: 0, completed: 0 }
    responsibleMap[r].total++
    if (t.status === 'Completed') responsibleMap[r].completed++
  })

  const delayedTasks = withStatus.filter(t => t.status === 'Delayed')

  const today = new Date()
  const in14 = new Date(today.getTime() + 14 * 86400000)
  const upcoming = withStatus
    .filter(t => t.planned_end && new Date(t.planned_end) >= today && new Date(t.planned_end) <= in14)
    .sort((a, b) => (a.planned_end ?? '').localeCompare(b.planned_end ?? ''))

  const outputs = tasks.filter(t => t.code && !t.code.includes('.'))

  const donutData = {
    labels: Object.keys(statusCounts) as TaskStatus[],
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: (Object.keys(statusCounts) as TaskStatus[]).map(s => STATUS_COLORS[s]),
      borderWidth: 0,
    }],
  }

  const responsibleNames = Object.keys(responsibleMap)
  const barData = {
    labels: responsibleNames,
    datasets: [
      { label: 'Total', data: responsibleNames.map(r => responsibleMap[r].total), backgroundColor: '#dbeafe' },
      { label: 'Completed', data: responsibleNames.map(r => responsibleMap[r].completed), backgroundColor: '#22c55e' },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Overall Progress</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
            <div className="h-4 rounded-full bg-blue-600 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <span className="text-2xl font-bold text-gray-900">{overallProgress}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">{completedCount} of {totalTasks} tasks completed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Breakdown</h3>
          <div className="h-48">
            <Doughnut data={donutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </div>

        {/* By responsible */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tasks by Responsible</h3>
          <div className="h-48">
            <Bar data={barData} options={{
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              plugins: { legend: { position: 'top' as const } },
            }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delayed tasks */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            Delayed Tasks ({delayedTasks.length})
          </h3>
          {delayedTasks.length === 0 ? (
            <p className="text-sm text-gray-400">No delayed tasks.</p>
          ) : (
            <ul className="space-y-2">
              {delayedTasks.map(t => (
                <li key={t.id} className="text-sm bg-red-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-red-700">{t.code}</span>{' '}
                  <span className="text-gray-700">{t.title}</span>
                  <span className="text-xs text-gray-400 block">Due: {t.planned_end}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Upcoming Deadlines (next 14 days)
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-sm text-gray-400">No deadlines in the next 14 days.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(t => (
                <li key={t.id} className="text-sm bg-blue-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-blue-700">{t.code}</span>{' '}
                  <span className="text-gray-700">{t.title}</span>
                  <span className="text-xs text-gray-400 block">Due: {t.planned_end}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Output-level progress */}
      {outputs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Progress by Output</h3>
          <div className="space-y-3">
            {outputs.map(output => {
              const subtasks = withStatus.filter(t => t.code === output.code || t.code.startsWith(output.code + '.'))
              const done = subtasks.filter(t => t.status === 'Completed').length
              const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0
              return (
                <div key={output.id}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span><strong>{output.code}</strong> {output.title}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
