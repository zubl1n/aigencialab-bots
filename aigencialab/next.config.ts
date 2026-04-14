import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff'        },
          { key: 'X-Frame-Options',           value: 'DENY'           },
          { key: 'X-XSS-Protection',          value: '1; mode=block'  },
          { key: 'Referrer-Policy',           value: 'strict-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/api/whatsapp/webhook',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
  trailingSlash: false,
  async redirects() {
    return [
      // Bug 7 fix: removed /admin → /dashboard redirect so /admin is reachable directly
      { source: '/panel',     destination: '/dashboard', permanent: false },
      { source: '/auditoria', destination: '/audit',     permanent: false },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
    ]
  },
}

export default nextConfig
