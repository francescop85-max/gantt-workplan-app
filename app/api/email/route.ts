import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(request: Request) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { workplan_id, recipient_email } = await request.json()

  if (!recipient_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient_email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const rows = await sql`SELECT name, share_token FROM workplans WHERE id = ${workplan_id}`
  if (!rows.length) return NextResponse.json({ error: 'Workplan not found' }, { status: 404 })

  const { name, share_token } = rows[0]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const shareUrl = `${baseUrl}/share/${share_token}`

  await resend.emails.send({
    from: 'Workplan App <noreply@resend.dev>',
    to: recipient_email,
    subject: `Workplan shared with you: ${name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
        <h2 style="color:#007DC5">Workplan shared with you</h2>
        <p>You have been shared a workplan: <strong>${name}</strong></p>
        <a href="${shareUrl}" style="display:inline-block;background:#007DC5;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:8px">View Gantt Chart</a>
        <p style="color:#888;font-size:12px;margin-top:16px">${shareUrl}</p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
