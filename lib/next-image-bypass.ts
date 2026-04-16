/**
 * O otimizador do `next/image` (e o Image CDN da Vercel) busca a URL no servidor
 * **sem** cookies do browser. Rotas `/api/*` protegidas retornam 401 JSON → erro
 * `INVALID_IMAGE_OPTIMIZE_REQUEST` (resposta não é `image/*`).
 */
export function isNextImageOptimizerIncompatibleUrl(src: string): boolean {
  return src.startsWith('/api/') || src.includes('/api/site/asset')
}

/**
 * Painel admin: além de proxies `/api`, mantém o comportamento de não otimizar
 * URLs absolutas (`http...`) usado em capas e listagens.
 */
export function adminGalleryImageUnoptimized(src: string): boolean {
  return isNextImageOptimizerIncompatibleUrl(src) || src.startsWith('http')
}
