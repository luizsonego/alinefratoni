/** URL canônica do site (produção). Sobrescreva com NEXT_PUBLIC_SITE_URL no deploy. */
export const DEFAULT_SITE_URL = 'https://alinefratoni.com.br'

export const SITE_NAME = 'Aline Fratoni Fotografia'

export const SITE_TAGLINE = 'Fotografia editorial e de família em Maringá'

export const DEFAULT_DESCRIPTION =
  'A fotografia é a minha forma de contar histórias. Entre luz natural, cenários e emoções reais, registro momentos únicos em estúdio, ao ar livre e em eventos especiais.'

export const SEO_KEYWORDS = [
  'fotografia Maringá',
  'ensaio fotográfico',
  'fotografia de família',
  'fotografia gestante',
  'newborn',
  'fotografia editorial',
  'ensaio fine art',
  'fotógrafa Maringá',
  'Aline Fratoni',
]

/**
 * URL canónica do site. Valida `NEXT_PUBLIC_SITE_URL`: valor inválido quebraria
 * `metadataBase: new URL(...)` no layout e derrubava todo o site em produção.
 */
export function getSiteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL
  if (typeof env !== 'string' || !env.trim()) {
    return DEFAULT_SITE_URL
  }
  const raw = env.trim().replace(/\/$/, '')
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    const u = new URL(href)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return DEFAULT_SITE_URL
    }
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')
    return `${u.origin}${path}`
  } catch {
    return DEFAULT_SITE_URL
  }
}
