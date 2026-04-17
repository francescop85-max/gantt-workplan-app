import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { Task } from '@/types'
import { computeCodes, computeStatus } from '@/lib/taskUtils'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`
    SELECT * FROM tasks WHERE workplan_id = ${id} ORDER BY position ASC
  ` as Task[]
  const withCodes = computeCodes(rows)
  const withStatus = withCodes.map(t => ({ ...t, status: computeStatus(t) }))
  return NextResponse.json(withStatus)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const rows = await sql`
    INSERT INTO tasks (
      workplan_id, parent_id, position, title, responsible,
      comments, planned_start, planned_end, actual_start, actual_end,
      progress, depends_on
    ) VALUES (
      ${id},
      ${body.parent_id ?? null},
      ${body.position ?? 0},
      ${body.title ?? ''},
      ${body.responsible ?? ''},
      ${body.comments ?? ''},
      ${body.planned_start ?? null},
      ${body.planned_end ?? null},
      ${body.actual_start ?? null},
      ${body.actual_end ?? null},
      ${body.progress ?? 0},
      ${body.depends_on ?? null}
    )
    RETURNING *
  `
  return NextResponse.json(rows[0] as Task, { status: 201 })
}
