import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Settings } from 'lucide-react'

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">ตั้งค่า</h1>
        <p className="text-slate-400 text-sm mt-1">โปรไฟล์และการตั้งค่าบัญชี</p>
      </div>

      <div className="bg-slate-900 border border-white/5 rounded-2xl p-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Settings className="w-6 h-6 text-slate-500" />
        </div>
        <p className="text-white font-medium mb-1">กำลังพัฒนา</p>
        <p className="text-slate-500 text-sm">การตั้งค่าโปรไฟล์และรหัสผ่านจะแสดงที่นี่</p>
      </div>
    </div>
  )
}
