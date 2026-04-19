import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      rubric: { include: { rows: { orderBy: { order: 'asc' } } } },
    },
  })
  if (!assignment) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

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

  return NextResponse.json({ success: true, data: { assignment, submission } })
}
