import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import type { Role } from '@prisma/client'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/th/auth/sign-in',
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        try {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        // TODO: re-enable password/status checks later
        return { id: user.id, email: user.email, name: user.nameTh, role: user.role }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
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
})
