import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { BarChart2, Users, BookOpen, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

const LEVEL_SCORE = { GREAT: 3, OK: 2, REWORK: 1 } as const

export default async function AnalyticsPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const [
    usersByRole,
    usersByStatus,
    submissionsByStatus,
    rubricByLevel,
    courseStats,
    recentActivity,
    topAssignments,
    worstAssignments,
  ] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
    prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.submission.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.rubricScore.groupBy({ by: ['level'], _count: { _all: true } }),
    prisma.course.findMany({
      select: {
        id: true,
        titleTh: true,
        slug: true,
        isPublished: true,
        _count: { select: { enrollments: true, weeks: true } },
      },
    }),
    prisma.submission.findMany({
      where: { submittedAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } },
      select: { submittedAt: true, status: true },
    }),
    loadTopAssignments(5, 'desc'),
    loadTopAssignments(5, 'asc'),
  ])

  const totalUsers = usersByRole.reduce((a, b) => a + b._count._all, 0)
  const totalSubmissions = submissionsByStatus.reduce((a, b) => a + b._count._all, 0)

  let weightedSum = 0
  let scoreCount = 0
  for (const r of rubricByLevel) {
    weightedSum += LEVEL_SCORE[r.level] * r._count._all
    scoreCount += r._count._all
  }
  const avgScore = scoreCount > 0 ? weightedSum / scoreCount : 0
  const avgPercent = scoreCount > 0 ? Math.round((avgScore / 3) * 100) : null

  const days: { date: string; count: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push({ date: d.toISOString().slice(0, 10), count: 0 })
  }
  for (const s of recentActivity) {
    if (!s.submittedAt) continue
    const key = s.submittedAt.toISOString().slice(0, 10)
    const bucket = days.find((x) => x.date === key)
    if (bucket) bucket.count++
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count))

  const roleMap = Object.fromEntries(usersByRole.map((r) => [r.role, r._count._all]))
  const statusMap = Object.fromEntries(usersByStatus.map((r) => [r.status, r._count._all]))
  const subMap = Object.fromEntries(submissionsByStatus.map((r) => [r.status, r._count._all]))

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">สถิติ</h1>
        <p className="text-slate-400 text-sm mt-1">วิเคราะห์ผลการเรียนรู้และความก้าวหน้า</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPI
          icon={Users}
          label="ผู้ใช้ทั้งหมด"
          value={totalUsers.toLocaleString()}
          hint={`ใช้งาน ${(statusMap.ACTIVE ?? 0).toLocaleString()} · เชิญแล้ว ${(statusMap.INVITED ?? 0).toLocaleString()}`}
          color="blue"
        />
        <KPI
          icon={BookOpen}
          label="หลักสูตร"
          value={courseStats.length.toLocaleString()}
          hint={`เผยแพร่ ${courseStats.filter((c) => c.isPublished).length.toLocaleString()}`}
          color="emerald"
        />
        <KPI
          icon={CheckCircle2}
          label="การส่งงานทั้งหมด"
          value={totalSubmissions.toLocaleString()}
          hint={`รอตรวจ ${(subMap.SUBMITTED ?? 0).toLocaleString()}`}
          color="amber"
        />
        <KPI
          icon={BarChart2}
          label="คะแนนเฉลี่ย"
          value={avgPercent === null ? '—' : `${avgPercent}%`}
          hint={`จาก ${scoreCount.toLocaleString()} เกณฑ์ที่ตรวจ`}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Panel title="กิจกรรม 30 วันย้อนหลัง" subtitle="จำนวนการส่งงานรายวัน">
          <div className="flex items-end gap-1 h-40 px-2">
            {days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-blue-500/70 hover:bg-blue-500 transition-colors"
                  style={{ height: `${(d.count / maxDay) * 100}%`, minHeight: d.count > 0 ? 2 : 0 }}
                  title={`${d.date}: ${d.count} รายการ`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2 px-2">
            <span>{days[0].date.slice(5)}</span>
            <span>{days[14].date.slice(5)}</span>
            <span>{days[29].date.slice(5)}</span>
          </div>
          <p className="text-slate-400 text-xs mt-3 flex items-center gap-1.5">
            <TrendingUp className="w-3 h-3" />
            รวม {days.reduce((a, b) => a + b.count, 0).toLocaleString()} รายการใน 30 วัน
          </p>
        </Panel>

        <Panel title="สถานะการส่งงาน" subtitle="กระจายตามสถานะปัจจุบัน">
          <div className="space-y-3">
            {[
              { key: 'DRAFT', label: 'ร่าง', color: 'bg-slate-500', icon: Clock },
              { key: 'SUBMITTED', label: 'รอตรวจ', color: 'bg-amber-500', icon: Clock },
              { key: 'GRADED', label: 'ตรวจแล้ว', color: 'bg-blue-500', icon: CheckCircle2 },
              { key: 'APPROVED', label: 'อนุมัติ', color: 'bg-emerald-500', icon: CheckCircle2 },
              { key: 'NEEDS_REWORK', label: 'แก้ไข', color: 'bg-red-500', icon: AlertTriangle },
            ].map(({ key, label, color, icon: Icon }) => {
              const count = subMap[key] ?? 0
              const pct = totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Icon className="w-3 h-3" />
                      {label}
                    </div>
                    <span className="text-slate-400">{count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Panel title="กระจายตามสิทธิ์" subtitle="จำนวนผู้ใช้ตามบทบาท">
          <div className="space-y-3">
            {[
              { key: 'ADMIN', label: 'Admin', color: 'bg-purple-500' },
              { key: 'MANAGER', label: 'Manager', color: 'bg-blue-500' },
              { key: 'STAFF', label: 'Staff', color: 'bg-slate-500' },
            ].map(({ key, label, color }) => {
              const count = roleMap[key] ?? 0
              const pct = totalUsers > 0 ? (count / totalUsers) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-slate-400">
                      {count.toLocaleString()} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel title="กระจายคะแนนตามเกณฑ์" subtitle="ระดับคะแนนจาก RubricScore">
          <div className="space-y-3">
            {[
              { key: 'GREAT', label: 'ดีเยี่ยม (3)', color: 'bg-emerald-500' },
              { key: 'OK', label: 'ผ่าน (2)', color: 'bg-blue-500' },
              { key: 'REWORK', label: 'แก้ไข (1)', color: 'bg-red-500' },
            ].map(({ key, label, color }) => {
              const row = rubricByLevel.find((r) => r.level === key)
              const count = row?._count._all ?? 0
              const pct = scoreCount > 0 ? (count / scoreCount) * 100 : 0
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-slate-400">
                      {count.toLocaleString()} ({pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Panel title="งานคะแนนเฉลี่ยสูงสุด" subtitle="Top 5">
          <AssignmentList items={topAssignments} empty="ยังไม่มีข้อมูลการตรวจ" />
        </Panel>
        <Panel title="งานที่ต้องปรับปรุง" subtitle="คะแนนเฉลี่ยต่ำสุด">
          <AssignmentList items={worstAssignments} empty="ยังไม่มีข้อมูลการตรวจ" />
        </Panel>
      </div>

      <Panel title="จำนวนผู้ลงทะเบียนต่อหลักสูตร">
        {courseStats.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-6">ยังไม่มีหลักสูตร</p>
        ) : (
          <div className="space-y-2">
            {courseStats
              .sort((a, b) => b._count.enrollments - a._count.enrollments)
              .map((c) => {
                const max = Math.max(1, ...courseStats.map((x) => x._count.enrollments))
                const pct = (c._count.enrollments / max) * 100
                return (
                  <div key={c.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{c.titleTh}</span>
                      <span className="text-slate-400 flex-shrink-0 ml-2">
                        {c._count.enrollments.toLocaleString()} คน · {c._count.weeks} สัปดาห์
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </Panel>
    </div>
  )
}

const COLOR: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400' },
  emerald: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  amber: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400' },
  purple: { bg: 'bg-purple-500/10 border-purple-500/20', text: 'text-purple-400' },
}

function KPI({
  icon: Icon,
  label,
  value,
  hint,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
  color: keyof typeof COLOR
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${COLOR[color].bg}`}>
        <Icon className={`w-4 h-4 ${COLOR[color].text}`} />
      </div>
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold text-xl">{value}</p>
      <p className="text-slate-500 text-xs mt-1">{hint}</p>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className="mb-4">
        <p className="text-white text-sm font-medium">{title}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

type AssignmentAvg = {
  assignmentId: string
  code: string
  titleTh: string
  avg: number
  count: number
}

function AssignmentList({ items, empty }: { items: AssignmentAvg[]; empty: string }) {
  if (items.length === 0) {
    return <p className="text-slate-500 text-sm text-center py-6">{empty}</p>
  }
  return (
    <div className="space-y-2">
      {items.map((a) => (
        <div
          key={a.assignmentId}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-white/5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-slate-500 text-[10px] font-mono">{a.code}</p>
            <p className="text-white text-sm truncate">{a.titleTh}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <p className="text-white text-sm font-semibold">{Math.round((a.avg / 3) * 100)}%</p>
            <p className="text-slate-500 text-[10px]">{a.count} คะแนน</p>
          </div>
        </div>
      ))}
    </div>
  )
}

async function loadTopAssignments(limit: number, direction: 'asc' | 'desc'): Promise<AssignmentAvg[]> {
  const rows = await prisma.rubricScore.findMany({
    select: {
      level: true,
      submission: {
        select: {
          assignment: { select: { id: true, code: true, titleTh: true } },
        },
      },
    },
  })

  const buckets = new Map<string, { code: string; titleTh: string; sum: number; n: number }>()
  for (const r of rows) {
    const a = r.submission.assignment
    const cur = buckets.get(a.id) ?? { code: a.code, titleTh: a.titleTh, sum: 0, n: 0 }
    cur.sum += LEVEL_SCORE[r.level]
    cur.n += 1
    buckets.set(a.id, cur)
  }

  const averaged = Array.from(buckets.entries())
    .filter(([, v]) => v.n >= 1)
    .map(([assignmentId, v]) => ({
      assignmentId,
      code: v.code,
      titleTh: v.titleTh,
      avg: v.sum / v.n,
      count: v.n,
    }))

  averaged.sort((a, b) => (direction === 'desc' ? b.avg - a.avg : a.avg - b.avg))
  return averaged.slice(0, limit)
}
