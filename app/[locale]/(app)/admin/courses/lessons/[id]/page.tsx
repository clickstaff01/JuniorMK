import { requireRole } from '@/lib/auth/guards'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import LessonEditor from './lesson-editor'

export const dynamic = 'force-dynamic'

export default async function LessonEditPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.id },
    include: { week: { include: { course: true } } },
  })
  if (!lesson) notFound()

  return (
    <LessonEditor
      locale={params.locale}
      lesson={{
        id: lesson.id,
        order: lesson.order,
        slug: lesson.slug,
        titleTh: lesson.titleTh,
        titleEn: lesson.titleEn,
        bodyTh: lesson.bodyTh,
        bodyEn: lesson.bodyEn,
        weekId: lesson.weekId,
        courseId: lesson.week.courseId,
        courseTitleTh: lesson.week.course.titleTh,
        weekOrder: lesson.week.order,
        weekTitleTh: lesson.week.titleTh,
      }}
    />
  )
}
