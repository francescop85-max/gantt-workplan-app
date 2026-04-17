import { Task, TaskLevel } from '@/types'

type RawRow = Record<string, unknown>

function toDateStr(val: unknown): string | null {
  if (!val) return null
  const s = String(val).trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]
  return null
}

function toLevel(val: unknown): TaskLevel {
  const s = String(val ?? '').toLowerCase().trim()
  if (s === 'output') return 'output'
  if (s === 'activity') return 'activity'
  return 'task'
}

export function parseExcelRows(rows: RawRow[]): Omit<Task, 'id' | 'workplan_id' | 'code' | 'position' | 'parent_id'>[] {
  return rows
    .filter(row => String(row['Title'] ?? '').trim() !== '')
    .map(row => ({
      title: String(row['Title'] ?? '').trim(),
      responsible: String(row['Responsible'] ?? '').trim(),
      planned_start: toDateStr(row['Planned Start']),
      planned_end: toDateStr(row['Planned End']),
      actual_start: toDateStr(row['Actual Start']),
      actual_end: toDateStr(row['Actual End']),
      progress: Number(row['Progress (%)'] ?? 0) || 0,
      depends_on: null,
      comments: String(row['Comments'] ?? '').trim(),
      level: toLevel(row['Level']),
    }))
}
