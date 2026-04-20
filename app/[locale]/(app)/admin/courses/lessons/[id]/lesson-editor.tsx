'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Save } from 'lucide-react'

type LessonData = {
  id: string
  order: number
  slug: string
  titleTh: string
  titleEn: string | null
  bodyTh: string
  bodyEn: string | null
  weekId: string
  courseId: string
  courseTitleTh: string
  weekOrder: number
  weekTitleTh: string
}

export default function LessonEditor({
  locale,
  lesson,
}: {
  locale: string
  lesson: LessonData
}) {
  const router = useRouter()
  const [titleTh, setTitleTh] = useState(lesson.titleTh)
  const [titleEn, setTitleEn] = useState(lesson.titleEn ?? '')
  const [slug, setSlug] = useState(lesson.slug)
  const [bodyTh, setBodyTh] = useState(lesson.bodyTh)
  const [bodyEn, setBodyEn] = useState(lesson.bodyEn ?? '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const save = async () => {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titleTh,
        titleEn: titleEn || null,
        slug,
        bodyTh,
        bodyEn: bodyEn || null,
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
    <div className="p-6 max-w-4xl">
      <Link
        href={`/${locale}/admin/courses/${lesson.courseId}`}
        className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        กลับไปหลักสูตร
      </Link>

      <div className="mb-6">
        <p className="text-slate-500 text-xs mb-1">
          {lesson.courseTitleTh} · W{lesson.weekOrder} {lesson.weekTitleTh} · บทเรียนที่ {lesson.order}
        </p>
        <h1 className="text-2xl font-bold text-white">แก้ไขบทเรียน</h1>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อ (ไทย)</label>
            <input
              type="text"
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">ชื่อ (อังกฤษ)</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9-]+"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-blue-500/40"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">เนื้อหา (ไทย) — Markdown</label>
          <textarea
            value={bodyTh}
            onChange={(e) => setBodyTh(e.target.value)}
            rows={16}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-blue-500/40 resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">เนื้อหา (อังกฤษ) — Markdown</label>
          <textarea
            value={bodyEn}
            onChange={(e) => setBodyEn(e.target.value)}
            rows={12}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-blue-500/40 resize-y"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          {message && <span className="text-slate-400 text-xs">{message}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? 'กำลังบันทึก' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
