'use client'

import Image, { type ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src'> & { src: string }

/**
 * O otimizador do `next/image` costuma falhar com URLs locais `/api/...` (proxy R2).
 * Desliga a otimização nesses casos para a miniatura aparecer sempre.
 */
export function PortfolioImage({ src, unoptimized, ...rest }: Props) {
  const useOriginal =
    unoptimized ?? (typeof src === 'string' && (src.startsWith('/api/') || src.includes('/api/site/asset')))
  return <Image src={src} unoptimized={useOriginal} {...rest} />
}
