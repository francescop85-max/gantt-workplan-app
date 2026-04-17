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
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          { label: 'Total Tasks', value: totalTasks, color: 'text-slate-900' },
          { label: 'Completed', value: statusCounts['Completed'], color: 'text-emerald-600' },
          { label: 'In Progress', value: statusCounts['In Progress'], color: 'text-blue-600' },
          { label: 'Delayed', value: statusCounts['Delayed'], color: 'text-red-500' },
        ] as const).map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className={`text-3xl font-extrabold ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">Overall Progress</h3>
          <span className="text-2xl font-extrabold text-slate-900">{overallProgress}%</span>
        </div>
        <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className="h-3 rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
        </div>
        <p className="text-xs text-slate-400 mt-2">{completedCount} of {totalTasks} tasks completed</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Status Breakdown</h3>
          <div className="h-52">
            <Doughnut data={donutData} options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, padding: 12 } } },
            }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Tasks by Responsible</h3>
          <div className="h-52">
            <Bar data={barData} options={{
              maintainAspectRatio: false,
              indexAxis: 'y' as const,
              plugins: { legend: { position: 'top' as const, labels: { font: { size: 11 }, boxWidth: 10 } } },
              scales: { x: { grid: { color: '#f1f5f9' } }, y: { grid: { display: false } } },
            }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Delayed Tasks
            <span className="ml-auto text-xs font-normal text-slate-400">{delayedTasks.length} task{delayedTasks.length !== 1 ? 's' : ''}</span>
          </h3>
          {delayedTasks.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4v4l2 2M8 14A6 6 0 108 2a6 6 0 000 12z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              No delayed tasks
            </div>
          ) : (
            <ul className="space-y-2">
              {delayedTasks.map(t => (
                <li key={t.id} className="flex items-start gap-2 bg-red-50 rounded-xl px-3 py-2.5">
                  <span className="font-mono text-xs text-red-400 mt-0.5 flex-shrink-0">{t.code}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400">Due: {t.planned_end}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Upcoming Deadlines
            <span className="ml-auto text-xs font-normal text-slate-400">next 14 days</span>
          </h3>
          {upcoming.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-slate-400 py-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 2v2M11 2v2M2 7h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              No upcoming deadlines
            </div>
          ) : (
            <ul className="space-y-2">
              {upcoming.map(t => (
                <li key={t.id} className="flex items-start gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                  <span className="font-mono text-xs text-amber-500 mt-0.5 flex-shrink-0">{t.code}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{t.title}</p>
                    <p className="text-xs text-slate-400">Due: {t.planned_end}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {outputs.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Progress by Output</h3>
          <div className="space-y-4">
            {outputs.map(output => {
              const subtasks = withStatus.filter(t => t.code === output.code || t.code.startsWith(output.code + '.'))
              const done = subtasks.filter(t => t.status === 'Completed').length
              const pct = subtasks.length ? Math.round((done / subtasks.length) * 100) : 0
              return (
                <div key={output.id}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-700"><span className="font-mono text-slate-400 mr-1">{output.code}</span>{output.title}</span>
                    <span className="font-bold text-slate-600">{pct}%</span>
                  </div>
                  <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{done} of {subtasks.length} tasks completed</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
