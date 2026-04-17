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
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-16">Code</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 min-w-48">Title</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-28">Responsible</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-24">Plan Start</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-24">Plan End</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-24">Act. Start</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-24">Act. End</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-16">%</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-20">Status</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-32">Comments</th>
            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-500 w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => {
            const depth = task.code ? task.code.split('.').length - 1 : 0
            const status = computeStatus(task)
            return (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                <td className="px-2 py-1 text-xs text-gray-400 font-mono">{task.code}</td>
                <td className="px-2 py-1">
                  <div style={{ paddingLeft: `${depth * 16}px` }} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={task.title}
                      onChange={e => onUpdate(task.id, 'title', e.target.value)}
                      className={`w-full border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5 bg-transparent ${depth === 0 ? 'font-semibold' : depth === 1 ? 'font-medium' : ''}`}
                      placeholder="Task title"
                    />
                  </div>
                </td>
                <td className="px-2 py-1">
                  <input type="text" value={task.responsible} onChange={e => onUpdate(task.id, 'responsible', e.target.value)}
                    className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5" />
                </td>
                <td className="px-2 py-1">{dateInput(task.planned_start, v => onUpdate(task.id, 'planned_start', v))}</td>
                <td className="px-2 py-1">{dateInput(task.planned_end, v => onUpdate(task.id, 'planned_end', v))}</td>
                <td className="px-2 py-1">{dateInput(task.actual_start, v => onUpdate(task.id, 'actual_start', v))}</td>
                <td className="px-2 py-1">{dateInput(task.actual_end, v => onUpdate(task.id, 'actual_end', v))}</td>
                <td className="px-2 py-1">
                  <input type="number" min={0} max={100} value={task.progress}
                    onChange={e => onUpdate(task.id, 'progress', Number(e.target.value))}
                    className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5" />
                </td>
                <td className="px-2 py-1"><StatusBadge status={status} /></td>
                <td className="px-2 py-1">
                  <input type="text" value={task.comments} onChange={e => onUpdate(task.id, 'comments', e.target.value)}
                    className="w-full text-xs border-0 focus:ring-1 focus:ring-blue-400 rounded px-1 py-0.5" placeholder="Notes..." />
                </td>
                <td className="px-2 py-1">
                  <div className="flex gap-1 flex-wrap">
                    <button onClick={() => onIndent(task.id)} title="Indent" className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200">→</button>
                    <button onClick={() => onOutdent(task.id)} title="Outdent" className="text-xs px-1.5 py-0.5 bg-gray-100 rounded hover:bg-gray-200">←</button>
                    <button onClick={() => onAddBelow(task.id)} title="Add row below" className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+</button>
                    <button onClick={() => onDelete(task.id)} title="Delete" className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded hover:bg-red-200">×</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <button
        onClick={onAddRoot}
        className="mt-3 px-3 py-1.5 text-sm border border-dashed border-gray-300 text-gray-500 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add task
      </button>
    </div>
  )
}
