'use client'
import { Workplan } from '@/types'
import Link from 'next/link'

interface Props {
  workplan: Workplan
  onDelete: (id: string) => void
}

const CARD_COLORS = [
  'border-l-blue-500',
  'border-l-violet-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-rose-500',
  'border-l-cyan-500',
]

function colorForId(id: string) {
  const sum = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return CARD_COLORS[sum % CARD_COLORS.length]
}

export default function WorkplanCard({ workplan, onDelete }: Props) {
  const updated = new Date(workplan.updated_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
  const accentColor = colorForId(workplan.id)
  const initials = workplan.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')

  return (
    <div className={`group bg-white rounded-2xl border border-slate-200 border-l-4 ${accentColor} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden`}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 flex-shrink-0`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">{workplan.name}</h2>
            {workplan.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{workplan.description}</p>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Updated {updated}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/workplan/${workplan.id}`}
            className="flex-1 text-center px-3 py-2 text-xs font-semibold bg-[#0d1b2a] text-white rounded-xl hover:bg-[#1e3151] transition-colors"
          >
            Open Editor
          </Link>
          <Link
            href={`/workplan/${workplan.id}/dashboard`}
            className="flex-1 text-center px-3 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
          >
            Dashboard
          </Link>
          <button
            onClick={() => onDelete(workplan.id)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Delete workplan"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5h10M5.5 3.5V2.5h3v1M5.5 6v5M8.5 6v5M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
