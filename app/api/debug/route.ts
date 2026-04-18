export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    DATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? '(not set)',
    NODE_ENV: process.env.NODE_ENV,
  })
}
