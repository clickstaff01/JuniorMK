import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { BookOpen, FileText, Clock } from 'lucide-react'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const role = session.user.role
  if (role === 'MANAGER') redirect(`/${params.locale}/manage/queue`)
  if (role === 'ADMIN') redirect(`/${params.locale}/admin/dashboard`)

  const t = await getTranslations({ locale: params.locale, namespace: 'common' })

  return (
    <div className="p-6 max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-slate-400 text-sm mb-1">ยินดีต้อนรับ</p>
        <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{session.user.email}</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">หลักสูตรปัจจุบัน</p>
          <p className="text-white font-semibold text-sm">—</p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">งานที่ส่งแล้ว</p>
          <p className="text-white font-semibold text-sm">—</p>
        </div>

        <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-slate-400 text-xs mb-1">งานที่รอส่ง</p>
          <p className="text-white font-semibold text-sm">—</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">{t('comingSoon')} — คุณสมบัติเพิ่มเติมจะพร้อมใช้งานเร็วๆ นี้</p>
      </div>
    </div>
  )
}
