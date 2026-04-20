import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { adminSessionOrResponse } from '@/lib/auth/admin-guard'
import { SETTING_KEYS, getAllSettings, type SettingKey } from '@/lib/settings'

export async function GET() {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!
  const settings = await getAllSettings()
  return NextResponse.json({ success: true, settings })
}

export async function PUT(req: NextRequest) {
  const { session, response } = await adminSessionOrResponse()
  if (!session) return response!

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const keys = SETTING_KEYS as readonly string[]
  const updates: { key: SettingKey; value: string | boolean }[] = []

  for (const k of Object.keys(body)) {
    if (!keys.includes(k)) continue
    const v = body[k]
    if (typeof v !== 'string' && typeof v !== 'boolean') continue
    updates.push({ key: k as SettingKey, value: v })
  }

  if (updates.length === 0) return NextResponse.json({ error: 'ไม่มีข้อมูลที่ถูกต้อง' }, { status: 400 })

  const before = await prisma.systemSetting.findMany({
    where: { key: { in: updates.map((u) => u.key) } },
  })
  const beforeMap = Object.fromEntries(before.map((r) => [r.key, r.value]))

  await prisma.$transaction(
    updates.map((u) =>
      prisma.systemSetting.upsert({
        where: { key: u.key },
        create: { key: u.key, value: u.value, updatedBy: session.user.id },
        update: { value: u.value, updatedBy: session.user.id },
      }),
    ),
  )

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'UPDATE',
      entity: 'SystemSetting',
      entityId: 'bulk',
      before: beforeMap,
      after: Object.fromEntries(updates.map((u) => [u.key, u.value])),
    },
  })

  return NextResponse.json({ success: true })
}
