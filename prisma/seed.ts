/**
 * Seed script — Phase 1 will populate this with real content.
 * Run: pnpm db:seed
 */
import { prisma } from '@/lib/db/prisma'

async function main() {
  console.log('Seed will be implemented in Phase 1.')
  console.log('Content, assignments, and rubrics will be loaded from:')
  console.log('  seed/content.json')
  console.log('  seed/assignments.json')
  console.log('  seed/rubrics.json')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
