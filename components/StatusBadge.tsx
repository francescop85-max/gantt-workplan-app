'use client'
import { TaskStatus } from '@/types'

const styles: Record<TaskStatus, { bg: string; text: string; dot: string }> = {
  'Not Started': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  'In Progress':  { bg: 'bg-blue-50',   text: 'text-blue-700',  dot: 'bg-blue-500' },
  'Completed':    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'Delayed':      { bg: 'bg-red-50',    text: 'text-red-700',   dot: 'bg-red-500' },
}

export default function StatusBadge({ status }: { status: TaskStatus }) {
  const s = styles[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status}
    </span>
  )
}
