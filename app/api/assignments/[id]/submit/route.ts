import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const body = z.object({
  submissionId: z.string(),
  answers: z.record(z.any()),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })

  const { submissionId, answers } = parsed.data

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, assignmentId: params.id, authorId: session.user.id, status: 'DRAFT' },
  })
  if (!submission) return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })

  await Promise.all(
    Object.entries(answers).map(([questionId, value]) =>
      prisma.answer.upsert({
        where: { submissionId_questionId: { submissionId, questionId } },
        create: { submissionId, questionId, value },
        update: { value },
      })
    )
  )

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'SUBMITTED', submittedAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'SUBMIT',
      entity: 'Submission',
      entityId: submissionId,
      after: { status: 'SUBMITTED' },
    },
  })

  return NextResponse.json({ success: true, data: updated })
}
