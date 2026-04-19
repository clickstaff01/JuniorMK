'use client'

import { useRouter, usePathname } from 'next/navigation'

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const toggle = () => {
    const next = locale === 'th' ? 'en' : 'th'
    router.push(pathname.replace(`/${locale}`, `/${next}`))
  }

  return (
    <button
      onClick={toggle}
      className="px-3 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors border border-slate-700"
    >
      {locale === 'th' ? 'EN' : 'TH'}
    </button>
  )
}
