'use client'

import { Download, Loader2, X, AlertCircle } from 'lucide-react'
import { useState, useCallback, useEffect } from 'react'
import { downloadUrlInBrowser } from '@/lib/download-in-browser'
import { type GalleryMedia } from '@/lib/gallery-media'

type Phase = 'idle' | 'preparing' | 'downloading' | 'error' | 'instruction'

type Props = {
  eventId: string
  eventTitle: string
  variant?: 'client' | 'admin'
  /** Galeria pública `/p/{slug}`: ZIP via rota do link compartilhado (respeita senha no cookie). */
  shareSlug?: string
  allMedia?: GalleryMedia[]
}

const baseBtn =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-80'

const variants = {
  client: `${baseBtn} w-full bg-white text-black hover:bg-zinc-200 active:scale-[0.99] disabled:hover:bg-white`,
  admin: `${baseBtn} w-full bg-warm-600 text-white shadow-lg shadow-warm-900/20 hover:bg-warm-500 disabled:hover:bg-warm-600 sm:w-auto`,
}

export function DownloadAllZipButton({
  eventTitle,
  variant = 'client',
  allMedia = [],
}: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  const busy = phase === 'preparing' || phase === 'downloading'

  const startIndividualDownloads = useCallback(async () => {
    if (!allMedia.length) {
      setErrorMsg('Nenhuma foto encontrada para baixar.')
      return
    }

    setPhase('downloading')
    setProgress({ current: 0, total: allMedia.length })

    for (let i = 0; i < allMedia.length; i++) {
      const media = allMedia[i]
      setProgress((p) => ({ ...p, current: i + 1 }))
      
      // Delay de 600ms para não engasgar o navegador e dar tempo do popup de permissão aparecer
      await new Promise((resolve) => setTimeout(resolve, 600))
      
      try {
        await downloadUrlInBrowser(media.downloadUrl, media.name)
      } catch (err) {
        console.error(`Falha no download de ${media.name}`, err)
      }
    }

    setPhase('idle')
  }, [allMedia])

  const handleClick = async () => {
    if (busy) return
    setErrorMsg(null)

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const hasShownInstructions = typeof window !== 'undefined' && localStorage.getItem('download_instructions_shown')

    if (isMobile && !hasShownInstructions) {
      setPhase('instruction')
      return
    }

    await startIndividualDownloads()
  }

  const handleConfirmInstructions = () => {
    localStorage.setItem('download_instructions_shown', 'true')
    void startIndividualDownloads()
  }

  const idleLabel = variant === 'admin' ? 'Download em lote' : 'Baixar todas as fotos'
  let label = idleLabel
  if (phase === 'preparing') label = 'Preparando fotos…'
  if (phase === 'downloading') label = `Baixando ${progress.current}/${progress.total}…`

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

      {phase === 'downloading' && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out" 
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        </div>
      )}

      {busy ? (
        <div className="flex flex-col items-center gap-1 py-1">
          <p className="text-center text-xs font-medium text-white/90 animate-pulse">
            Fazendo o download, aguarde com a página aberta…
          </p>
          <p className="text-center text-[10px] leading-snug text-zinc-500">
            Os arquivos serão baixados um após o outro.
          </p>
        </div>
      ) : null}

      {errorMsg ? (
        <p className="text-center text-xs text-red-400" role="alert">
          {errorMsg}
        </p>
      ) : null}

      {phase === 'instruction' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <button 
                onClick={() => setPhase('idle')}
                className="rounded-full p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">Baixar todas as fotos</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Para baixar todas as fotos automaticamente no mobile, seu navegador pode pedir uma permissão.
            </p>
            
            <div className="mt-4 space-y-3 rounded-xl bg-zinc-900/50 p-4 text-xs text-zinc-300">
              <p className="font-medium text-white">Como permitir:</p>
              <ul className="list-disc space-y-1.5 pl-4">
                <li>Clique em "Permitir" quando o navegador perguntar se deseja baixar múltiplos arquivos.</li>
                <li>Se nada acontecer, verifique o ícone de bloqueio na barra de endereços e selecione "Sempre permitir".</li>
              </ul>
            </div>

            <button
              onClick={handleConfirmInstructions}
              className="mt-6 w-full rounded-xl bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200"
            >
              Entendi, iniciar download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
