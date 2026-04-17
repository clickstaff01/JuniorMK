import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // Disallow any during build — matches TypeScript strict mode
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },

  images: {
    remotePatterns: [
      // UploadThing CDN
      { protocol: 'https', hostname: 'utfs.io' },
    ],
  },
}

export default withNextIntl(nextConfig)
