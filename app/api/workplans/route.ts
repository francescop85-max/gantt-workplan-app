import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { Workplan } from '@/types'

export async function GET() {
  const rows = await sql`
    SELECT * FROM workplans ORDER BY updated_at DESC
  `
  return NextResponse.json(rows as Workplan[])
}

export async function POST(request: Request) {
  const { name, description } = await request.json()
  if (!name?.trim()) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }
  const rows = await sql`
    INSERT INTO workplans (name, description)
    VALUES (${name.trim()}, ${description?.trim() ?? ''})
    RETURNING *
  `
  return NextResponse.json(rows[0] as Workplan, { status: 201 })
}
