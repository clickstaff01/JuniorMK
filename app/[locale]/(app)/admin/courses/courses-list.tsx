'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, X, Users, BookOpen, ArrowUpRight, Trash2 } from 'lucide-react'

type CourseRow = {
  id: string
  slug: string
  titleTh: string
  titleEn: string | null
  descriptionTh: string | null
  isPublished: boolean
  weekCount: number
  enrollmentCount: number
  createdAt: string
}

export default function CoursesList({
  locale,
  initialCourses,
}: {
  locale: string
  initialCourses: CourseRow[]
}) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">หลักสูตร</h1>
          <p className="text-slate-400 text-sm mt-1">
            จัดการหลักสูตรและบทเรียน · ทั้งหมด {initialCourses.length.toLocaleString()} หลักสูตร
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          + สร้างหลักสูตรใหม่
        </button>
      </div>

      {initialCourses.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-white font-medium mb-1">ยังไม่มีหลักสูตร</p>
          <p className="text-slate-500 text-sm">กดปุ่ม &quot;สร้างหลักสูตรใหม่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {initialCourses.map((c) => (
            <CourseCard
              key={c.id}
              locale={locale}
              course={c}
              onChange={() => router.refresh()}
            />
          ))}
        </div>
      )}

      {createOpen && (
        <CreateDialog
          locale={locale}
          onClose={() => setCreateOpen(false)}
          onCreated={(id) => {
            router.push(`/${locale}/admin/courses/${id}`)
          }}
        />
      )}
    </div>
  )
}

function CourseCard({
  locale,
  course,
  onChange,
}: {
  locale: string
  course: CourseRow
  onChange: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const togglePublish = async () => {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/admin/courses/${course.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !course.isPublished }),
    })
    setBusy(false)
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setError(d.error ?? 'ล้มเหลว')
      return
    }
    onChange()
  }

  const remove = async () => {
    if (!confirm(`ลบหลักสูตร "${course.titleTh}" ใช่หรือไม่? การลบจะลบทุกสัปดาห์/บทเรียนที่เกี่ยวข้อง`)) return
    setBusy(true)
    const res = await fetch(`/api/admin/courses/${course.id}`, { method: 'DELETE' })
    setBusy(false)
    if (!res.ok) {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setError(d.error ?? 'ลบไม่สำเร็จ')
      return
    }
    onChange()
  }

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-500 text-xs font-mono">{course.slug}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] border ${
                course.isPublished
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}
            >
              {course.isPublished ? 'เผยแพร่' : 'ร่าง'}
            </span>
          </div>
          <h3 className="text-white font-medium text-base truncate">{course.titleTh}</h3>
          {course.descriptionTh && (
            <p className="text-slate-400 text-xs mt-1 line-clamp-2">{course.descriptionTh}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{course.weekCount} สัปดาห์</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          <span>{course.enrollmentCount} คน</span>
        </div>
      </div>

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      <div className="flex items-center gap-2">
        <Link
          href={`/${locale}/admin/courses/${course.id}`}
          className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium text-center transition-colors inline-flex items-center justify-center gap-1"
        >
          จัดการเนื้อหา <ArrowUpRight className="w-3 h-3" />
        </Link>
        <button
          onClick={togglePublish}
          disabled={busy}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs transition-colors"
        >
          {course.isPublished ? 'ยกเลิกเผยแพร่' : 'เผยแพร่'}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          className="px-2.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 transition-colors"
          title="ลบ"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function CreateDialog({
  locale,
  onClose,
  onCreated,
}: {
  locale: string
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [slug, setSlug] = useState('')
  const [titleTh, setTitleTh] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [descriptionTh, setDescriptionTh] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  void locale

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug.trim(),
          titleTh: titleTh.trim(),
          titleEn: titleEn.trim() || null,
          descriptionTh: descriptionTh.trim() || null,
        }),
      })
      const data = (await res.json()) as { error?: string; courseId?: string }
      if (!res.ok) {
        setError(data.error ?? 'สร้างไม่สำเร็จ')
        return
      }
      if (data.courseId) onCreated(data.courseId)
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <p className="text-white font-medium">สร้างหลักสูตรใหม่</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Slug</label>
            <input
              type="text"
              required
              pattern="[a-z0-9-]+"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="digital-marketing-101"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white placeholder:text-slate-500 text-sm font-mono focus:outline-none focus:border-blue-500/40"
            />
            <p className="text-slate-500 text-xs mt-1">ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อหลักสูตร (ไทย)</label>
            <input
              type="text"
              required
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อหลักสูตร (อังกฤษ)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">คำอธิบาย</label>
            <textarea
              value={descriptionTh}
              onChange={(e) => setDescriptionTh(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40 resize-none"
            />
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
            {loading ? 'กำลังสร้าง...' : 'สร้าง'}
          </button>
        </form>
      </div>
    </div>
  )
}
