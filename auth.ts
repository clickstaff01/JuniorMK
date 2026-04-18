import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { authConfig } from './auth.config'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })

        if (!user || !user.passwordHash) return null
        if (user.lockedUntil && user.lockedUntil > new Date()) return null
        if (user.status === 'DEACTIVATED') return null
        if (user.status === 'INVITED') return null

        const valid = await bcrypt.compare(password, user.passwordHash)

        if (!valid) {
          const newCount = user.failedLoginCount + 1
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginCount: newCount,
              ...(newCount >= 5
                ? { lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }
                : {}),
            },
          })
          return null
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginCount: 0, lockedUntil: null },
        })

        return { id: user.id, email: user.email, name: user.nameTh, role: user.role }
      },
    }),
  ],
})
