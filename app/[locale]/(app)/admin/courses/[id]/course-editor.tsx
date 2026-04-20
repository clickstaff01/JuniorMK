'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, BookOpen, ChevronDown, ChevronRight, Save, FileText } from 'lucide-react'

type LessonRow = {
  id: string
  order: number
  slug: string
  titleTh: string
  titleEn: string | null
}

type WeekRow = {
  id: string
  order: number
  titleTh: string
  titleEn: string | null
  descriptionTh: string | null
  assignmentCount: number
  lessons: LessonRow[]
}

type CourseData = {
  id: string
  slug: string
  titleTh: string
  titleEn: string | null
  descriptionTh: string | null
  descriptionEn: string | null
  isPublished: boolean
  weeks: WeekRow[]
}

export default function CourseEditor({
  locale,
  initial,
}: {
  locale: string
  initial: CourseData
}) {
  const router = useRouter()
  const [titleTh, setTitleTh] = useState(initial.titleTh)
  const [titleEn, setTitleEn] = useState(initial.titleEn ?? '')
  const [descriptionTh, setDescriptionTh] = useState(initial.descriptionTh ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const saveCourse = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/admin/courses/${initial.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleTh,
        titleEn: titleEn || null,
        descriptionTh: descriptionTh || null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setMessage('บันทึกแล้ว')
      setTimeout(() => setMessage(''), 2000)
      router.refresh()
    } else {
      const d = (await res.json().catch(() => ({}))) as { error?: string }
      setMessage(d.error ?? 'บันทึกไม่สำเร็จ')
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      <Link
        href={`/${locale}/admin/courses`}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        กลับ
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-xs font-mono mb-1">{initial.slug}</p>
          <h1 className="text-2xl font-bold text-white">{titleTh}</h1>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {message && <span className="text-slate-400 text-xs">{message}</span>}
          <button
            onClick={saveCourse}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'กำลังบันทึก' : 'บันทึก'}
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 mb-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อหลักสูตร (ไทย)</label>
          <input
            type="text"
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
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">สัปดาห์ ({initial.weeks.length})</h2>
        <AddWeekButton courseId={initial.id} nextOrder={(initial.weeks.at(-1)?.order ?? 0) + 1} />
      </div>

      {initial.weeks.length === 0 ? (
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-white text-sm mb-1">ยังไม่มีสัปดาห์</p>
          <p className="text-slate-500 text-xs">กด &quot;+ เพิ่มสัปดาห์&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="space-y-3">
          {initial.weeks.map((w) => (
            <WeekCard key={w.id} week={w} courseId={initial.id} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}

function AddWeekButton({ courseId, nextOrder }: { courseId: string; nextOrder: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const create = async () => {
    const titleTh = prompt(`ชื่อสัปดาห์ที่ ${nextOrder}`)
    if (!titleTh) return
    setLoading(true)
    const res = await fetch(`/api/admin/courses/${courseId}/weeks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: nextOrder, titleTh }),
    })
    setLoading(false)
    if (res.ok) router.refresh()
    else alert('สร้างไม่สำเร็จ')
  }

  return (
    <button
      onClick={create}
      disabled={loading}
      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition-colors inline-flex items-center gap-1.5"
    >
      <Plus className="w-3.5 h-3.5" />
      เพิ่มสัปดาห์
    </button>
  )
}

function WeekCard({ week, courseId, locale }: { week: WeekRow; courseId: string; locale: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [titleTh, setTitleTh] = useState(week.titleTh)
  const [descriptionTh, setDescriptionTh] = useState(week.descriptionTh ?? '')

  void locale

  const save = async () => {
    const res = await fetch(`/api/admin/weeks/${week.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titleTh, descriptionTh: descriptionTh || null }),
    })
    if (res.ok) {
      setEditing(false)
      router.refresh()
    }
  }

  const remove = async () => {
    if (!confirm(`ลบสัปดาห์ที่ ${week.order}? บทเรียน/งานในสัปดาห์นี้จะถูกลบด้วย`)) return
    const res = await fetch(`/api/admin/weeks/${week.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  const addLesson = async () => {
    const titleTh = prompt('ชื่อบทเรียน')
    if (!titleTh) return
    const slug = prompt('Slug ของบทเรียน (ตัวพิมพ์เล็ก+ขีดกลาง)')
    if (!slug) return
    const nextOrder = (week.lessons.at(-1)?.order ?? 0) + 1
    const res = await fetch(`/api/admin/weeks/${week.id}/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: nextOrder, slug, titleTh, bodyTh: '' }),
    })
    if (res.ok) router.refresh()
    else alert('สร้างไม่สำเร็จ')
  }

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4">
        <button onClick={() => setOpen((v) => !v)} className="text-slate-400 hover:text-white">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
          W{week.order}
        </span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              autoFocus
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === 'Enter') save()
                if (e.key === 'Escape') {
                  setTitleTh(week.titleTh)
                  setEditing(false)
                }
              }}
              className="w-full px-2 py-1 rounded-md bg-slate-950 border border-blue-500/40 text-white text-sm focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="text-white text-sm hover:text-blue-400 transition-colors text-left truncate"
            >
              {week.titleTh}
            </button>
          )}
        </div>
        <span className="text-slate-500 text-xs">
          {week.lessons.length} บทเรียน · {week.assignmentCount} งาน
        </span>
        <button
          onClick={remove}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
          title="ลบสัปดาห์"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 px-5 py-4 space-y-3">
          <textarea
            value={descriptionTh}
            onChange={(e) => setDescriptionTh(e.target.value)}
            onBlur={save}
            placeholder="คำอธิบายสัปดาห์"
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500/40 resize-none"
          />

          <div className="space-y-2">
            {week.lessons.map((l) => (
              <LessonRowView
                key={l.id}
                courseId={courseId}
                weekId={week.id}
                lesson={l}
                locale={locale}
              />
            ))}
          </div>

          <button
            onClick={addLesson}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            เพิ่มบทเรียน
          </button>
        </div>
      )}
    </div>
  )
}

function LessonRowView({
  lesson,
  locale,
  courseId,
  weekId,
}: {
  lesson: LessonRow
  locale: string
  courseId: string
  weekId: string
}) {
  const router = useRouter()
  void locale
  void courseId
  void weekId

  const remove = async () => {
    if (!confirm(`ลบบทเรียน "${lesson.titleTh}"?`)) return
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-950 border border-white/5">
      <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
      <span className="text-slate-500 text-xs font-mono">{lesson.order}.</span>
      <Link
        href={`/${locale}/admin/courses/lessons/${lesson.id}`}
        className="flex-1 min-w-0 text-white text-sm hover:text-blue-400 transition-colors truncate"
      >
        {lesson.titleTh}
      </Link>
      <span className="text-slate-600 text-xs font-mono truncate max-w-[160px]">{lesson.slug}</span>
      <button
        onClick={remove}
        className="p-1 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}
