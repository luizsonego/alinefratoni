/** @type {import('next').NextConfig} */
function r2RemoteImagePatterns() {
  const base = process.env.R2_PUBLIC_BASE_URL
  if (!base || typeof base !== 'string') return []
  try {
    const u = new URL(base.trim())
    const protocol = u.protocol === 'https:' ? 'https' : u.protocol === 'http:' ? 'http' : 'https'
    return [{ protocol, hostname: u.hostname }]
  } catch {
    return []
  }
}

const nextConfig = {
  // Expor a origem do CDN para o client-side (cloudflareLoader / CdnImage)
  env: {
    NEXT_PUBLIC_CDN_ORIGIN: process.env.R2_PUBLIC_BASE_URL ?? '',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      // R2 Public Development URL (pub-*.r2.dev) — fallback se R2_PUBLIC_BASE_URL não estiver no build
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'cdn.alinefratoni.com.br', pathname: '/site/public/**', },
      ...r2RemoteImagePatterns(),
    ],
  },
}

module.exports = nextConfig
