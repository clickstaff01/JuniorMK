import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Route protection is handled per-page via auth() in Server Components.
// NextAuth v5 beta Edge middleware is unstable — avoiding it.
export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
