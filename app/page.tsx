import { prisma } from '@/lib/db/prisma'

export default async function RootPage() {
  let dbStatus = 'not checked'
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    dbStatus = 'unavailable'
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Click Broker Learning</h1>
      <p>ระบบเรียนรู้ภายในของ Click Insurance Broker</p>
      <p>DB: {dbStatus}</p>
    </main>
  )
}
