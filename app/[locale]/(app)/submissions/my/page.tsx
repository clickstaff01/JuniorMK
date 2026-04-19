import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import { FileText, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react'

const STATUS_CONFIG = {
  DRAFT: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-700/50' },
  SUBMITTED: { label: 'รอตรวจ', color: 'text-amber-400', bg: 'bg-amber-500/10' },
  GRADED: { label: 'ตรวจแล้ว', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  APPROVED: { label: 'ผ่านแล้ว', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  NEEDS_REWORK: { label: 'ต้องแก้ไข', color: 'text-red-400', bg: 'bg-red-500/10' },
}

export default async function MySubmissionsPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const submissions = await prisma.submission.findMany({
    where: { authorId: session.user.id, status: { not: 'DRAFT' } },
    include: {
      assignment: {
        include: { week: true },
      },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const locale = params.locale

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">งานของฉัน</h1>
        <p className="text-slate-400 text-sm mt-1">ประวัติการส่งงานทั้งหมด</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-medium mb-1">ยังไม่มีงานที่ส่ง</p>
          <p className="text-slate-500 text-sm mb-4">ไปส่งงานแรกของคุณได้เลย</p>
          <Link href={`/${locale}/learn`} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
            ไปที่หลักสูตร →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => {
            const st = STATUS_CONFIG[sub.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT
            const assignTitle = locale === 'th'
              ? sub.assignment.titleTh
              : (sub.assignment.titleEn ?? sub.assignment.titleTh)

            return (
              <Link
                key={sub.id}
                href={`/${locale}/assignments/${sub.assignmentId}`}
                className="flex items-center gap-4 bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{sub.assignment.code} — {assignTitle}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    สัปดาห์ {sub.assignment.week.order} ·{' '}
                    {sub.submittedAt
                      ? new Date(sub.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </p>
                </div>
                <span className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${st.color} ${st.bg}`}>
                  {st.label}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
