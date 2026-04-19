import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { CheckCircle, Circle, Lock, BookOpen, FileText, ChevronRight } from 'lucide-react'

export default async function LearnPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const enrollment = await prisma.enrollment.findFirst({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          weeks: {
            orderBy: { order: 'asc' },
            include: {
              lessons: {
                orderBy: { order: 'asc' },
                include: {
                  progress: { where: { userId: session.user.id } },
                },
              },
              assignments: {
                orderBy: { order: 'asc' },
                include: {
                  submissions: {
                    where: { authorId: session.user.id },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!enrollment) {
    return (
      <div className="p-6 max-w-3xl">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">ยังไม่ได้ลงทะเบียน</p>
          <p className="text-slate-500 text-sm">คุณยังไม่ได้ลงทะเบียนเรียนในหลักสูตรใด</p>
        </div>
      </div>
    )
  }

  const course = enrollment.course
  const locale = params.locale

  const totalLessons = course.weeks.reduce((s, w) => s + w.lessons.length, 0)
  const readLessons = course.weeks.reduce(
    (s, w) => s + w.lessons.filter((l) => l.progress[0]?.readAt).length,
    0
  )
  const progressPct = totalLessons > 0 ? Math.round((readLessons / totalLessons) * 100) : 0

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-slate-400 text-sm mb-1">หลักสูตรของฉัน</p>
        <h1 className="text-2xl font-bold text-white">
          {locale === 'th' ? course.titleTh : (course.titleEn ?? course.titleTh)}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="text-slate-400 text-xs flex-shrink-0">{readLessons}/{totalLessons} บท</span>
          <span className="text-blue-400 text-xs font-medium flex-shrink-0">{progressPct}%</span>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {course.weeks.map((week) => {
          const weekReadCount = week.lessons.filter((l) => l.progress[0]?.readAt).length
          const weekTotal = week.lessons.length
          const weekDone = weekReadCount === weekTotal && weekTotal > 0

          return (
            <div key={week.id} className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
              {/* Week header */}
              <div className={`px-5 py-4 border-b border-white/5 flex items-center gap-3 ${weekDone ? 'bg-emerald-500/5' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${weekDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                  {week.order}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {locale === 'th' ? week.titleTh : (week.titleEn ?? week.titleTh)}
                  </p>
                  {week.descriptionTh && (
                    <p className="text-slate-500 text-xs mt-0.5 truncate">
                      {locale === 'th' ? week.descriptionTh : (week.descriptionEn ?? week.descriptionTh)}
                    </p>
                  )}
                </div>
                <span className="text-slate-500 text-xs flex-shrink-0">{weekReadCount}/{weekTotal}</span>
              </div>

              {/* Lessons */}
              <div className="divide-y divide-white/5">
                {week.lessons.map((lesson) => {
                  const isRead = !!lesson.progress[0]?.readAt
                  return (
                    <Link
                      key={lesson.id}
                      href={`/${locale}/learn/lesson/${lesson.slug}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors group"
                    >
                      {isRead
                        ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-slate-600 flex-shrink-0 group-hover:text-slate-400 transition-colors" />
                      }
                      <span className={`text-sm flex-1 ${isRead ? 'text-slate-400' : 'text-slate-200'}`}>
                        {locale === 'th' ? lesson.titleTh : (lesson.titleEn ?? lesson.titleTh)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                    </Link>
                  )
                })}
              </div>

              {/* Assignments */}
              {week.assignments.length > 0 && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                  {week.assignments.map((assignment) => {
                    const sub = assignment.submissions[0]
                    const statusColor = !sub
                      ? 'text-slate-500'
                      : sub.status === 'APPROVED'
                      ? 'text-emerald-400'
                      : sub.status === 'NEEDS_REWORK'
                      ? 'text-red-400'
                      : sub.status === 'SUBMITTED' || sub.status === 'GRADED'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                    const statusLabel = !sub
                      ? 'ยังไม่ส่ง'
                      : sub.status === 'APPROVED'
                      ? 'ผ่านแล้ว'
                      : sub.status === 'NEEDS_REWORK'
                      ? 'แก้ไขใหม่'
                      : sub.status === 'SUBMITTED'
                      ? 'รอตรวจ'
                      : sub.status === 'GRADED'
                      ? 'ตรวจแล้ว'
                      : 'Draft'

                    return (
                      <Link
                        key={assignment.id}
                        href={`/${locale}/assignments/${assignment.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors group bg-blue-500/3"
                      >
                        <FileText className="w-4 h-4 text-blue-400/70 flex-shrink-0" />
                        <span className="text-sm flex-1 text-slate-300">
                          {assignment.code} — {locale === 'th' ? assignment.titleTh : (assignment.titleEn ?? assignment.titleTh)}
                        </span>
                        <span className={`text-xs font-medium flex-shrink-0 ${statusColor}`}>{statusLabel}</span>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
