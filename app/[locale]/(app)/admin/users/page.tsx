import { requireRole } from '@/lib/auth/guards'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import UsersTable from './users-table'

export const dynamic = 'force-dynamic'

export default async function UsersPage({ params }: { params: { locale: string } }) {
  try {
    await requireRole(['ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      mentor: { select: { id: true, nameTh: true } },
    },
  })

  const mentorCandidates = await prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'ADMIN'] }, status: 'ACTIVE' },
    select: { id: true, nameTh: true, email: true },
    orderBy: { nameTh: 'asc' },
  })

  const initial = users.map((u) => ({
    id: u.id,
    email: u.email,
    nameTh: u.nameTh,
    nameEn: u.nameEn,
    role: u.role,
    status: u.status,
    mentor: u.mentor,
    createdAt: u.createdAt.toISOString(),
  }))

  return <UsersTable initialUsers={initial} mentorCandidates={mentorCandidates} />
}
