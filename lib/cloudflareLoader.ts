/**
 * Cloudflare Image Resizing loader para `next/image`.
 *
 * Constrói URLs `/cdn-cgi/image/…` no custom domain do bucket R2,
 * fazendo o redimensionamento e a conversão de formato no edge da Cloudflare.
 * Isso elimina completamente o tráfego de imagens pela Vercel.
 *
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url/
 */

/** Domínio(s) CDN que aceitam Image Resizing.  Inferido de `R2_PUBLIC_BASE_URL` no build. */
const CDN_ORIGIN = (() => {
  const raw = process.env.NEXT_PUBLIC_CDN_ORIGIN ?? process.env.R2_PUBLIC_BASE_URL ?? ''
  if (!raw) return ''
  try {
    const u = new URL(raw.trim())
    return u.origin // ex.: "https://cdn.alinefratoni.com.br"
  } catch {
    return ''
  }
})()

/** Verifica se `src` é uma URL do CDN Cloudflare configurado. */
export function isCdnUrl(src: string): boolean {
  if (!CDN_ORIGIN || !src) return false
  try {
    if (src.startsWith(CDN_ORIGIN)) return true
    // Aceita também URLs que já tenham /cdn-cgi/image/ do mesmo host
    const u = new URL(src)
    return u.origin === CDN_ORIGIN
  } catch {
    return false
  }
}

/** Verifica se a URL é uma rota interna da app (`/api/…`). */
export function isAppProxyUrl(src: string): boolean {
  return src.startsWith('/api/')
}

type ImageLoaderParams = {
  src: string
  width: number
  quality?: number
}

/**
 * Loader que usa Cloudflare Image Resizing (`/cdn-cgi/image/…`).
 *
 * Para URLs que já apontam para o CDN, constrói:
 *   `https://cdn.alinefratoni.com.br/cdn-cgi/image/width=800,quality=75,format=auto,fit=scale-down/<path>`
 *
 * Para URLs não-CDN, retorna o `src` inalterado (não tenta resize).
 */
export function cloudflareLoader({ src, width, quality }: ImageLoaderParams): string {
  // URLs locais / proxy → não mexe
  if (!src || src.startsWith('/') || src.startsWith('data:')) return src

  // URL já é CDN — aplicar resize via /cdn-cgi/image/
  if (isCdnUrl(src)) {
    const q = quality ?? 75
    const params = `width=${width},quality=${q},format=auto,fit=scale-down`
    // Extrair o pathname da URL original
    try {
      const u = new URL(src)
      // /cdn-cgi/image/<params>/<path-original>
      return `${CDN_ORIGIN}/cdn-cgi/image/${params}${u.pathname}`
    } catch {
      return src
    }
  }

  // URL externa (unsplash, placeholders, etc.) → sem resize, servir direto
  return src
}

/**
 * Para contextos onde precisamos da URL CDN limpa (sem resize),
 * ex.: download direto, `<video src>`.
 */
export function getCdnOrigin(): string {
  return CDN_ORIGIN
}
