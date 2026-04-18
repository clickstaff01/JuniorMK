import type { NextAuthConfig } from 'next-auth'
import type { Role } from '@prisma/client'

const PUBLIC_PATHS = ['/', '/th/auth', '/en/auth', '/api/auth', '/api/health']

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/th/auth/sign-in',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isPublic = PUBLIC_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
      )
      if (isPublic) return true
      return !!auth
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = (user as { id: string; role: Role }).role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as Role
      return session
    },
  },
}
