import { ImageResponse } from 'next/og'
import { OgTypographyCard, OG_SIZE } from '@/lib/og-templates'
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site-config'

export const runtime = 'edge'

export const alt = `Portfólio — ${SITE_NAME}`
export const size = OG_SIZE
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <OgTypographyCard title="Portfólio" subtitle={`${SITE_NAME} — ${SITE_TAGLINE}`} />,
    {
      ...OG_SIZE,
    }
  )
}
