import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma before importing the route handler
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}))

describe('GET /api/health', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ok:true and db:up when database is reachable', async () => {
    const { prisma } = await import('@/lib/db/prisma')
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }])

    const { GET } = await import('@/app/api/health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.ok).toBe(true)
    expect(body.db).toBe('up')
    expect(body).toHaveProperty('version')
  })

  it('returns 503 and db:down when database is unreachable', async () => {
    const { prisma } = await import('@/lib/db/prisma')
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection refused'))

    const { GET } = await import('@/app/api/health/route')
    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.ok).toBe(false)
    expect(body.db).toBe('down')
  })
})
