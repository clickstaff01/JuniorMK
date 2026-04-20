import { requireRole } from '@/lib/auth/guards'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import CourseEditor from './course-editor'

export const dynamic = 'force-dynamic'

export default async function CourseDetailPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' } },
          _count: { select: { assignments: true } },
        },
      },
    },
  })

  if (!course) notFound()

  const initial = {
    id: course.id,
    slug: course.slug,
    titleTh: course.titleTh,
    titleEn: course.titleEn,
    descriptionTh: course.descriptionTh,
    descriptionEn: course.descriptionEn,
    isPublished: course.isPublished,
    weeks: course.weeks.map((w) => ({
      id: w.id,
      order: w.order,
      titleTh: w.titleTh,
      titleEn: w.titleEn,
      descriptionTh: w.descriptionTh,
      assignmentCount: w._count.assignments,
      lessons: w.lessons.map((l) => ({
        id: l.id,
        order: l.order,
        slug: l.slug,
        titleTh: l.titleTh,
        titleEn: l.titleEn,
      })),
    })),
  }

  return <CourseEditor locale={params.locale} initial={initial} />
}
