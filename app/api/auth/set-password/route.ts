import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const body = z.object({
  token: z.string(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid' }, { status: 400 })

  const { token, password } = parsed.data

  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation || invitation.usedAt || invitation.expiresAt < new Date()) {
    return NextResponse.json({ success: false, error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุ' }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: invitation.userId },
      data: { passwordHash: hash, status: 'ACTIVE' },
    }),
    prisma.invitation.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ])

  return NextResponse.json({ success: true })
}
