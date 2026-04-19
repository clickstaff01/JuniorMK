import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { GraduationCap } from 'lucide-react'

export default async function CoursesPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">หลักสูตร</h1>
          <p className="text-slate-400 text-sm mt-1">จัดการหลักสูตรและบทเรียน</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors">
          + สร้างหลักสูตรใหม่
        </button>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-white font-medium mb-1">ยังไม่มีหลักสูตร</p>
        <p className="text-slate-500 text-sm">กดปุ่ม "สร้างหลักสูตรใหม่" เพื่อเริ่มต้น</p>
      </div>
    </div>
  )
}
