'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User as UserIcon, Lock, Globe, Shield, Save, Check } from 'lucide-react'
import type { Role, UserStatus } from '@prisma/client'
import { SETTING_KEYS, SETTING_META, type SettingKey } from '@/lib/settings'

type UserData = {
  id: string
  email: string
  nameTh: string
  nameEn: string | null
  role: Role
  status: UserStatus
  preferredLocale: string
  createdAt: string
  mentor: { nameTh: string; email: string } | null
}

const ROLE_LABEL: Record<Role, string> = { STAFF: 'Staff', MANAGER: 'Manager', ADMIN: 'Admin' }
const STATUS_LABEL: Record<UserStatus, string> = {
  INVITED: 'เชิญแล้ว',
  ACTIVE: 'ใช้งาน',
  DEACTIVATED: 'ปิดใช้งาน',
}

export default function SettingsForm({
  locale,
  user,
  isAdmin,
  systemSettings,
}: {
  locale: string
  user: UserData
  isAdmin: boolean
  systemSettings: Record<SettingKey, string | boolean> | null
}) {
  void locale
  const [tab, setTab] = useState<'profile' | 'password' | 'system'>('profile')

  const tabs = [
    { id: 'profile' as const, label: 'โปรไฟล์', icon: UserIcon },
    { id: 'password' as const, label: 'รหัสผ่าน', icon: Lock },
    ...(isAdmin ? [{ id: 'system' as const, label: 'ตั้งค่าระบบ', icon: Shield }] : []),
  ]

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ตั้งค่า</h1>
        <p className="text-slate-400 text-sm mt-1">โปรไฟล์และการตั้งค่าบัญชี</p>
      </div>

      <div className="flex gap-1 mb-5 border-b border-white/5">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm inline-flex items-center gap-2 border-b-2 transition-colors ${
              tab === id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'profile' && <ProfileTab user={user} />}
      {tab === 'password' && <PasswordTab />}
      {tab === 'system' && isAdmin && systemSettings && <SystemTab initial={systemSettings} />}
    </div>
  )
}

function ProfileTab({ user }: { user: UserData }) {
  const router = useRouter()
  const [nameTh, setNameTh] = useState(user.nameTh)
  const [nameEn, setNameEn] = useState(user.nameEn ?? '')
  const [preferredLocale, setPreferredLocale] = useState(user.preferredLocale)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/settings/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nameTh, nameEn: nameEn || null, preferredLocale }),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('บันทึกแล้ว')
      setTimeout(() => setMessage(''), 2500)
      router.refresh()
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setMessage(d.error ?? 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
        <p className="text-white font-medium text-sm mb-1">ข้อมูลส่วนตัว</p>
        <p className="text-slate-500 text-xs mb-4">ข้อมูลที่แสดงกับผู้ใช้คนอื่น</p>

        <div className="space-y-4">
          <ReadOnlyField label="อีเมล" value={user.email} />
          <div className="grid md:grid-cols-2 gap-3">
            <ReadOnlyField label="บทบาท" value={ROLE_LABEL[user.role]} />
            <ReadOnlyField label="สถานะ" value={STATUS_LABEL[user.status]} />
          </div>
          {user.mentor && (
            <ReadOnlyField
              label="Mentor"
              value={`${user.mentor.nameTh} (${user.mentor.email})`}
            />
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อ (ไทย)</label>
            <input
              type="text"
              required
              value={nameTh}
              onChange={(e) => setNameTh(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อ (อังกฤษ)</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 inline-flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              ภาษา
            </label>
            <select
              value={preferredLocale}
              onChange={(e) => setPreferredLocale(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            >
              <option value="th">ไทย</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {message && (
          <span className="text-emerald-400 text-xs inline-flex items-center gap-1">
            <Check className="w-3 h-3" />
            {message}
          </span>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'กำลังบันทึก' : 'บันทึก'}
        </button>
      </div>
    </form>
  )
}

function PasswordTab() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (newPassword.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านยืนยันไม่ตรงกัน')
      return
    }
    setSaving(true)
    const res = await fetch('/api/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('เปลี่ยนรหัสผ่านสำเร็จ')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setError(d.error ?? 'เปลี่ยนรหัสผ่านไม่สำเร็จ')
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-white font-medium text-sm mb-1">เปลี่ยนรหัสผ่าน</p>
          <p className="text-slate-500 text-xs">ใช้รหัสผ่านอย่างน้อย 8 ตัวอักษร</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่านปัจจุบัน</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">รหัสผ่านใหม่</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">ยืนยันรหัสผ่านใหม่</label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>

        {error && (
          <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-xs">{error}</p>
          </div>
        )}
        {message && (
          <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-xs">{message}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          {saving ? 'กำลังบันทึก' : 'เปลี่ยนรหัสผ่าน'}
        </button>
      </div>
    </form>
  )
}

function SystemTab({ initial }: { initial: Record<SettingKey, string | boolean> }) {
  const [values, setValues] = useState<Record<SettingKey, string | boolean>>(initial)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const res = await fetch('/api/settings/system', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('บันทึกแล้ว')
      setTimeout(() => setMessage(''), 2500)
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setMessage(d.error ?? 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-white font-medium text-sm mb-1">ตั้งค่าระบบ</p>
          <p className="text-slate-500 text-xs">ค่าที่ใช้ทั่วทั้งระบบ · เก็บใน PostgreSQL</p>
        </div>

        {SETTING_KEYS.map((key) => {
          const meta = SETTING_META[key]
          const val = values[key]
          return (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">{meta.label}</label>
              <p className="text-slate-500 text-[11px] mb-1.5">{meta.description}</p>
              {meta.type === 'boolean' ? (
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.checked }))}
                    className="w-4 h-4 rounded bg-slate-950 border-white/10 text-blue-500 focus:ring-blue-500/40"
                  />
                  <span className="text-slate-300 text-sm">
                    {val ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </label>
              ) : (
                <input
                  type={meta.type === 'email' ? 'email' : 'text'}
                  value={String(val ?? '')}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3">
        {message && <span className="text-emerald-400 text-xs">{message}</span>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'กำลังบันทึก' : 'บันทึก'}
        </button>
      </div>
    </form>
  )
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1.5">{label}</label>
      <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-slate-400 text-sm">
        {value}
      </div>
    </div>
  )
}
