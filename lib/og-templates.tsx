import type { ReactElement } from 'react'

/** Tamanho recomendado para WhatsApp, Facebook, LinkedIn, X */
export const OG_SIZE = { width: 1200, height: 630 } as const

const ink = '#1A1A1A'
const accent = '#C4A77D'
const muted = '#4a4a4a'

type TypographyCardProps = {
  /** Linha pequena acima do título, ex.: PORTFÓLIO */
  eyebrow?: string
  title: string
  subtitle: string
}

/** Card só tipografia — home, portfólio ou fallback de galeria */
export function OgTypographyCard({ eyebrow, title, subtitle }: TypographyCardProps): ReactElement {
  const { width: W, height: H } = OG_SIZE
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(152deg, #F9F9F9 0%, #efe8dc 42%, #F9F9F9 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 40,
          border: `2px solid ${accent}`,
          borderRadius: 3,
          opacity: 0.95,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 96px',
          textAlign: 'center',
          maxWidth: 980,
        }}
      >
        {eyebrow ? (
          <span
            style={{
              fontSize: 17,
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: accent,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              marginBottom: 28,
              fontWeight: 500,
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <div style={{ width: 100, height: 2, backgroundColor: accent, marginBottom: 36 }} />
        <div
          style={{
            fontSize: title.length > 28 ? 56 : 68,
            fontWeight: 600,
            color: ink,
            fontFamily: 'Georgia, "Times New Roman", "Liberation Serif", serif',
            lineHeight: 1.12,
            marginBottom: 24,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: muted,
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            lineHeight: 1.45,
            maxWidth: 780,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>
  )
}

type GalleryHeroProps = {
  title: string
  brandLine: string
  /** data URL ou URL absoluta */
  coverSrc: string
}

/** Foto em destaque + título — compartilhamento de galeria */
export function OgGalleryHero({ title, brandLine, coverSrc }: GalleryHeroProps): ReactElement {
  const { width: W, height: H } = OG_SIZE
  return (
    <div
      style={{
        width: W,
        height: H,
        display: 'flex',
        position: 'relative',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- render estático para OG/Satori */}
      <img alt="" src={coverSrc} width={W} height={H} style={{ objectFit: 'cover', width: W, height: H }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.45) 38%, rgba(26,26,26,0.08) 62%, transparent 85%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '52px 56px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 72,
            height: 3,
            backgroundColor: accent,
            marginBottom: 28,
          }}
        />
        <div
          style={{
            fontSize: title.length > 42 ? 44 : 54,
            fontWeight: 600,
            color: '#ffffff',
            fontFamily: 'Georgia, "Times New Roman", serif',
            lineHeight: 1.12,
            textShadow: '0 4px 32px rgba(0,0,0,0.5)',
            marginBottom: 16,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 21,
            color: 'rgba(255,255,255,0.88)',
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            letterSpacing: '0.06em',
            fontWeight: 400,
          }}
        >
          {brandLine}
        </div>
      </div>
    </div>
  )
}
