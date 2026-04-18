import { auth } from '@/auth'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/', '/th/auth', '/en/auth', '/api/auth', '/api/health']

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (!isPublic && !req.auth) {
    const signIn = new URL('/th/auth/sign-in', req.url)
    signIn.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signIn)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
