import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { requireRole } from '@/lib/auth/guards'

const patchSchema = z.object({
  nameTh: z.string().min(1).max(120).optional(),
  nameEn: z.string().max(120).nullable().optional(),
  role: z.enum(['STAFF', 'MANAGER', 'ADMIN']).optional(),
  status: z.enum(['INVITED', 'ACTIVE', 'DEACTIVATED']).optional(),
  mentorId: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let session
  try {
    session = await requireRole(['ADMIN'])
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } })
  if (!target) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 })

  if (parsed.data.mentorId && parsed.data.mentorId === params.id) {
    return NextResponse.json({ error: 'ตั้ง mentor เป็นตัวเองไม่ได้' }, { status: 400 })
  }

  const before = { role: target.role, status: target.status, mentorId: target.mentorId }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: parsed.data,
  })

  const roleChanged = parsed.data.role && parsed.data.role !== target.role

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: roleChanged ? 'ROLE_CHANGE' : 'UPDATE',
      entity: 'User',
      entityId: updated.id,
      before,
      after: { role: updated.role, status: updated.status, mentorId: updated.mentorId },
    },
  })

  return NextResponse.json({ success: true })
}
