import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { BookOpen, FileText, Clock, ChevronRight } from 'lucide-react'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const role = session.user.role
  if (role === 'MANAGER') redirect(`/${params.locale}/manage/queue`)
  if (role === 'ADMIN') redirect(`/${params.locale}/admin/dashboard`)

  const locale = params.locale

  const [enrollment, submitted, assignments] = await Promise.all([
    prisma.enrollment.findFirst({
      where: { userId: session.user.id },
      include: {
        course: {
          include: {
            weeks: {
              include: {
                lessons: { include: { progress: { where: { userId: session.user.id } } } },
              },
            },
          },
        },
      },
    }),
    prisma.submission.count({
      where: { authorId: session.user.id, status: { not: 'DRAFT' } },
    }),
    prisma.assignment.findMany({
      where: {
        week: {
          course: {
            enrollments: { some: { userId: session.user.id } },
          },
        },
      },
      include: {
        submissions: {
          where: { authorId: session.user.id, status: { not: 'DRAFT' } },
          take: 1,
        },
      },
      orderBy: [{ week: { order: 'asc' } }, { order: 'asc' }],
    }),
  ])

  const course = enrollment?.course
  const totalLessons = course?.weeks.reduce((s, w) => s + w.lessons.length, 0) ?? 0
  const readLessons = course?.weeks.reduce((s, w) => s + w.lessons.filter((l) => l.progress[0]?.readAt).length, 0) ?? 0
  const progressPct = totalLessons > 0 ? Math.round((readLessons / totalLessons) * 100) : 0

  const pendingAssignments = assignments.filter((a) => a.submissions.length === 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-1">ยินดีต้อนรับกลับ</p>
        <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{session.user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">ความคืบหน้า</p>
          <p className="text-white font-semibold text-sm">{readLessons}/{totalLessons} บท ({progressPct}%)</p>
          {totalLessons > 0 && (
            <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">งานที่ส่งแล้ว</p>
          <p className="text-white font-semibold text-sm">{submitted} งาน</p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">งานที่รอส่ง</p>
          <p className="text-white font-semibold text-sm">{pendingAssignments.length} งาน</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/${locale}/learn`}
          className="flex items-center gap-4 bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">ต่อเรียน</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {course ? (locale === 'th' ? course.titleTh : (course.titleEn ?? course.titleTh)) : 'ยังไม่มีหลักสูตร'}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>

        <Link
          href={`/${locale}/submissions/my`}
          className="flex items-center gap-4 bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium text-sm">ดูงานทั้งหมด</p>
            <p className="text-slate-500 text-xs mt-0.5">ประวัติการส่งงาน</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
        </Link>
      </div>
    </div>
  )
}
