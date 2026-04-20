'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, X, Mail, Loader2 } from 'lucide-react'
import type { Role, UserStatus } from '@prisma/client'

type UserRow = {
  id: string
  email: string
  nameTh: string
  nameEn: string | null
  role: Role
  status: UserStatus
  mentor: { id: string; nameTh: string } | null
  createdAt: string
}

type Mentor = { id: string; nameTh: string; email: string }

const ROLE_LABEL: Record<Role, string> = { STAFF: 'Staff', MANAGER: 'Manager', ADMIN: 'Admin' }
const STATUS_LABEL: Record<UserStatus, string> = {
  INVITED: 'เชิญแล้ว',
  ACTIVE: 'ใช้งาน',
  DEACTIVATED: 'ปิดใช้งาน',
}
const STATUS_STYLE: Record<UserStatus, string> = {
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  INVITED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  DEACTIVATED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}
const ROLE_STYLE: Record<Role, string> = {
  ADMIN: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  MANAGER: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  STAFF: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
}

export default function UsersTable({
  initialUsers,
  mentorCandidates,
}: {
  initialUsers: UserRow[]
  mentorCandidates: Mentor[]
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL')
  const [inviteOpen, setInviteOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return initialUsers.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
      if (statusFilter !== 'ALL' && u.status !== statusFilter) return false
      if (!q) return true
      return (
        u.email.toLowerCase().includes(q) ||
        u.nameTh.toLowerCase().includes(q) ||
        (u.nameEn ?? '').toLowerCase().includes(q)
      )
    })
  }, [initialUsers, query, roleFilter, statusFilter])

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">ผู้ใช้งาน</h1>
          <p className="text-slate-400 text-sm mt-1">
            จัดการบัญชีและสิทธิ์การเข้าถึง · ทั้งหมด {initialUsers.length.toLocaleString()} คน
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          + เชิญผู้ใช้
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อหรืออีเมล"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'ALL' | Role)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/40"
        >
          <option value="ALL">ทุกสิทธิ์</option>
          <option value="STAFF">Staff</option>
          <option value="MANAGER">Manager</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'ALL' | UserStatus)}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-white text-sm focus:outline-none focus:border-blue-500/40"
        >
          <option value="ALL">ทุกสถานะ</option>
          <option value="ACTIVE">ใช้งาน</option>
          <option value="INVITED">เชิญแล้ว</option>
          <option value="DEACTIVATED">ปิดใช้งาน</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-white font-medium mb-1">ไม่พบผู้ใช้</p>
            <p className="text-slate-500 text-sm">
              {initialUsers.length === 0 ? 'เริ่มต้นโดยการเชิญผู้ใช้' : 'ลองปรับตัวกรองหรือคำค้นหา'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950/50 border-b border-white/5">
                <tr className="text-left text-slate-400 text-xs">
                  <th className="px-5 py-3 font-medium">ชื่อ / อีเมล</th>
                  <th className="px-5 py-3 font-medium">สิทธิ์</th>
                  <th className="px-5 py-3 font-medium">สถานะ</th>
                  <th className="px-5 py-3 font-medium">Mentor</th>
                  <th className="px-5 py-3 font-medium">สร้างเมื่อ</th>
                  <th className="px-5 py-3 font-medium text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((u) => (
                  <UserRowView
                    key={u.id}
                    user={u}
                    mentorCandidates={mentorCandidates}
                    onChange={() => router.refresh()}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {inviteOpen && (
        <InviteDialog
          onClose={() => setInviteOpen(false)}
          onInvited={() => {
            setInviteOpen(false)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function UserRowView({
  user,
  mentorCandidates,
  onChange,
}: {
  user: UserRow
  mentorCandidates: Mentor[]
  onChange: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  const patch = async (body: Record<string, unknown>) => {
    setError('')
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'บันทึกไม่สำเร็จ')
      return
    }
    startTransition(onChange)
  }

  return (
    <tr className="hover:bg-slate-950/30 transition-colors">
      <td className="px-5 py-3">
        <p className="text-white">{user.nameTh}</p>
        <p className="text-slate-500 text-xs">{user.email}</p>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </td>
      <td className="px-5 py-3">
        <select
          value={user.role}
          disabled={pending}
          onChange={(e) => patch({ role: e.target.value })}
          className={`px-2 py-1 rounded-md text-xs border bg-transparent focus:outline-none ${ROLE_STYLE[user.role]}`}
        >
          <option value="STAFF" className="bg-slate-900">Staff</option>
          <option value="MANAGER" className="bg-slate-900">Manager</option>
          <option value="ADMIN" className="bg-slate-900">Admin</option>
        </select>
      </td>
      <td className="px-5 py-3">
        <select
          value={user.status}
          disabled={pending}
          onChange={(e) => patch({ status: e.target.value })}
          className={`px-2 py-1 rounded-md text-xs border bg-transparent focus:outline-none ${STATUS_STYLE[user.status]}`}
        >
          <option value="ACTIVE" className="bg-slate-900">{STATUS_LABEL.ACTIVE}</option>
          <option value="INVITED" className="bg-slate-900">{STATUS_LABEL.INVITED}</option>
          <option value="DEACTIVATED" className="bg-slate-900">{STATUS_LABEL.DEACTIVATED}</option>
        </select>
      </td>
      <td className="px-5 py-3">
        <select
          value={user.mentor?.id ?? ''}
          disabled={pending}
          onChange={(e) => patch({ mentorId: e.target.value || null })}
          className="px-2 py-1 rounded-md text-xs bg-slate-800 border border-white/5 text-slate-300 focus:outline-none"
        >
          <option value="">— ไม่มี —</option>
          {mentorCandidates
            .filter((m) => m.id !== user.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameTh}
              </option>
            ))}
        </select>
      </td>
      <td className="px-5 py-3 text-slate-400 text-xs">
        {new Date(user.createdAt).toLocaleDateString('th-TH', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </td>
      <td className="px-5 py-3 text-right">
        <button
          disabled={pending}
          onClick={async () => {
            setError('')
            const res = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: 'POST' })
            if (!res.ok) {
              const data = (await res.json().catch(() => ({}))) as { error?: string }
              setError(data.error ?? 'ส่งลิงก์ไม่สำเร็จ')
            }
          }}
          className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 inline-flex items-center gap-1"
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
          รีเซ็ตรหัสผ่าน
        </button>
      </td>
    </tr>
  )
}

function InviteDialog({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [email, setEmail] = useState('')
  const [nameTh, setNameTh] = useState('')
  const [role, setRole] = useState<Role>('STAFF')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [link, setLink] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), nameTh: nameTh.trim(), role }),
      })
      const data = (await res.json()) as { error?: string; inviteUrl?: string }
      if (!res.ok) {
        setError(data.error ?? 'สร้างคำเชิญไม่สำเร็จ')
      } else {
        setLink(data.inviteUrl ?? '')
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <p className="text-white font-medium">เชิญผู้ใช้ใหม่</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {link ? (
          <div className="p-5 space-y-3">
            <p className="text-emerald-400 text-sm">สร้างคำเชิญสำเร็จ</p>
            <p className="text-slate-400 text-xs">ส่งลิงก์นี้ให้ผู้ใช้เพื่อตั้งรหัสผ่าน</p>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-white/5">
              <p className="text-slate-300 text-xs break-all font-mono">{link}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(link)
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm transition-colors"
              >
                คัดลอกลิงก์
              </button>
              <button
                onClick={onInvited}
                className="flex-1 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm transition-colors"
              >
                เสร็จสิ้น
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@clickbroker.co.th"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อ (ไทย)</label>
              <input
                type="text"
                required
                value={nameTh}
                onChange={(e) => setNameTh(e.target.value)}
                placeholder="สมชาย ใจดี"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">สิทธิ์</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {error && (
              <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium text-sm transition-colors"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างคำเชิญ'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
