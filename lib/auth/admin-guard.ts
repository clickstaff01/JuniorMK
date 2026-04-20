import { NextResponse } from 'next/server'
import { requireRole } from './guards'

export async function adminSessionOrResponse() {
  try {
    const session = await requireRole(['ADMIN'])
    return { session, response: null as null | NextResponse }
  } catch {
    return { session: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
}
