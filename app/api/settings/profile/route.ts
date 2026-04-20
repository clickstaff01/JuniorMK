import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { auth } from '@/auth'

const schema = z.object({
  nameTh: z.string().min(1).max(120),
  nameEn: z.string().max(120).nullable().optional(),
  preferredLocale: z.enum(['th', 'en']),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const before = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!before) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      nameTh: parsed.data.nameTh,
      nameEn: parsed.data.nameEn ?? null,
      preferredLocale: parsed.data.preferredLocale,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: updated.id,
      before: { nameTh: before.nameTh, nameEn: before.nameEn, preferredLocale: before.preferredLocale },
      after: { nameTh: updated.nameTh, nameEn: updated.nameEn, preferredLocale: updated.preferredLocale },
    },
  })

  return NextResponse.json({ success: true })
}
