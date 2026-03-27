import { ImageResponse } from 'next/og'
import { Buffer } from 'node:buffer'
import { OgGalleryHero, OgTypographyCard, OG_SIZE } from '@/lib/og-templates'
import { SITE_NAME } from '@/lib/site-config'
import { getShareLinkForPublicView, isShareLinkExpired } from '@/lib/share-links'

export const runtime = 'nodejs'

export const alt = `Galeria — ${SITE_NAME}`
export const size = OG_SIZE
export const contentType = 'image/png'

async function fetchCoverAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const ct = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
    if (!ct.startsWith('image/')) return null
    const b64 = Buffer.from(buf).toString('base64')
    return `data:${ct};base64,${b64}`
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const slug = params.slug?.trim()
  const fallback = (
    <OgTypographyCard title={SITE_NAME} subtitle="Fotografia editorial e de família em Maringá" />
  )

  if (!slug) {
    return new ImageResponse(fallback, { ...OG_SIZE })
  }

  const share = await getShareLinkForPublicView(slug)
  if (!share || isShareLinkExpired(share)) {
    return new ImageResponse(fallback, { ...OG_SIZE })
  }

  const title = share.event.title
  const coverUrl = share.event.coverUrl?.trim()
  const coverSrc = coverUrl ? await fetchCoverAsDataUrl(coverUrl) : null

  const element = coverSrc ? (
    <OgGalleryHero title={title} brandLine={SITE_NAME} coverSrc={coverSrc || 'https://alinefratoni.com.br/_next/image?url=https%3A%2F%2Fik.imagekit.io%2F500milhas%2Falinefoto_wKOHM6fRlR.jpg&w=750&q=75'} />
  ) : (
    <OgTypographyCard title={title} subtitle={SITE_NAME} />
  )

  return new ImageResponse(element, { ...OG_SIZE })
}
