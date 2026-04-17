import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { Task, Workplan } from '@/types'
import { computeCodes, computeStatus } from '@/lib/taskUtils'

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const wps = await sql`SELECT * FROM workplans WHERE share_token = ${token}`
  if (!wps.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const workplan = wps[0] as Workplan

  const rows = await sql`
    SELECT * FROM tasks WHERE workplan_id = ${workplan.id} ORDER BY position ASC
  ` as Task[]
  const tasks = computeCodes(rows).map(t => ({ ...t, status: computeStatus(t) }))

  return NextResponse.json({ workplan, tasks })
}
