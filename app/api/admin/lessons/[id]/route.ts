import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const patchSchema = z.object({
  order: z.number().int().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  titleTh: z.string().min(1).max(200).optional(),
  titleEn: z.string().max(200).nullable().optional(),
  bodyTh: z.string().optional(),
  bodyEn: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const before = await prisma.lesson.findUnique({ where: { id: params.id } })
  if (!before) return NextResponse.json({ error: 'ไม่พบบทเรียน' }, { status: 404 })

  try {
    const updated = await prisma.lesson.update({ where: { id: params.id }, data: parsed.data })

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'UPDATE',
        entity: 'Lesson',
        entityId: updated.id,
        before: { slug: before.slug, titleTh: before.titleTh },
        after: { slug: updated.slug, titleTh: updated.titleTh },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'slug หรือลำดับซ้ำ' }, { status: 409 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } })
  if (!lesson) return NextResponse.json({ error: 'ไม่พบบทเรียน' }, { status: 404 })

  await prisma.lesson.delete({ where: { id: params.id } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'DELETE',
      entity: 'Lesson',
      entityId: lesson.id,
      before: { weekId: lesson.weekId, slug: lesson.slug, titleTh: lesson.titleTh },
    },
  })

  return NextResponse.json({ success: true })
}
