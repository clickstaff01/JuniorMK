import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

async function main() {
  const passwordHash = await bcrypt.hash('Admin@2026!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@clickbroker.co.th' },
    update: {},
    create: {
      email: 'admin@clickbroker.co.th',
      nameTh: 'ผู้ดูแลระบบ',
      nameEn: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log(`✅ Admin user: ${admin.email}`)
  console.log(`   Password: Admin@2026!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
