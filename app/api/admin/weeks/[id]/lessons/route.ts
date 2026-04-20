import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const schema = z.object({
  order: z.number().int().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  titleTh: z.string().min(1).max(200),
  titleEn: z.string().max(200).nullable().optional(),
  bodyTh: z.string().default(''),
  bodyEn: z.string().nullable().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const week = await prisma.week.findUnique({ where: { id: params.id } })
  if (!week) return NextResponse.json({ error: 'ไม่พบสัปดาห์' }, { status: 404 })

  try {
    const lesson = await prisma.lesson.create({
      data: {
        weekId: params.id,
        order: parsed.data.order,
        slug: parsed.data.slug,
        titleTh: parsed.data.titleTh,
        titleEn: parsed.data.titleEn ?? null,
        bodyTh: parsed.data.bodyTh,
        bodyEn: parsed.data.bodyEn ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'CREATE',
        entity: 'Lesson',
        entityId: lesson.id,
        after: { weekId: params.id, slug: lesson.slug, titleTh: lesson.titleTh },
      },
    })

    return NextResponse.json({ success: true, lessonId: lesson.id })
  } catch {
    return NextResponse.json({ error: 'slug หรือลำดับซ้ำในสัปดาห์นี้' }, { status: 409 })
  }
}
