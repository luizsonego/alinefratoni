'use client'

import { CdnImage } from '@/components/CdnImage'
import type { ImageProps } from 'next/image'

type Props = Omit<ImageProps, 'src'> & { src: string }

/**
 * @deprecated Use `CdnImage` diretamente. Este componente é mantido para backward compatibility.
 *
 * O `CdnImage` absorveu toda a lógica de detecção de URLs incompatíveis com o
 * otimizador do `next/image` e adiciona roteamento automático para Cloudflare CDN.
 */
export function PortfolioImage({ src, ...rest }: Props) {
  return <CdnImage src={src} {...rest} />
}
