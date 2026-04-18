import { auth } from '@/auth'
import type { Role } from '@prisma/client'

export class UnauthorizedError extends Error {
  constructor() { super('Unauthorized') }
}

export class ForbiddenError extends Error {
  constructor() { super('Forbidden') }
}

export async function requireRole(allowed: Role[]) {
  const session = await auth()
  if (!session) throw new UnauthorizedError()
  if (!allowed.includes(session.user.role)) throw new ForbiddenError()
  return session
}

export async function requireAuth() {
  const session = await auth()
  if (!session) throw new UnauthorizedError()
  return session
}
