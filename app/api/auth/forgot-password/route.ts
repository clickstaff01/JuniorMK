import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import crypto from 'crypto'

const body = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  const parsed = body.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ success: false, error: 'Invalid' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24)

    await prisma.invitation.create({
      data: { userId: user.id, token, expiresAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/th/auth/set-password?token=${token}`
    // eslint-disable-next-line no-console
    console.log(`[password-reset] Reset URL for ${user.email}: ${resetUrl}`)
  }

  return NextResponse.json({ success: true })
}
