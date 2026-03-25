'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { zipDownloadFilename } from '@/lib/download-in-browser'

type Phase = 'idle' | 'zipping' | 'downloading' | 'error'

type Props = {
  eventId: string
  eventTitle: string
  variant?: 'client' | 'admin'
  /** Galeria pública `/p/{slug}`: ZIP via rota do link compartilhado (respeita senha no cookie). */
  shareSlug?: string
}

const baseBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-80'

const variants = {
  client: `${baseBtn} w-full bg-white text-black hover:bg-zinc-200 active:scale-[0.99] disabled:hover:bg-white`,
  admin: `${baseBtn} w-full bg-warm-600 text-white shadow-lg shadow-warm-900/20 hover:bg-warm-500 disabled:hover:bg-warm-600 sm:w-auto`,
}

export function DownloadAllZipButton({ eventId, eventTitle, variant = 'client', shareSlug }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const busy = phase === 'zipping' || phase === 'downloading'

  async function handleClick() {
    if (busy) return
    setErrorMsg(null)
    setPhase('zipping')

    try {
      const url = shareSlug
        ? `/api/share/${encodeURIComponent(shareSlug)}/download-all`
        : `/api/events/${encodeURIComponent(eventId)}/download-all`
      const res = await fetch(url, {
        credentials: 'include',
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'Não foi possível gerar o arquivo.')
        setPhase('error')
        return
      }

      setPhase('downloading')
      const blob = await res.blob()
      const filename = zipDownloadFilename(eventTitle)
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
      setPhase('idle')
    } catch {
      setErrorMsg('Erro de rede. Verifique sua conexão e tente de novo.')
      setPhase('error')
    }
  }

  const idleLabel = variant === 'admin' ? 'Download em lote' : 'Baixar todas as fotos'
  let label = idleLabel
  if (phase === 'zipping') label = 'Zipando as fotos…'
  if (phase === 'downloading') label = 'Baixando…'

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={busy}
        aria-busy={busy}
        className={variants[variant]}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        ) : variant === 'admin' ? (
          <Download className="h-4 w-4 shrink-0" aria-hidden />
        ) : null}
        {label}
      </button>
      {busy ? (
        <p className="text-center text-[11px] leading-snug text-zinc-500">
          Fique nesta página até o download começar — isso pode levar um minuto em galerias grandes.
        </p>
      ) : null}
      {errorMsg ? (
        <p className="text-center text-xs text-red-400" role="alert">
          {errorMsg}
        </p>
      ) : null}
      {phase === 'error' ? (
        <button
          type="button"
          onClick={() => setPhase('idle')}
          className="w-full text-center text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-400 hover:underline"
        >
          Tentar de novo
        </button>
      ) : null}
    </div>
  )
}
