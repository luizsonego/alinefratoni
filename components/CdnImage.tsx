'use client'

import Image, { type ImageProps } from 'next/image'
import { cloudflareLoader, isCdnUrl, isAppProxyUrl } from '@/lib/cloudflareLoader'

type CdnImageProps = Omit<ImageProps, 'src' | 'loader'> & {
  src: string
}

/**
 * Componente de imagem que roteia automaticamente para a Cloudflare CDN.
 *
 * **Comportamento por tipo de URL:**
 *
 * | URL                          | Loader           | unoptimized |
 * |------------------------------|------------------|-------------|
 * | CDN (`cdn.alinefratoni.…`)   | cloudflareLoader | true*       |
 * | Proxy local (`/api/…`)       | —                | true        |
 * | Externa (unsplash, etc.)     | —                | true        |
 * | Relativa (`/images/…`)       | next/image       | false       |
 *
 * (*) `unoptimized=true` desativa o `/_next/image` da Vercel;
 *      o resize é feito pelo Cloudflare Image Resizing via `/cdn-cgi/image/`.
 *
 * Mantém todas as features do `next/image`:
 * - Lazy loading (`loading="lazy"`)
 * - Layout shift prevention (`fill` / `width+height`)
 * - `priority` para LCP
 * - `sizes` para srcset hints
 * - `placeholder="blur"` + `blurDataURL`
 */
export function CdnImage({ src, unoptimized, ...rest }: CdnImageProps) {
  const isCdn = isCdnUrl(src)
  const isProxy = isAppProxyUrl(src)
  const isExternal = src.startsWith('http') && !isCdn

  // CDN → bypass Vercel optimizer, usar cloudflareLoader para resize no edge
  if (isCdn) {
    return (
      <Image
        src={src}
        loader={cloudflareLoader}
        unoptimized
        {...rest}
      />
    )
  }

  // Proxy local ou URL externa → bypass Vercel optimizer, sem resize
  if (isProxy || isExternal) {
    return (
      <Image
        src={src}
        unoptimized={unoptimized ?? true}
        {...rest}
      />
    )
  }

  // Assets locais (public/) → manter next/image padrão (otimização local)
  return (
    <Image
      src={src}
      unoptimized={unoptimized}
      {...rest}
    />
  )
}
