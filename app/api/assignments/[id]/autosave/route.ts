import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const body = z.object({
  submissionId: z.string(),
  questionId: z.string(),
  value: z.any(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })

  const { submissionId, questionId, value } = parsed.data

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, assignmentId: params.id, authorId: session.user.id, status: 'DRAFT' },
  })
  if (!submission) return NextResponse.json({ success: false, error: 'Submission not found' }, { status: 404 })

  const answer = await prisma.answer.upsert({
    where: { submissionId_questionId: { submissionId, questionId } },
    create: { submissionId, questionId, value },
    update: { value },
  })

  return NextResponse.json({ success: true, data: answer })
}
