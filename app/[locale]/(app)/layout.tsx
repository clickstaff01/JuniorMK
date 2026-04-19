import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import AppShell from '@/components/layout/AppShell'

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export default async function AppLayout({ children, params: { locale } }: Props) {
  setRequestLocale(locale)

  const session = await auth()
  if (!session) redirect(`/${locale}/auth/sign-in`)

  return (
    <AppShell session={session} locale={locale}>
      {children}
    </AppShell>
  )
}
