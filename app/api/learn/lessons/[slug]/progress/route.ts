import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const body = z.object({
  scrollDepth: z.number().min(0).max(1),
  markRead: z.boolean().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid body' }, { status: 400 })

  const lesson = await prisma.lesson.findFirst({ where: { slug: params.slug } })
  if (!lesson) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
  })

  const scrollDepth = Math.max(parsed.data.scrollDepth, existing?.scrollDepth ?? 0)
  const readAt = parsed.data.markRead || scrollDepth >= 0.9
    ? (existing?.readAt ?? new Date())
    : existing?.readAt ?? null

  const progress = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId: lesson.id } },
    create: { userId: session.user.id, lessonId: lesson.id, scrollDepth, readAt },
    update: { scrollDepth, readAt },
  })

  return NextResponse.json({ success: true, data: progress })
}
