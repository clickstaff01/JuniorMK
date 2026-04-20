import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import type { Role } from '@prisma/client'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[auth] AUTH_SECRET is not set — sessions will be insecure in production')
}

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)

const allowedDomains = (process.env.AUTH_ALLOWED_DOMAINS ?? '')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean)

function emailDomain(email: string): string {
  const idx = email.lastIndexOf('@')
  return idx >= 0 ? email.slice(idx + 1) : ''
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/th/auth/sign-in',
    error: '/th/auth/sign-in',
  },
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const email = parsed.data.email.trim().toLowerCase()
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null
        if (user.status === 'DEACTIVATED') return null
        if (!user.passwordHash || user.passwordHash === 'auto') return null

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
        if (!ok) return null

        return { id: user.id, email: user.email, name: user.nameTh, role: user.role }
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') return true

      const email = user.email?.trim().toLowerCase()
      if (!email) return false

      const existing = await prisma.user.findUnique({ where: { email } })

      if (existing) {
        if (existing.status === 'DEACTIVATED') return false
        if (existing.status === 'INVITED') {
          await prisma.user.update({
            where: { id: existing.id },
            data: { status: 'ACTIVE' },
          })
        }
        return true
      }

      const domain = emailDomain(email)
      if (allowedDomains.length === 0 || !allowedDomains.includes(domain)) {
        return false
      }

      const displayName =
        (profile?.name as string | undefined) ?? user.name ?? email.split('@')[0]

      const created = await prisma.user.create({
        data: {
          email,
          nameTh: displayName,
          nameEn: displayName,
          role: 'STAFF',
          status: 'ACTIVE',
          passwordHash: null,
        },
      })

      await prisma.auditLog.create({
        data: {
          actorId: created.id,
          action: 'CREATE',
          entity: 'User',
          entityId: created.id,
          after: {
            email: created.email,
            role: created.role,
            status: created.status,
            source: 'google-auto-provision',
          },
        },
      })

      return true
    },
    async jwt({ token, user, account }) {
      if (user && account?.provider === 'credentials') {
        token.id = user.id!
        token.role = (user as { id: string; role: Role }).role
        return token
      }

      if (account?.provider === 'google' && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.trim().toLowerCase() },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
          token.name = dbUser.nameTh
        }
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
