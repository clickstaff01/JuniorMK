import { requireRole } from '@/lib/auth/guards'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import GradingForm from './GradingForm'

export default async function ManageSubmissionPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  let session
  try {
    session = await requireRole(['MANAGER', 'ADMIN'])
  } catch {
    redirect(`/${params.locale}/dashboard`)
  }

  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      assignment: {
        include: {
          questions: { orderBy: { order: 'asc' } },
          week: true,
          rubric: { include: { rows: { orderBy: { order: 'asc' } } } },
        },
      },
      answers: { include: { question: true } },
      rubricScores: true,
    },
  })
  if (!submission) notFound()

  const locale = params.locale

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <GradingForm
        submission={JSON.parse(JSON.stringify(submission))}
        locale={locale}
      />
    </div>
  )
}
