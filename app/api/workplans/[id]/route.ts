import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { Workplan } from '@/types'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rows = await sql`SELECT * FROM workplans WHERE id = ${id}`
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0] as Workplan)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, description } = await request.json()
  const rows = await sql`
    UPDATE workplans
    SET name = ${name}, description = ${description}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0] as Workplan)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await sql`DELETE FROM workplans WHERE id = ${id}`
  return NextResponse.json({ success: true })
}
