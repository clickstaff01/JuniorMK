import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const patchSchema = z.object({
  order: z.number().int().min(1).optional(),
  titleTh: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).nullable().optional(),
  descriptionTh: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const before = await prisma.week.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'ไม่พบสัปดาห์' }, { status: 404 })

  const updated = await prisma.week.update({ where: { id: params.id }, data: parsed.data })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'UPDATE',
      entity: 'Week',
      entityId: updated.id,
      before: { order: before.order, titleTh: before.titleTh },
      after: { order: updated.order, titleTh: updated.titleTh },
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const week = await prisma.week.findUnique({ where: { id: params.id } })
  if (!week) return NextResponse.json({ error: 'ไม่พบสัปดาห์' }, { status: 404 })

  await prisma.week.delete({ where: { id: params.id } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'DELETE',
      entity: 'Week',
      entityId: week.id,
      before: { courseId: week.courseId, order: week.order, titleTh: week.titleTh },
    },
  })

  return NextResponse.json({ success: true })
}
