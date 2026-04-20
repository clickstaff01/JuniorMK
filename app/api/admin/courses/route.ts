import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'slug ต้องเป็นตัวพิมพ์เล็ก ตัวเลข ขีดกลางเท่านั้น'),
  titleTh: z.string().min(1).max(200),
  titleEn: z.string().max(200).nullable().optional(),
  descriptionTh: z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
})

export async function POST(req: NextRequest) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'ข้อมูลไม่ถูกต้อง' },
      { status: 400 },
    )
  }

  const exists = await prisma.course.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) return NextResponse.json({ error: 'slug ซ้ำ' }, { status: 409 })

  const course = await prisma.course.create({
    data: {
      slug: parsed.data.slug,
      titleTh: parsed.data.titleTh,
      titleEn: parsed.data.titleEn ?? null,
      descriptionTh: parsed.data.descriptionTh ?? null,
      descriptionEn: parsed.data.descriptionEn ?? null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'CREATE',
      entity: 'Course',
      entityId: course.id,
      after: { slug: course.slug, titleTh: course.titleTh },
    },
  })

  return NextResponse.json({ success: true, courseId: course.id })
}
