'use client'

import { useEffect, useRef, useCallback } from 'react'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'

interface Props {
  lessonSlug: string
  body: string
  isRead: boolean
}

export default function LessonViewer({ lessonSlug, body, isRead: initialIsRead }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRead, setIsRead] = useState(initialIsRead)
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const saveProgress = useCallback(async (scrollDepth: number, markRead = false) => {
    if (saving) return
    setSaving(true)
    try {
      await fetch(`/api/learn/lessons/${lessonSlug}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scrollDepth, markRead }),
      })
      if (markRead || scrollDepth >= 0.9) setIsRead(true)
    } finally {
      setSaving(false)
    }
  }, [lessonSlug, saving])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      const depth = Math.min(1, scrolled / total)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        saveProgress(depth)
      }, 1500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [saveProgress])

  return (
    <div ref={containerRef}>
      <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
        <MarkdownRenderer content={body} />
      </div>

      {!isRead && (
        <button
          onClick={() => saveProgress(1, true)}
          className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors w-full justify-center"
        >
          <CheckCircle className="w-4 h-4" />
          ทำเครื่องหมายว่าอ่านแล้ว
        </button>
      )}

      {isRead && !initialIsRead && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm justify-center">
          <CheckCircle className="w-4 h-4" />
          บันทึกแล้ว — อ่านแล้ว
        </div>
      )}
    </div>
  )
}
