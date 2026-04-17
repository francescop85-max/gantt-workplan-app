'use client'
import { Workplan } from '@/types'
import Link from 'next/link'

interface Props {
  workplan: Workplan
  onDelete: (id: string) => void
}

export default function WorkplanCard({ workplan, onDelete }: Props) {
  const updated = new Date(workplan.updated_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{workplan.name}</h2>
          {workplan.description && (
            <p className="text-sm text-gray-500 mt-1">{workplan.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">Updated {updated}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        <Link
          href={`/workplan/${workplan.id}`}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open Editor
        </Link>
        <Link
          href={`/workplan/${workplan.id}/dashboard`}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={() => onDelete(workplan.id)}
          className="px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
