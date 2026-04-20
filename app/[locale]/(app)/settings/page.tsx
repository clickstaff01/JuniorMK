import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { getAllSettings } from '@/lib/settings'
import SettingsForm from './settings-form'

export const dynamic = 'force-dynamic'

export default async function SettingsPage({ params }: { params: { locale: string } }) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      nameTh: true,
      nameEn: true,
      role: true,
      status: true,
      preferredLocale: true,
      createdAt: true,
      mentor: { select: { nameTh: true, email: true } },
    },
  })

  if (!user) redirect(`/${params.locale}/auth/sign-in`)

  const isAdmin = user.role === 'ADMIN'
  const systemSettings = isAdmin ? await getAllSettings() : null

  return (
    <SettingsForm
      locale={params.locale}
      user={{
        id: user.id,
        email: user.email,
        nameTh: user.nameTh,
        nameEn: user.nameEn,
        role: user.role,
        status: user.status,
        preferredLocale: user.preferredLocale,
        createdAt: user.createdAt.toISOString(),
        mentor: user.mentor,
      }}
      isAdmin={isAdmin}
      systemSettings={systemSettings}
    />
  )
}
