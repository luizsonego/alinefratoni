import { getR2PublicUrlForObjectKey, isSitePublicAssetObjectKey } from '@/lib/r2'

/** URLs que apontam para o host da API S3 do R2 falham em GET anónimo (400). Redireciona para o proxy da app. */
function rewriteR2S3ApiHostToAssetProxyUrl(url: string): string {
  const t = url.trim()
  if (!t.startsWith('http')) return t
  try {
    const u = new URL(t)
    const host = u.hostname.toLowerCase()
    if (host !== 'r2.cloudflarestorage.com' && !host.endsWith('.r2.cloudflarestorage.com')) {
      return t
    }
    const segments = u.pathname.split('/').filter(Boolean)
    for (let i = 0; i < segments.length; i++) {
      const candidate = segments.slice(i).join('/')
      if (isSitePublicAssetObjectKey(candidate)) {
        const token = Buffer.from(candidate, 'utf8').toString('base64url')
        return `/api/site/asset/t/${token}`
      }
    }
    return t
  } catch {
    return t
  }
}

/** Converte URLs antigas `?key=` para `/t/token` (compatível com o otimizador de imagens). */
export function normalizeLegacySiteAssetUrl(url: string): string {
  let t = url.trim()
  if (!t) return t
  t = rewriteR2S3ApiHostToAssetProxyUrl(t)
  if (t.includes('/api/site/asset/t/')) return t
  if (!t.includes('/api/site/asset')) return t
  try {
    const u = new URL(t, 'https://example.org')
    if (!u.pathname.endsWith('/api/site/asset')) return t
    const key = u.searchParams.get('key')?.trim()
    if (!key) return t
    const decoded = (() => {
      try {
        return decodeURIComponent(key)
      } catch {
        return key
      }
    })()
    if (!isSitePublicAssetObjectKey(decoded)) return t
    const token = Buffer.from(decoded, 'utf8').toString('base64url')
    return `/api/site/asset/t/${token}`
  } catch {
    return t
  }
}

/** URL a gravar no site: CDN se existir; senão rota pública estável (token), sem query string para o `next/image`. */
export function buildPortfolioImageRefFromObjectKey(objectKey: string): string {
  const cdn = getR2PublicUrlForObjectKey(objectKey).trim()
  if (cdn) return cdn
  const token = Buffer.from(objectKey, 'utf8').toString('base64url')
  return `/api/site/asset/t/${token}`
}

export function resolveObjectKeyFromSiteAssetToken(token: string): string | null {
  try {
    const t = token.trim()
    if (!t) return null
    const objectKey = Buffer.from(t, 'base64url').toString('utf8')
    if (!objectKey || !isSitePublicAssetObjectKey(objectKey)) return null
    return objectKey
  } catch {
    return null
  }
}
