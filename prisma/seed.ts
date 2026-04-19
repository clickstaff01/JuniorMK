import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

async function main() {
  const passwordHash = await bcrypt.hash('123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log(`✅ Seed complete: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
