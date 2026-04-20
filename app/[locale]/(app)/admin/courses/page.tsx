import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import CoursesList from './courses-list'

export const dynamic = 'force-dynamic'

export default async function CoursesPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const courses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { weeks: true, enrollments: true } },
    },
  })

  const rows = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    titleTh: c.titleTh,
    titleEn: c.titleEn,
    descriptionTh: c.descriptionTh,
    isPublished: c.isPublished,
    weekCount: c._count.weeks,
    enrollmentCount: c._count.enrollments,
    createdAt: c.createdAt.toISOString(),
  }))

  return <CoursesList locale={params.locale} initialCourses={rows} />
}
