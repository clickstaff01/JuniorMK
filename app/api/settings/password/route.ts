import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/auth'

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })

  if (user.passwordHash && user.passwordHash !== 'auto') {
    const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash)
    if (!ok) return NextResponse.json({ error: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' }, { status: 400 })
  }

  const hash = await bcrypt.hash(parsed.data.newPassword, 12)

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hash, status: user.status === 'INVITED' ? 'ACTIVE' : user.status },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'PASSWORD_RESET',
      entity: 'User',
      entityId: user.id,
    },
  })

  return NextResponse.json({ success: true })
}
