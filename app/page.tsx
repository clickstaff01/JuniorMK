import { prisma } from '@/lib/db/prisma'

export default async function RootPage() {
  let dbOk = false
  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    dbOk = false
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm shadow-2xl text-center">

          {/* Logo mark */}
          <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl font-bold">CB</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Click Broker Learning
          </h1>
          <p className="mt-2 text-blue-300 text-sm">
            ระบบเรียนรู้ภายในของ Click Insurance Broker
          </p>

          {/* Divider */}
          <div className="my-8 border-t border-white/10" />

          {/* Status */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span
              className={`w-2 h-2 rounded-full ${dbOk ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
            <span className={dbOk ? 'text-emerald-300' : 'text-amber-300'}>
              {dbOk ? 'ระบบพร้อมใช้งาน' : 'กำลังตั้งค่าระบบ...'}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <a
              href="/th/auth/sign-in"
              className="block w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors text-sm"
            >
              เข้าสู่ระบบ
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Click Insurance Broker
        </p>
      </div>
    </div>
  )
}
