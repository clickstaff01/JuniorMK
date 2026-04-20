import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
/* eslint-disable no-console */
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
          console.log('[auth] authorize called with:', JSON.stringify(credentials))
          const parsed = credentialsSchema.safeParse(credentials)
          if (!parsed.success) {
            console.log('[auth] zod parse failed:', parsed.error.flatten())
            return null
          }

          const email = parsed.data.email.trim().toLowerCase()
          console.log('[auth] looking up user:', email)
          let user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            console.log('[auth] auto-creating user:', email)
            user = await prisma.user.create({
              data: {
                email,
                nameTh: email.split('@')[0],
                nameEn: email.split('@')[0],
                role: 'ADMIN',
                status: 'ACTIVE',
                passwordHash: 'auto',
              },
            })
          }

          console.log('[auth] login success:', user.email, user.role)
          return { id: user.id, email: user.email, name: user.nameTh, role: user.role }
        } catch (err) {
          console.error('[auth] authorize threw error:', err)
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
