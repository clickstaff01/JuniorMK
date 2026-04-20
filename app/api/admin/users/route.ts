import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/lib/auth/guards'

const createSchema = z.object({
  email: z.string().email(),
  nameTh: z.string().min(1).max(120),
  nameEn: z.string().max(120).optional(),
  role: z.enum(['STAFF', 'MANAGER', 'ADMIN']).default('STAFF'),
  mentorId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
  let session
  try {
    session = await requireRole(['ADMIN'])
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const { email, nameTh, nameEn, role, mentorId } = parsed.data
  const emailLower = email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: emailLower } })
  if (existing) {
    return NextResponse.json({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' }, { status: 409 })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  const user = await prisma.user.create({
    data: {
      email: emailLower,
      nameTh,
      nameEn: nameEn || null,
      role,
      status: 'INVITED',
      mentorId: mentorId || null,
      invitations: { create: { token, expiresAt } },
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'INVITE_SENT',
      entity: 'User',
      entityId: user.id,
      after: { email: user.email, role: user.role },
    },
  })

  const base = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const inviteUrl = `${base}/th/auth/set-password?token=${token}`

  return NextResponse.json({ success: true, userId: user.id, inviteUrl })
}
