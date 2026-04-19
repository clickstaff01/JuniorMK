'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage({ params }: { params: { locale: string } }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) setSent(true)
      else setError('ไม่พบอีเมลนี้ในระบบ')
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm shadow-2xl">
          <Link
            href={`/${params.locale}/auth/sign-in`}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs mb-6 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            กลับสู่หน้าเข้าสู่ระบบ
          </Link>

          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-white font-semibold mb-2">ส่งลิงก์แล้ว</p>
              <p className="text-slate-400 text-sm leading-relaxed">
                หากอีเมล <strong className="text-white">{email}</strong> มีในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านในไม่ช้า
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
                  <span className="text-white text-sm font-bold">CB</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">ลืมรหัสผ่าน</p>
                  <p className="text-blue-400 text-xs">ส่งลิงก์รีเซ็ตรหัสผ่าน</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">อีเมล</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@clickbroker.co.th"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-medium text-sm transition-colors mt-2"
                >
                  {loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
