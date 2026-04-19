import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { BarChart2 } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">สถิติ</h1>
        <p className="text-slate-400 text-sm mt-1">วิเคราะห์ผลการเรียนรู้และความก้าวหน้า</p>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <BarChart2 className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-white font-medium mb-1">กำลังพัฒนา</p>
        <p className="text-slate-500 text-sm">กราฟและสถิติจะแสดงที่นี่</p>
      </div>
    </div>
  )
}
