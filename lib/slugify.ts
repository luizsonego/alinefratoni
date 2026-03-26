/** Gera slug estável para URL / filtro (PT-BR simplificado). */
export function slugifyTitle(title: string): string {
  const base = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return base.length > 0 ? base : 'categoria'
}

export function uniqueSlugs(titles: string[]): string[] {
  const used = new Map<string, number>()
  return titles.map((t) => {
    let s = slugifyTitle(t)
    const n = used.get(s) ?? 0
    used.set(s, n + 1)
    if (n > 0) s = `${s}-${n + 1}`
    return s
  })
}
