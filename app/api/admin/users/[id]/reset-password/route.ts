import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/lib/auth/guards'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let session
  try {
    session = await requireRole(['ADMIN'])
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } })
  if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

  await prisma.invitation.create({ data: { userId: user.id, token, expiresAt } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: user.id,
    },
  })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const resetUrl = `${base}/th/auth/set-password?token=${token}`

  // eslint-disable-next-line no-console
  console.log(`[admin password-reset] ${user.email}: ${resetUrl}`)

  return NextResponse.json({ success: true, resetUrl })
}
