/**
 * Força o download de um arquivo no navegador (mesma origem: atributo `download`;
 * URL absoluta externa: fetch → blob, quando possível).
 */
export async function downloadUrlInBrowser(url: string, filename: string): Promise<void> {
  const safeName =
    filename.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'arquivo'

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const isSameOrigin =
    url.startsWith('/') || (origin.length > 0 && (url.startsWith(origin) || url.startsWith(`${origin}/`)))

  if (isSameOrigin) {
    const a = document.createElement('a')
    a.href = url.startsWith('/') ? url : url
    a.download = safeName
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    return
  }

  try {
    const res = await fetch(url, { credentials: 'omit', mode: 'cors' })
    if (!res.ok) throw new Error('fetch failed')
    const blob = await res.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = safeName
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = safeName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }
}

/** Nome sugerido para o ZIP do projeto (apenas ASCII seguro para Content-Disposition). */
export function zipDownloadFilename(eventTitle: string): string {
  const base = eventTitle
    .trim()
    .replace(/[^\w\s.\-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${base || 'ensaio'}-fotos.zip`
}
