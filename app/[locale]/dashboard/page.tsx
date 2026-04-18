import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { signOut } from '@/auth'

const roleLabel: Record<string, string> = {
  ADMIN: 'ผู้ดูแลระบบ',
  MANAGER: 'ผู้จัดการ',
  STAFF: 'พนักงาน',
}

const roleBadgeColor: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  MANAGER: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  STAFF: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = await auth()

  if (!session) {
    redirect(`/${params.locale}/auth/sign-in`)
  }

  const role = session.user.role ?? 'STAFF'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
              <span className="text-white text-xs font-bold">CB</span>
            </div>
            <span className="text-white font-semibold text-sm">Click Broker Learning</span>
          </div>

          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>

        {/* Welcome card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-1">ยินดีต้อนรับ</p>
              <h1 className="text-2xl font-bold text-white">{session.user.name}</h1>
              <p className="text-slate-400 text-sm mt-0.5">{session.user.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full border text-xs font-medium ${roleBadgeColor[role]}`}>
              {roleLabel[role]}
            </span>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-slate-400 text-sm text-center">
              ระบบกำลังพัฒนา — คุณสมบัติเพิ่มเติมจะพร้อมใช้งานเร็วๆ นี้
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
