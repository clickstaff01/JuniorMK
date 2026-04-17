import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'

export default function HomePage() {
  const t = useTranslations('common')
  const tNav = useTranslations('nav')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold">{t('hello')}</h1>
      <p className="text-muted-foreground">Click Broker Learning Platform</p>
      <Link
        href="/dashboard"
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
      >
        {tNav('dashboard')}
      </Link>
    </main>
  )
}
