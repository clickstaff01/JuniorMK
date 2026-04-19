import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { Users, BookOpen, AlertCircle, BarChart2 } from 'lucide-react'

export default async function AdminDashboardPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">แดชบอร์ด Admin</h1>
        <p className="text-slate-400 text-sm mt-1">ภาพรวมระบบทั้งหมด</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'ผู้ใช้งานทั้งหมด', icon: Users, color: 'blue' },
          { label: 'หลักสูตร', icon: BookOpen, color: 'emerald' },
          { label: 'รอตรวจ', icon: AlertCircle, color: 'amber' },
          { label: 'คะแนนเฉลี่ย', icon: BarChart2, color: 'purple' },
        ].map(({ label, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 text-${color}-400`} />
            </div>
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">—</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-8 text-center">
        <p className="text-slate-400 text-sm">กำลังพัฒนา — ตารางรายชื่อผู้ใช้และสถานะจะแสดงที่นี่</p>
      </div>
    </div>
  )
}
