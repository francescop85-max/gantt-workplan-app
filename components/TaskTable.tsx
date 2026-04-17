'use client'
import { Task, TaskStatus } from '@/types'
import StatusBadge from './StatusBadge'
import { computeStatus } from '@/lib/taskUtils'

interface Props {
  tasks: Task[]
  onUpdate: (id: string, field: keyof Task, value: string | number | null) => void
  onDelete: (id: string) => void
  onAddBelow: (id: string) => void
  onAddRoot: () => void
  onIndent: (id: string) => void
  onOutdent: (id: string) => void
}

function dateInput(value: string | null, onChange: (v: string | null) => void) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={e => onChange(e.target.value || null)}
      className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5"
    />
  )
}

export default function TaskTable({ tasks, onUpdate, onDelete, onAddBelow, onAddRoot, onIndent, onOutdent }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-100">
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-16">Code</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide min-w-48">Title</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-28">Responsible</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Plan Start</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Plan End</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Act. Start</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Act. End</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-16">%</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Status</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-32">Comments</th>
            <th className="px-2 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide w-24">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const depth = task.code ? task.code.split('.').length - 1 : 0
            const status = computeStatus(task)
            const isOutput = depth === 0
            const isActivity = depth === 1
            return (
              <tr key={task.id} className={`border-b border-slate-100 hover:bg-blue-50/40 transition-colors group ${isOutput ? 'bg-slate-50/60' : ''}`}>
                <td className="px-2 py-2 text-xs text-slate-400 font-mono">{task.code}</td>
                <td className="px-2 py-2">
                  <div style={{ paddingLeft: `${depth * 18}px` }} className="flex items-center gap-1">
                    {isOutput && <span className="w-1 h-4 rounded-full bg-blue-500 flex-shrink-0 mr-1" />}
                    {isActivity && <span className="w-1 h-3 rounded-full bg-slate-300 flex-shrink-0 mr-1" />}
                    <input
                      type="text"
                      value={task.title}
                      onChange={e => onUpdate(task.id, 'title', e.target.value)}
                      className={`w-full border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 bg-transparent text-sm ${isOutput ? 'font-bold text-slate-800' : isActivity ? 'font-semibold text-slate-700' : 'text-slate-600'}`}
                      placeholder="Task title"
                    />
                  </div>
                </td>
                <td className="px-2 py-2">
                  <input type="text" value={task.responsible} onChange={e => onUpdate(task.id, 'responsible', e.target.value)}
                    className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 text-slate-600" />
                </td>
                <td className="px-2 py-2">{dateInput(task.planned_start, v => onUpdate(task.id, 'planned_start', v))}</td>
                <td className="px-2 py-2">{dateInput(task.planned_end, v => onUpdate(task.id, 'planned_end', v))}</td>
                <td className="px-2 py-2">{dateInput(task.actual_start, v => onUpdate(task.id, 'actual_start', v))}</td>
                <td className="px-2 py-2">{dateInput(task.actual_end, v => onUpdate(task.id, 'actual_end', v))}</td>
                <td className="px-2 py-2">
                  <input type="number" min={0} max={100} value={task.progress}
                    onChange={e => onUpdate(task.id, 'progress', Number(e.target.value))}
                    className="w-14 text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 text-slate-600" />
                </td>
                <td className="px-2 py-2"><StatusBadge status={status} /></td>
                <td className="px-2 py-2">
                  <input type="text" value={task.comments} onChange={e => onUpdate(task.id, 'comments', e.target.value)}
                    className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 text-slate-500 placeholder:text-slate-300" placeholder="Notes..." />
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onIndent(task.id)} title="Indent" className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md hover:bg-slate-200 text-slate-500 text-xs">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => onOutdent(task.id)} title="Outdent" className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-md hover:bg-slate-200 text-slate-500 text-xs">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M8 5H2M4 3L2 5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => onAddBelow(task.id)} title="Add row below" className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded-md hover:bg-blue-200 text-blue-600 text-xs font-bold">+</button>
                    <button onClick={() => onDelete(task.id)} title="Delete" className="w-6 h-6 flex items-center justify-center bg-red-50 rounded-md hover:bg-red-100 text-red-400 text-xs">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2.5h6M4 2.5V2h2v.5M4 4v4M6 4v4M2.5 2.5l.5 6h4l.5-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        onClick={onAddRoot}
        className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-semibold border-2 border-dashed border-slate-200 text-slate-400 rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        Add task
      </button>
    </div>
  )
}
