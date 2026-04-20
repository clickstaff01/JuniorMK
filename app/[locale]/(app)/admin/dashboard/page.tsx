import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, BookOpen, AlertCircle, BarChart2, ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

const LEVEL_SCORE = { GREAT: 3, OK: 2, REWORK: 1 } as const

async function loadStats() {
  const [totalUsers, activeUsers, totalCourses, publishedCourses, pendingApprovals, needsReworkCount, scores] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.submission.count({ where: { status: 'SUBMITTED' } }),
      prisma.submission.count({ where: { status: 'NEEDS_REWORK' } }),
      prisma.rubricScore.groupBy({ by: ['level'], _count: { _all: true } }),
    ])

  let weightedSum = 0
  let count = 0
  for (const row of scores) {
    weightedSum += LEVEL_SCORE[row.level] * row._count._all
    count += row._count._all
  }
  const avg = count > 0 ? weightedSum / count : 0
  const avgPercent = count > 0 ? Math.round((avg / 3) * 100) : null

  return {
    totalUsers,
    activeUsers,
    totalCourses,
    publishedCourses,
    pendingApprovals,
    needsReworkCount,
    avgPercent,
    totalGraded: count,
  }
}

async function loadRecentUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { mentor: { select: { nameTh: true } } },
  })
}

async function loadPendingQueue() {
  return prisma.submission.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'desc' },
    take: 5,
    include: {
      author: { select: { nameTh: true, email: true } },
      assignment: { select: { titleTh: true, code: true } },
    },
  })
}

const ROLE_LABEL: Record<string, string> = { STAFF: 'Staff', MANAGER: 'Manager', ADMIN: 'Admin' }
const STATUS_LABEL: Record<string, string> = { INVITED: 'เชิญแล้ว', ACTIVE: 'ใช้งาน', DEACTIVATED: 'ปิดใช้งาน' }
const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INVITED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEACTIVATED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

const COLOR_STYLE: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
  emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  amber: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  purple: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' },
}

export default async function AdminDashboardPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const [stats, recentUsers, pending] = await Promise.all([
    loadStats(),
    loadRecentUsers(),
    loadPendingQueue(),
  ])

  const cards = [
    {
      label: 'ผู้ใช้งานทั้งหมด',
      value: stats.totalUsers.toLocaleString(),
      hint: `ใช้งานอยู่ ${stats.activeUsers.toLocaleString()}`,
      icon: Users,
      color: 'blue',
      href: `/${params.locale}/admin/users`,
    },
    {
      label: 'หลักสูตร',
      value: stats.totalCourses.toLocaleString(),
      hint: `เผยแพร่แล้ว ${stats.publishedCourses.toLocaleString()}`,
      icon: BookOpen,
      color: 'emerald',
      href: `/${params.locale}/admin/courses`,
    },
    {
      label: 'รอตรวจ',
      value: stats.pendingApprovals.toLocaleString(),
      hint: `ส่งกลับแก้ไข ${stats.needsReworkCount.toLocaleString()}`,
      icon: AlertCircle,
      color: 'amber',
      href: `/${params.locale}/admin/analytics`,
    },
    {
      label: 'คะแนนเฉลี่ย',
      value: stats.avgPercent === null ? '—' : `${stats.avgPercent}%`,
      hint: `จาก ${stats.totalGraded.toLocaleString()} รายการที่ตรวจ`,
      icon: BarChart2,
      color: 'purple',
      href: `/${params.locale}/admin/analytics`,
    },
  ] as const

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">แดชบอร์ด Admin</h1>
        <p className="text-slate-400 text-sm mt-1">ภาพรวมระบบทั้งหมด</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, hint, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${COLOR_STYLE[color].bg}`}>
                <Icon className={`w-4 h-4 ${COLOR_STYLE[color].text}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-slate-500 text-xs mt-1">{hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <p className="text-white font-medium text-sm">ผู้ใช้ล่าสุด</p>
              <p className="text-slate-500 text-xs mt-0.5">สมาชิกที่เพิ่งสร้างบัญชี</p>
            </div>
            <Link
              href={`/${params.locale}/admin/users`}
              className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">ยังไม่มีผู้ใช้</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentUsers.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white text-sm truncate">{u.nameTh}</p>
                    <p className="text-slate-500 text-xs truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-slate-400 text-xs">{ROLE_LABEL[u.role] ?? u.role}</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] border ${STATUS_STYLE[u.status] ?? ''}`}
                    >
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <p className="text-white font-medium text-sm">งานรอตรวจ</p>
              <p className="text-slate-500 text-xs mt-0.5">การส่งงานที่ยังไม่ได้ให้คะแนน</p>
            </div>
            <Link
              href={`/${params.locale}/admin/analytics`}
              className="text-blue-400 text-xs hover:text-blue-300 transition-colors"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          {pending.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-500 text-sm">ไม่มีงานค้างตรวจ</div>
          ) : (
            <div className="divide-y divide-white/5">
              {pending.map((s) => (
                <div key={s.id} className="px-5 py-3">
                  <p className="text-white text-sm truncate">
                    {s.assignment.code} · {s.assignment.titleTh}
                  </p>
                  <p className="text-slate-500 text-xs truncate mt-0.5">
                    {s.author.nameTh} ·{' '}
                    {s.submittedAt
                      ? new Date(s.submittedAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
