import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import LessonViewer from './LessonViewer'

export default async function LessonPage({
  params,
}: {
  params: { locale: string; slug: string }
}) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const lesson = await prisma.lesson.findFirst({
    where: { slug: params.slug },
    include: {
      week: {
        include: {
          course: true,
          lessons: { orderBy: { order: 'asc' } },
        },
      },
      progress: { where: { userId: session.user.id } },
    },
  })
  if (!lesson) notFound()

  const siblings = lesson.week.lessons
  const currentIdx = siblings.findIndex((l) => l.id === lesson.id)
  const prev = siblings[currentIdx - 1]
  const next = siblings[currentIdx + 1]

  const locale = params.locale
  const isRead = !!lesson.progress[0]?.readAt
  const body = locale === 'th' ? lesson.bodyTh : (lesson.bodyEn ?? lesson.bodyTh)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <Link href={`/${locale}/learn`} className="hover:text-slate-300 transition-colors">
          หลักสูตร
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">สัปดาห์ที่ {lesson.week.order}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-white truncate max-w-[200px]">
          {locale === 'th' ? lesson.titleTh : (lesson.titleEn ?? lesson.titleTh)}
        </span>
      </nav>

      {/* Title */}
      <div className="mb-6 flex items-start gap-3">
        <div className="flex-1">
          <p className="text-slate-500 text-xs mb-1">
            สัปดาห์ {lesson.week.order} · บทที่ {lesson.order}
          </p>
          <h1 className="text-xl font-bold text-white">
            {locale === 'th' ? lesson.titleTh : (lesson.titleEn ?? lesson.titleTh)}
          </h1>
        </div>
        {isRead && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium flex-shrink-0 mt-1">
            <CheckCircle className="w-4 h-4" />
            <span>อ่านแล้ว</span>
          </div>
        )}
      </div>

      {/* Content */}
      <LessonViewer
        lessonSlug={params.slug}
        body={body}
        isRead={isRead}
      />

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4">
        {prev ? (
          <Link
            href={`/${locale}/learn/lesson/${prev.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[160px]">
              {locale === 'th' ? prev.titleTh : (prev.titleEn ?? prev.titleTh)}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={`/${locale}/learn/lesson/${next.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            <span className="truncate max-w-[160px]">
              {locale === 'th' ? next.titleTh : (next.titleEn ?? next.titleTh)}
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href={`/${locale}/learn`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
          >
            กลับสู่หลักสูตร
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
