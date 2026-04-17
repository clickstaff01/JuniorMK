import { getLocale } from 'next-intl/server'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let locale = 'th'
  try {
    locale = await getLocale()
  } catch {
    // no locale context on root redirect path — use default
  }
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
