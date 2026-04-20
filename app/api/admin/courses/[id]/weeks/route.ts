import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'

const schema = z.object({
  order: z.number().int().min(1),
  titleTh: z.string().min(1).max(200),
  titleEn: z.string().max(200).nullable().optional(),
  descriptionTh: z.string().nullable().optional(),
})

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { id: params.id } })
  if (!course) return NextResponse.json({ error: 'ไม่พบหลักสูตร' }, { status: 404 })

  try {
    const week = await prisma.week.create({
      data: {
        courseId: params.id,
        order: parsed.data.order,
        titleTh: parsed.data.titleTh,
        titleEn: parsed.data.titleEn ?? null,
        descriptionTh: parsed.data.descriptionTh ?? null,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: 'CREATE',
        entity: 'Week',
        entityId: week.id,
        after: { courseId: params.id, order: week.order, titleTh: week.titleTh },
      },
    })

    return NextResponse.json({ success: true, weekId: week.id })
  } catch {
    return NextResponse.json({ error: 'ลำดับสัปดาห์ซ้ำ' }, { status: 409 })
  }
}
