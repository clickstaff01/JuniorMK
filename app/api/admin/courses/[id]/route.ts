import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const patchSchema = z.object({
  titleTh: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).nullable().optional(),
  descriptionTh: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const before = await prisma.course.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'ไม่พบหลักสูตร' }, { status: 404 })

  const updated = await prisma.course.update({
    where: { id: params.id },
    data: parsed.data,
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'UPDATE',
      entity: 'Course',
      entityId: updated.id,
      before: { titleTh: before.titleTh, isPublished: before.isPublished },
      after: { titleTh: updated.titleTh, isPublished: updated.isPublished },
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course) return NextResponse.json({ error: 'ไม่พบหลักสูตร' }, { status: 404 })

  await prisma.course.delete({ where: { id: params.id } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'DELETE',
      entity: 'Course',
      entityId: course.id,
      before: { slug: course.slug, titleTh: course.titleTh },
    },
  })

  return NextResponse.json({ success: true })
}
