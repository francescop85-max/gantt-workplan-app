import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import sql from '@/lib/db'
import { parseExcelRows } from '@/lib/excelParser'
import { computeCodes, computeStatus } from '@/lib/taskUtils'
import { Task } from '@/types'

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File
  const workplanName = formData.get('name') as string

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const wb = XLSX.read(buffer, { type: 'buffer' })
  const sheet = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet)

  const parsedTasks = parseExcelRows(rows as Record<string, unknown>[])
  if (!parsedTasks.length) {
    return NextResponse.json({ error: 'No valid tasks found in file' }, { status: 422 })
  }

  const wps = await sql`
    INSERT INTO workplans (name, description)
    VALUES (${workplanName || file.name.replace('.xlsx', '')}, '')
    RETURNING *
  `
  const workplan = wps[0]

  const insertedTasks: Task[] = []
  for (let i = 0; i < parsedTasks.length; i++) {
    const t = parsedTasks[i]
    const rows = await sql`
      INSERT INTO tasks (
        workplan_id, position, title, responsible, comments,
        planned_start, planned_end, actual_start, actual_end, progress, level
      ) VALUES (
        ${workplan.id}, ${i}, ${t.title}, ${t.responsible}, ${t.comments},
        ${t.planned_start}, ${t.planned_end}, ${t.actual_start}, ${t.actual_end},
        ${t.progress}, ${t.level}
      )
      RETURNING *
    `
    insertedTasks.push(rows[0] as Task)
  }

  const withCodes = computeCodes(insertedTasks)
  const withStatus = withCodes.map(t => ({ ...t, status: computeStatus(t) }))
  return NextResponse.json({ workplan, tasks: withStatus }, { status: 201 })
}
