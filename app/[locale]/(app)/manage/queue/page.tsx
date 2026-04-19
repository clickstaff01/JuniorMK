import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { FileText, ChevronRight, CheckCircle, AlertCircle, Clock } from 'lucide-react'

export default async function QueuePage({ params }: { params: { locale: string } }) {
  let session
  try {
    session = await requireRole(['MANAGER', 'ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const menteeIds = session.user.role === 'ADMIN'
    ? undefined
    : (await prisma.user.findMany({ where: { mentorId: session.user.id }, select: { id: true } })).map((u) => u.id)

  const submissions = await prisma.submission.findMany({
    where: {
      status: { in: ['SUBMITTED', 'GRADED', 'APPROVED', 'NEEDS_REWORK'] },
      ...(menteeIds ? { authorId: { in: menteeIds } } : {}),
    },
    include: {
      author: true,
      assignment: { include: { week: true } },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const pending = submissions.filter((s) => s.status === 'SUBMITTED')
  const done = submissions.filter((s) => s.status !== 'SUBMITTED')
  const locale = params.locale

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">คิวตรวจงาน</h1>
        <p className="text-slate-400 text-sm mt-1">งานที่รอตรวจและตรวจแล้ว</p>
      </div>

      {/* Pending */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-white">รอตรวจ</h2>
          {pending.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">ไม่มีงานรอตรวจ</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {pending.map((sub) => (
              <Link
                key={sub.id}
                href={`/${locale}/manage/submission/${sub.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/50 transition-colors group"
              >
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {sub.assignment.code} — {locale === 'th' ? sub.assignment.titleTh : (sub.assignment.titleEn ?? sub.assignment.titleTh)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {sub.author.nameTh} · สัปดาห์ {sub.assignment.week.order} ·{' '}
                    {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">ตรวจแล้ว</h2>
          <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5">
            {done.map((sub) => (
              <Link
                key={sub.id}
                href={`/${locale}/manage/submission/${sub.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/50 transition-colors group"
              >
                {sub.status === 'APPROVED'
                  ? <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {sub.assignment.code} — {locale === 'th' ? sub.assignment.titleTh : (sub.assignment.titleEn ?? sub.assignment.titleTh)}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {sub.author.nameTh} · {sub.gradedAt ? new Date(sub.gradedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '—'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
