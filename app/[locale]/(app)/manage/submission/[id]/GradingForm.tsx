'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, AlertCircle, Send } from 'lucide-react'
import type { QuestionType, RubricLevel } from '@prisma/client'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Question {
  id: string
  order: number
  type: QuestionType
  promptTh: string
  promptEn: string | null
}

interface Answer {
  id: string
  questionId: string
  value: unknown
  question: Question
}

interface RubricRow {
  id: string
  order: number
  labelTh: string
  greatTh: string
  okTh: string | null
  reworkTh: string
}

interface Submission {
  id: string
  status: string
  overallStatus: string | null
  managerSummary: string | null
  submittedAt: string | null
  gradedAt: string | null
  author: { nameTh: string; email: string }
  assignment: {
    code: string
    titleTh: string
    titleEn: string | null
    week: { order: number }
    rubric: { rows: RubricRow[] } | null
    questions: Question[]
  }
  answers: Answer[]
  rubricScores: Array<{ rubricRowId: string; level: RubricLevel; comment: string | null }>
}

interface Props {
  submission: Submission
  locale: string
}

type LevelMap = Record<string, RubricLevel | ''>
type CommentMap = Record<string, string>

export default function GradingForm({ submission, locale }: Props) {
  const router = useRouter()
  const isAlreadyGraded = submission.status !== 'SUBMITTED'

  const [levels, setLevels] = useState<LevelMap>(() => {
    const init: LevelMap = {}
    submission.rubricScores.forEach((s) => { init[s.rubricRowId] = s.level })
    return init
  })
  const [comments, setComments] = useState<CommentMap>(() => {
    const init: CommentMap = {}
    submission.rubricScores.forEach((s) => { if (s.comment) init[s.rubricRowId] = s.comment })
    return init
  })
  const [overall, setOverall] = useState<'APPROVED' | 'NEEDS_REWORK' | ''>(
    (submission.overallStatus as 'APPROVED' | 'NEEDS_REWORK' | '') ?? ''
  )
  const [summary, setSummary] = useState(submission.managerSummary ?? '')
  const [submitting, setSubmitting] = useState(false)

  const rubricRows = submission.assignment.rubric?.rows ?? []

  const handleGrade = async () => {
    if (!overall) return
    setSubmitting(true)
    try {
      const scores = rubricRows
        .filter((r) => levels[r.id])
        .map((r) => ({ rubricRowId: r.id, level: levels[r.id] as RubricLevel, comment: comments[r.id] }))

      const res = await fetch(`/api/manage/submissions/${submission.id}/grade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overallStatus: overall, managerSummary: summary, scores }),
      })
      if (res.ok) router.push(`/${locale}/manage/queue`)
    } finally {
      setSubmitting(false)
    }
  }

  const titleText = locale === 'th' ? submission.assignment.titleTh : (submission.assignment.titleEn ?? submission.assignment.titleTh)

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href={`/${locale}/manage/queue`} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs mb-4 transition-colors w-fit">
          <ChevronLeft className="w-3.5 h-3.5" />
          กลับสู่คิว
        </Link>
        <p className="text-slate-500 text-xs mb-1">
          สัปดาห์ {submission.assignment.week.order} — {submission.assignment.code}
        </p>
        <h1 className="text-xl font-bold text-white">{titleText}</h1>
        <p className="text-slate-400 text-sm mt-1">
          ส่งโดย: <span className="text-white">{submission.author.nameTh}</span>
          {submission.submittedAt && (
            <> · {new Date(submission.submittedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</>
          )}
        </p>
      </div>

      {/* Answers */}
      <div className="space-y-4 mb-8">
        {submission.assignment.questions.map((q, i) => {
          const answer = submission.answers.find((a) => a.questionId === q.id)
          const prompt = locale === 'th' ? q.promptTh : (q.promptEn ?? q.promptTh)

          return (
            <div key={q.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
              <p className="text-slate-400 text-xs font-medium mb-2">{i + 1}. {prompt}</p>
              <AnswerDisplay type={q.type} value={answer?.value} />
            </div>
          )
        })}
      </div>

      {/* Rubric */}
      {rubricRows.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-white mb-3">เกณฑ์การให้คะแนน</h2>
          <div className="space-y-3">
            {rubricRows.map((row) => (
              <div key={row.id} className="bg-slate-900 border border-white/5 rounded-2xl p-4">
                <p className="text-white text-sm font-medium mb-3">{row.labelTh}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['GREAT', 'OK', 'REWORK'] as const).map((lv) => {
                    const selected = levels[row.id] === lv
                    const desc = lv === 'GREAT' ? row.greatTh : lv === 'OK' ? row.okTh : row.reworkTh
                    const colors = {
                      GREAT: selected ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-white/10 text-slate-400 hover:border-emerald-500/50',
                      OK: selected ? 'bg-amber-600 border-amber-500 text-white' : 'border-white/10 text-slate-400 hover:border-amber-500/50',
                      REWORK: selected ? 'bg-red-700 border-red-600 text-white' : 'border-white/10 text-slate-400 hover:border-red-500/50',
                    }
                    const label = { GREAT: 'ดีมาก', OK: 'ผ่าน', REWORK: 'แก้ใหม่' }
                    return (
                      <button
                        key={lv}
                        type="button"
                        disabled={isAlreadyGraded}
                        onClick={() => setLevels((p) => ({ ...p, [row.id]: lv }))}
                        className={`flex flex-col gap-1 p-3 rounded-xl border text-left transition-all disabled:cursor-default ${colors[lv]}`}
                      >
                        <span className="text-xs font-semibold">{label[lv]}</span>
                        {desc && <span className="text-xs opacity-80 leading-tight">{desc}</span>}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  disabled={isAlreadyGraded}
                  value={comments[row.id] ?? ''}
                  onChange={(e) => setComments((p) => ({ ...p, [row.id]: e.target.value }))}
                  placeholder="ความคิดเห็น (ไม่บังคับ)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm text-slate-300 placeholder-slate-600 disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall decision */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">ผลการตรวจ</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            disabled={isAlreadyGraded}
            onClick={() => setOverall('APPROVED')}
            className={`flex items-center gap-2 p-4 rounded-2xl border transition-all disabled:cursor-default ${
              overall === 'APPROVED'
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'border-white/10 text-slate-400 hover:border-emerald-500/50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">ผ่าน</span>
          </button>
          <button
            type="button"
            disabled={isAlreadyGraded}
            onClick={() => setOverall('NEEDS_REWORK')}
            className={`flex items-center gap-2 p-4 rounded-2xl border transition-all disabled:cursor-default ${
              overall === 'NEEDS_REWORK'
                ? 'bg-red-700 border-red-600 text-white'
                : 'border-white/10 text-slate-400 hover:border-red-500/50'
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">ต้องแก้ไข</span>
          </button>
        </div>

        <textarea
          disabled={isAlreadyGraded}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="สรุปผลการตรวจ / ข้อเสนอแนะ"
          className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 focus:border-blue-500/50 focus:outline-none text-sm text-slate-300 placeholder-slate-600 resize-none disabled:opacity-60"
        />
      </div>

      {!isAlreadyGraded && (
        <button
          onClick={handleGrade}
          disabled={!overall || submitting}
          className="flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจ'}
        </button>
      )}

      {isAlreadyGraded && (
        <div className={`flex items-center gap-3 p-4 rounded-xl ${submission.overallStatus === 'APPROVED' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
          {submission.overallStatus === 'APPROVED'
            ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          }
          <p className={`text-sm font-medium ${submission.overallStatus === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
            ตรวจแล้ว — {submission.overallStatus === 'APPROVED' ? 'ผ่าน' : 'ต้องแก้ไข'}
          </p>
        </div>
      )}
    </>
  )
}

function AnswerDisplay({ type, value }: { type: QuestionType; value: unknown }) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return <p className="text-slate-600 text-sm italic">ไม่มีคำตอบ</p>
  }

  if (type === 'LONG_TEXT' && typeof value === 'string') {
    return <MarkdownRenderer content={value} />
  }

  if (type === 'CHECKBOXES' && Array.isArray(value)) {
    return (
      <ul className="space-y-1">
        {(value as string[]).map((v, i) => (
          <li key={i} className="text-slate-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            {v}
          </li>
        ))}
      </ul>
    )
  }

  if (type === 'TABLE' && Array.isArray(value)) {
    const rows = value as string[][]
    if (rows.length === 0) return <p className="text-slate-600 text-sm italic">ไม่มีคำตอบ</p>
    return (
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-xs">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className="border-b border-white/5 last:border-0">
                {row.map((cell, c) => (
                  <td key={c} className="px-2 py-1.5 text-slate-300 border-r border-white/5 last:border-0">{cell || '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return <p className="text-slate-300 text-sm">{String(value)}</p>
}
