'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ChevronLeft, Save, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { QuestionType } from '@prisma/client'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

interface Question {
  id: string
  order: number
  type: QuestionType
  promptTh: string
  promptEn: string | null
  required: boolean
  config: unknown
}

interface RubricRow {
  id: string
  order: number
  labelTh: string
  labelEn: string | null
  greatTh: string
  okTh: string | null
  reworkTh: string
}

interface Assignment {
  id: string
  code: string
  titleTh: string
  titleEn: string | null
  descriptionTh: string | null
  questions: Question[]
  rubric: { rows: RubricRow[] } | null
  week: { order: number; titleTh: string; course: { titleTh: string } }
}

interface Submission {
  id: string
  status: string
  submittedAt: string | null
}

interface RubricScore {
  rubricRowId: string
  level: 'GREAT' | 'OK' | 'REWORK'
  comment: string | null
  rubricRow: { labelTh: string }
}

interface PrevSubmission {
  id: string
  status: string
  overallStatus: string | null
  managerSummary: string | null
  gradedAt: string | null
  rubricScores: RubricScore[]
}

interface Props {
  assignment: Assignment
  submission: Submission
  prevSubmission: PrevSubmission | null
  initialAnswers: Record<string, unknown>
  locale: string
}

export default function AssignmentForm({ assignment, submission, prevSubmission, initialAnswers, locale }: Props) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(submission.status !== 'DRAFT')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dirtyRef = useRef(false)

  const autosave = useCallback(async (questionId: string, value: unknown) => {
    if (submitted) return
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/autosave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id, questionId, value }),
      })
      if (res.ok) setLastSaved(new Date())
      else setSaveError('บันทึกไม่สำเร็จ')
    } catch {
      setSaveError('บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }, [assignment.id, submission.id, submitted])

  const setAnswer = (questionId: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
    dirtyRef.current = true
  }

  useEffect(() => {
    if (submitted) return
    timerRef.current = setInterval(async () => {
      if (!dirtyRef.current) return
      dirtyRef.current = false
      setSaving(true)
      setSaveError(null)
      try {
        const entries = Object.entries(answers)
        await Promise.all(
          entries.map(([questionId, value]) =>
            fetch(`/api/assignments/${assignment.id}/autosave`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ submissionId: submission.id, questionId, value }),
            })
          )
        )
        setLastSaved(new Date())
      } catch {
        setSaveError('บันทึกไม่สำเร็จ')
      } finally {
        setSaving(false)
      }
    }, 15000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [answers, assignment.id, submission.id, submitted])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/assignments/${assignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id, answers }),
      })
      if (res.ok) {
        setSubmitted(true)
        router.push(`/${locale}/submissions/my`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const titleText = locale === 'th' ? assignment.titleTh : (assignment.titleEn ?? assignment.titleTh)

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/${locale}/learn`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs mb-4 transition-colors w-fit">
          <ChevronLeft className="w-3.5 h-3.5" />
          กลับสู่หลักสูตร
        </Link>
        <p className="text-slate-500 text-xs mb-1">
          สัปดาห์ {assignment.week.order} — {assignment.code}
        </p>
        <h1 className="text-xl font-bold text-white">{titleText}</h1>
        {assignment.descriptionTh && (
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            {locale === 'th' ? assignment.descriptionTh : assignment.descriptionTh}
          </p>
        )}
      </div>

      {/* Previous grade result */}
      {prevSubmission && (
        <GradeResult prevSubmission={prevSubmission} locale={locale} />
      )}

      {/* Submitted banner */}
      {submitted && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 font-medium text-sm">ส่งงานแล้ว</p>
            <p className="text-emerald-400/70 text-xs">รอผู้จัดการตรวจสอบ</p>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {assignment.questions.map((q, i) => (
          <QuestionBlock
            key={q.id}
            question={q}
            index={i}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
            onBlur={(v) => autosave(q.id, v)}
            locale={locale}
            disabled={submitted}
          />
        ))}
      </div>

      {/* Footer */}
      {!submitted && (
        <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs">
            {saving && <Clock className="w-3.5 h-3.5 text-slate-500 animate-pulse" />}
            {saveError && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
            {lastSaved && !saving && <Save className="w-3.5 h-3.5 text-slate-600" />}
            <span className="text-slate-500">
              {saving ? 'กำลังบันทึก...' : saveError ?? (lastSaved ? `บันทึกล่าสุด ${lastSaved.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}` : 'บันทึกอัตโนมัติทุก 15 วินาที')}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'กำลังส่ง...' : 'ส่งงาน'}
          </button>
        </div>
      )}
    </>
  )
}

function GradeResult({ prevSubmission, locale }: { prevSubmission: PrevSubmission; locale: string }) {
  const isApproved = prevSubmission.overallStatus === 'APPROVED'
  return (
    <div className={`mb-6 rounded-2xl border p-5 ${isApproved ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isApproved
          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
          : <AlertCircle className="w-5 h-5 text-red-400" />
        }
        <span className={`font-semibold text-sm ${isApproved ? 'text-emerald-400' : 'text-red-400'}`}>
          {isApproved ? 'ผ่านแล้ว' : 'ต้องแก้ไขใหม่'}
        </span>
      </div>
      {prevSubmission.managerSummary && (
        <p className="text-slate-300 text-sm mb-3 leading-relaxed">{prevSubmission.managerSummary}</p>
      )}
      {prevSubmission.rubricScores.length > 0 && (
        <div className="space-y-1.5">
          {prevSubmission.rubricScores.map((score) => (
            <div key={score.rubricRowId} className="flex items-center gap-2 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-medium ${score.level === 'GREAT' ? 'bg-emerald-500/20 text-emerald-400' : score.level === 'OK' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                {score.level === 'GREAT' ? 'ดีมาก' : score.level === 'OK' ? 'ผ่าน' : 'แก้ใหม่'}
              </span>
              <span className="text-slate-400">{score.rubricRow.labelTh}</span>
              {score.comment && <span className="text-slate-500">— {score.comment}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionBlock({
  question,
  index,
  value,
  onChange,
  onBlur,
  locale,
  disabled,
}: {
  question: Question
  index: number
  value: unknown
  onChange: (v: unknown) => void
  onBlur: (v: unknown) => void
  locale: string
  disabled: boolean
}) {
  const prompt = locale === 'th' ? question.promptTh : (question.promptEn ?? question.promptTh)
  const config = question.config as Record<string, unknown> | null

  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
      <div className="flex items-start gap-2 mb-3">
        <span className="text-slate-600 text-xs font-mono mt-0.5 flex-shrink-0">{index + 1}.</span>
        <p className="text-slate-200 text-sm leading-relaxed">
          {prompt}
          {question.required && <span className="text-red-400 ml-1">*</span>}
        </p>
      </div>

      {question.type === 'SHORT_TEXT' && (
        <input
          type="text"
          disabled={disabled}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-500 disabled:opacity-60"
          placeholder="คำตอบของคุณ..."
        />
      )}

      {question.type === 'URL' && (
        <input
          type="url"
          disabled={disabled}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onBlur(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-500 disabled:opacity-60"
          placeholder="https://..."
        />
      )}

      {question.type === 'LONG_TEXT' && (
        <RichTextEditor
          value={(value as string) ?? ''}
          onChange={(v) => onChange(v)}
          disabled={disabled}
          placeholder="คำตอบของคุณ..."
        />
      )}

      {question.type === 'MULTIPLE_CHOICE' && (
        <MCChoice
          options={(config?.options as string[]) ?? []}
          value={(value as string) ?? ''}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === 'CHECKBOXES' && (
        <CheckboxChoice
          options={(config?.options as string[]) ?? []}
          value={(value as string[]) ?? []}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === 'TABLE' && (
        <TableQuestion
          config={config as { columns: string[]; rows: number } | null}
          value={value as string[][] | null}
          onChange={onChange}
          disabled={disabled}
        />
      )}

      {question.type === 'FILE_UPLOAD' && (
        <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
          <p className="text-slate-500 text-sm">การอัปโหลดไฟล์จะเปิดใช้งานเร็วๆ นี้</p>
          <input
            type="url"
            disabled={disabled}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
            className="mt-3 w-full px-3 py-2 rounded-xl bg-slate-800 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm text-slate-200 placeholder-slate-500 disabled:opacity-60"
            placeholder="หรือวาง URL ของไฟล์ที่นี่..."
          />
        </div>
      )}
    </div>
  )
}

function MCChoice({ options, value, onChange, disabled }: { options: string[]; value: string; onChange: (v: unknown) => void; disabled: boolean }) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-60' : ''}`}>
          <input
            type="radio"
            name={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            disabled={disabled}
            className="accent-blue-500"
          />
          <span className="text-slate-300 text-sm">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function CheckboxChoice({ options, value, onChange, disabled }: { options: string[]; value: string[]; onChange: (v: unknown) => void; disabled: boolean }) {
  const toggle = (opt: string) => {
    const curr = value ?? []
    onChange(curr.includes(opt) ? curr.filter((x) => x !== opt) : [...curr, opt])
  }
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-60' : ''}`}>
          <input
            type="checkbox"
            checked={(value ?? []).includes(opt)}
            onChange={() => toggle(opt)}
            disabled={disabled}
            className="accent-blue-500"
          />
          <span className="text-slate-300 text-sm">{opt}</span>
        </label>
      ))}
    </div>
  )
}

function TableQuestion({
  config,
  value,
  onChange,
  disabled,
}: {
  config: { columns: string[]; rows: number } | null
  value: string[][] | null
  onChange: (v: unknown) => void
  disabled: boolean
}) {
  const cols = config?.columns ?? []
  const rowCount = config?.rows ?? 3

  const initGrid = (): string[][] =>
    Array.from({ length: rowCount }, (_, r) =>
      value?.[r] ? [...value[r], ...Array(cols.length).fill('')].slice(0, cols.length) : Array(cols.length).fill('')
    )

  const [grid, setGrid] = useState<string[][]>(initGrid)

  const set = (r: number, c: number, v: string) => {
    const next = grid.map((row) => [...row])
    next[r][c] = v
    setGrid(next)
    onChange(next)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800">
            {cols.map((col, i) => (
              <th key={i} className="px-3 py-2 text-left text-slate-300 text-xs font-medium border-b border-white/10 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, r) => (
            <tr key={r} className="border-b border-white/5 last:border-0">
              {row.map((cell, c) => (
                <td key={c} className="p-1">
                  <input
                    type="text"
                    disabled={disabled}
                    value={cell}
                    onChange={(e) => set(r, c, e.target.value)}
                    className="w-full px-2 py-1.5 bg-transparent text-slate-300 placeholder-slate-600 focus:outline-none focus:bg-slate-800 rounded transition-colors text-xs disabled:opacity-60"
                    placeholder="—"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
