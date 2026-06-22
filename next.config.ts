import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Disable Turbopack — Sanity Studio v3 is not compatible with it
  experimental: {
    turbo: undefined,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig