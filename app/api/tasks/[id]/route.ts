import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { Task } from '@/types'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const rows = await sql`
    UPDATE tasks SET
      parent_id = ${body.parent_id ?? null},
      position = ${body.position ?? 0},
      title = ${body.title ?? ''},
      responsible = ${body.responsible ?? ''},
      comments = ${body.comments ?? ''},
      planned_start = ${body.planned_start ?? null},
      planned_end = ${body.planned_end ?? null},
      actual_start = ${body.actual_start ?? null},
      actual_end = ${body.actual_end ?? null},
      progress = ${body.progress ?? 0},
      depends_on = ${body.depends_on ?? null}
    WHERE id = ${id}
    RETURNING *
  `
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0] as Task)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM tasks WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
