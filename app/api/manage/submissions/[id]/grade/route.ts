import { NextRequest, NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth/guards'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const scoreSchema = z.object({
  rubricRowId: z.string(),
  level: z.enum(['GREAT', 'OK', 'REWORK']),
  comment: z.string().optional(),
})

const body = z.object({
  overallStatus: z.enum(['APPROVED', 'NEEDS_REWORK']),
  managerSummary: z.string().optional(),
  scores: z.array(scoreSchema),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let session
  try {
    session = await requireRole(['MANAGER', 'ADMIN'])
  } catch {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })

  const { overallStatus, managerSummary, scores } = parsed.data

  const submission = await prisma.submission.findUnique({ where: { id: params.id } })
  if (!submission) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  await Promise.all(
    scores.map((s) =>
      prisma.rubricScore.upsert({
        where: { submissionId_rubricRowId: { submissionId: params.id, rubricRowId: s.rubricRowId } },
        create: { submissionId: params.id, rubricRowId: s.rubricRowId, level: s.level, comment: s.comment },
        update: { level: s.level, comment: s.comment },
      })
    )
  )

  const finalStatus = overallStatus === 'APPROVED' ? 'APPROVED' : 'NEEDS_REWORK'
  const updated = await prisma.submission.update({
    where: { id: params.id },
    data: {
      overallStatus,
      managerSummary,
      graderId: session.user.id,
      gradedAt: new Date(),
      status: finalStatus,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'GRADE',
      entity: 'Submission',
      entityId: params.id,
      after: { overallStatus, status: finalStatus },
    },
  })

  return NextResponse.json({ success: true, data: updated })
}
