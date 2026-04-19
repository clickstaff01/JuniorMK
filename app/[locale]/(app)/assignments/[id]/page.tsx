import { auth } from '@/auth'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import AssignmentForm from './AssignmentForm'

export default async function AssignmentPage({
  params,
}: {
  params: { locale: string; id: string }
}) {
  const session = await auth()
  if (!session) redirect(`/${params.locale}/auth/sign-in`)

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      rubric: { include: { rows: { orderBy: { order: 'asc' } } } },
      week: { include: { course: true } },
    },
  })
  if (!assignment) notFound()

  let submission = await prisma.submission.findFirst({
    where: { assignmentId: params.id, authorId: session.user.id, status: 'DRAFT' },
    include: { answers: true },
    orderBy: { createdAt: 'desc' },
  })

  if (!submission) {
    submission = await prisma.submission.create({
      data: { assignmentId: params.id, authorId: session.user.id, status: 'DRAFT', version: 1 },
      include: { answers: true },
    })
  }

  const prevSubmission = await prisma.submission.findFirst({
    where: {
      assignmentId: params.id,
      authorId: session.user.id,
      status: { in: ['SUBMITTED', 'GRADED', 'APPROVED', 'NEEDS_REWORK'] },
    },
    include: { rubricScores: { include: { rubricRow: true } } },
    orderBy: { submittedAt: 'desc' },
  })

  const locale = params.locale

  const initialAnswers: Record<string, unknown> = {}
  submission.answers.forEach((a) => {
    initialAnswers[a.questionId] = a.value
  })

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <AssignmentForm
        assignment={JSON.parse(JSON.stringify(assignment))}
        submission={JSON.parse(JSON.stringify(submission))}
        prevSubmission={prevSubmission ? JSON.parse(JSON.stringify(prevSubmission)) : null}
        initialAnswers={initialAnswers}
        locale={locale}
      />
    </div>
  )
}
