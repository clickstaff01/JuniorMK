import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuditAction, Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

const ACTION_STYLE: Record<AuditAction, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
  LOGIN: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  LOGOUT: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  ROLE_CHANGE: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PASSWORD_RESET: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  INVITE_SENT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SUBMIT: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  GRADE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
}

const ACTIONS: AuditAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'ROLE_CHANGE',
  'PASSWORD_RESET',
  'INVITE_SENT',
  'SUBMIT',
  'GRADE',
]

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: { locale: string }
  searchParams: { page?: string; action?: string; entity?: string; actor?: string }
}) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10) || 1)
  const where: Prisma.AuditLogWhereInput = {}
  if (searchParams.action && ACTIONS.includes(searchParams.action as AuditAction)) {
    where.action = searchParams.action as AuditAction
  }
  if (searchParams.entity) where.entity = searchParams.entity
  if (searchParams.actor) {
    where.actor = {
      OR: [
        { email: { contains: searchParams.actor, mode: 'insensitive' } },
        { nameTh: { contains: searchParams.actor, mode: 'insensitive' } },
      ],
    }
  }

  const [total, logs, entities] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { actor: { select: { nameTh: true, email: true } } },
    }),
    prisma.auditLog.groupBy({ by: ['entity'], _count: { _all: true }, orderBy: { _count: { entity: 'desc' } } }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const sp = new URLSearchParams()
    const merged = { ...searchParams, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) sp.set(k, v)
    }
    const qs = sp.toString()
    return `/${params.locale}/admin/audit${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">บันทึกการดำเนินการ</h1>
        <p className="text-slate-400 text-sm mt-1">
          ประวัติการเปลี่ยนแปลงข้อมูลทั้งหมดในระบบ · รวม {total.toLocaleString()} รายการ
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 mb-4" method="get">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">การกระทำ</label>
          <select
            name="action"
            defaultValue={searchParams.action ?? ''}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/40"
          >
            <option value="">ทั้งหมด</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">เอนทิตี</label>
          <select
            name="entity"
            defaultValue={searchParams.entity ?? ''}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/40"
          >
            <option value="">ทั้งหมด</option>
            {entities.map((e) => (
              <option key={e.entity} value={e.entity}>
                {e.entity} ({e._count._all})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">ผู้กระทำ</label>
          <input
            type="text"
            name="actor"
            defaultValue={searchParams.actor ?? ''}
            placeholder="ชื่อหรืออีเมล"
            className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          ค้นหา
        </button>
        {(searchParams.action || searchParams.entity || searchParams.actor) && (
          <Link
            href={`/${params.locale}/admin/audit`}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
          >
            ล้าง
          </Link>
        )}
      </form>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-white font-medium mb-1">ไม่พบบันทึก</p>
            <p className="text-slate-500 text-sm">ลองปรับตัวกรองหรือกลับไปยังหน้าแรก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/50 border-b border-white/5">
                <tr className="text-left text-slate-400 text-xs">
                  <th className="px-5 py-3 font-medium">เวลา</th>
                  <th className="px-5 py-3 font-medium">ผู้กระทำ</th>
                  <th className="px-5 py-3 font-medium">การกระทำ</th>
                  <th className="px-5 py-3 font-medium">เอนทิตี</th>
                  <th className="px-5 py-3 font-medium">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-950/30 transition-colors">
                    <td className="px-5 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {log.createdAt.toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3">
                      {log.actor ? (
                        <>
                          <p className="text-white text-sm">{log.actor.nameTh}</p>
                          <p className="text-slate-500 text-xs">{log.actor.email}</p>
                        </>
                      ) : (
                        <p className="text-slate-500 text-xs">ระบบ</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] border font-mono ${ACTION_STYLE[log.action]}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-300 text-xs">{log.entity}</p>
                      <p className="text-slate-600 text-[10px] font-mono truncate max-w-[160px]">
                        {log.entityId}
                      </p>
                    </td>
                    <td className="px-5 py-3 max-w-md">
                      <DiffView before={log.before} after={log.after} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-slate-500 text-xs">
            หน้า {page} จาก {totalPages.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                ก่อนหน้า
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-600 text-xs inline-flex items-center gap-1 cursor-not-allowed">
                <ChevronLeft className="w-3.5 h-3.5" />
                ก่อนหน้า
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs inline-flex items-center gap-1"
              >
                ถัดไป
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-600 text-xs inline-flex items-center gap-1 cursor-not-allowed">
                ถัดไป
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DiffView({ before, after }: { before: unknown; after: unknown }) {
  const hasBefore = Boolean(before) && typeof before === 'object'
  const hasAfter = Boolean(after) && typeof after === 'object'
  if (!hasBefore && !hasAfter) return <span className="text-slate-600 text-xs">—</span>

  const b = (hasBefore ? (before as Record<string, unknown>) : {}) as Record<string, unknown>
  const a = (hasAfter ? (after as Record<string, unknown>) : {}) as Record<string, unknown>
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)]))

  if (keys.length === 0) return <span className="text-slate-600 text-xs">—</span>

  return (
    <div className="space-y-0.5">
      {keys.slice(0, 4).map((k) => {
        const bv = b[k]
        const av = a[k]
        const changed = JSON.stringify(bv) !== JSON.stringify(av)
        return (
          <div key={k} className="text-xs font-mono">
            <span className="text-slate-500">{k}: </span>
            {hasBefore && bv !== undefined ? (
              <span className={changed ? 'text-red-400 line-through' : 'text-slate-400'}>
                {formatVal(bv)}
              </span>
            ) : null}
            {changed && hasBefore && hasAfter ? <span className="text-slate-600"> → </span> : null}
            {hasAfter && av !== undefined && changed ? (
              <span className="text-emerald-400">{formatVal(av)}</span>
            ) : null}
            {!hasBefore && hasAfter && av !== undefined ? (
              <span className="text-emerald-400">{formatVal(av)}</span>
            ) : null}
          </div>
        )
      })}
      {keys.length > 4 && <p className="text-slate-600 text-[10px]">+{keys.length - 4} ฟิลด์...</p>}
    </div>
  )
}

function formatVal(v: unknown): string {
  if (v === null) return 'null'
  if (typeof v === 'string') return v.length > 40 ? v.slice(0, 40) + '…' : v
  return JSON.stringify(v)
}
