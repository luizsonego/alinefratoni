/** Limite máximo de fotos no portfólio (servidor + cliente). Ajuste via `PORTFOLIO_MAX_ITEMS` no ambiente (1–500). */
function readMaxPortfolioItems(): number {
  const raw = typeof process !== 'undefined' ? process.env.PORTFOLIO_MAX_ITEMS : undefined
  if (raw == null || raw === '') return 100
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return 100
  return Math.min(500, n)
}

export const MAX_PORTFOLIO_ITEMS = readMaxPortfolioItems()
export const MAX_PORTFOLIO_CATEGORIES = 24
export const SITE_CONTENT_ID = 'default' as const
