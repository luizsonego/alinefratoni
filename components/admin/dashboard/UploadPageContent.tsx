'use client'

import { CheckCircle2, Loader2, UploadCloud } from 'lucide-react'
import { useCallback, useState } from 'react'
import type { MockUploadItem, UploadQueueStatus } from '@/lib/mock-data/admin-dashboard'
import { Card } from '@/components/admin/ui/Card'
import { Skeleton } from '@/components/admin/ui/Skeleton'

const demoQueue: MockUploadItem[] = [
  { id: 'q1', name: 'cerimonia_001.jpg', progress: 100, status: 'done', previewUrl: 'https://picsum.photos/seed/q1/80/80' },
  { id: 'q2', name: 'festa_highlight.mp4', progress: 72, status: 'uploading' },
  { id: 'q3', name: 'export_lightroom.zip', progress: 40, status: 'processing' },
]

export function UploadPageContent() {
  const [drag, setDrag] = useState(false)
  const [queue, setQueue] = useState(demoQueue)
  const [simBusy, setSimBusy] = useState(false)

  const addMockFiles = useCallback(() => {
    setSimBusy(true)
    const id = `mock-${Date.now()}`
    const item: MockUploadItem = {
      id,
      name: `novo_arquivo_${Math.floor(Math.random() * 900 + 100)}.jpg`,
      progress: 0,
      status: 'uploading',
    }
    setQueue((q) => [item, ...q])

    let p = 0
    const t = setInterval(() => {
      p += 12
      setQueue((prev) =>
        prev.map((x) =>
          x.id === id
            ? {
                ...x,
                progress: Math.min(p, 100),
                status: (p >= 100 ? 'processing' : 'uploading') as UploadQueueStatus,
              }
            : x
        )
      )
      if (p >= 100) {
        clearInterval(t)
        setTimeout(() => {
          setQueue((prev) =>
            prev.map((x) =>
              x.id === id ? { ...x, status: 'done' as const, progress: 100, previewUrl: 'https://picsum.photos/seed/n1/80/80' } : x
            )
          )
          setSimBusy(false)
        }, 800)
      }
    }, 200)
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          addMockFiles()
        }}
      >
        <Card
          padding="none"
          className={`overflow-hidden border-2 border-dashed transition ${
            drag ? 'border-warm-500/60 bg-warm-950/15' : 'border-zinc-700'
          }`}
        >
          <div className="flex flex-col items-center px-6 py-16 sm:py-20">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-warm-500 shadow-inner">
              <UploadCloud className="h-8 w-8" strokeWidth={1.25} />
            </div>
            <h2 className="font-serif text-xl font-semibold text-zinc-50">Enviar mídia</h2>
            <p className="mt-2 max-w-md text-center text-sm text-zinc-500">
              Arraste fotos e vídeos para esta área. A fila abaixo simula progresso por arquivo.
            </p>
            <button
              type="button"
              disabled={simBusy}
              onClick={addMockFiles}
              className="mt-8 rounded-xl bg-warm-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-warm-900/30 transition hover:bg-warm-500 disabled:opacity-60"
            >
              {simBusy ? 'Simulando envio…' : 'Simular upload'}
            </button>
          </div>
        </Card>
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold text-zinc-100">Fila de upload</h3>
        <p className="text-sm text-zinc-500">Enviando · processando · concluído (mock)</p>
        <ul className="mt-4 space-y-3">
          {queue.map((item) => (
            <li key={item.id}>
              <Card padding="sm" className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
                <div
                  className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-800"
                  style={
                    item.previewUrl
                      ? { backgroundImage: `url(${item.previewUrl})`, backgroundSize: 'cover' }
                      : undefined
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-zinc-200">{item.name}</p>
                    {item.status === 'done' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : item.status === 'processing' ? (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-400" />
                    ) : (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-warm-500" />
                    )}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.status === 'done'
                          ? 'w-full bg-emerald-500'
                          : item.status === 'processing'
                            ? `${item.progress >= 100 ? 'w-full' : 'w-1/2'} bg-amber-500`
                            : `bg-warm-500`
                      }`}
                      style={
                        item.status === 'uploading' ? { width: `${item.progress}%` } : undefined
                      }
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-zinc-600">
                    {item.status === 'uploading' && 'Enviando…'}
                    {item.status === 'processing' && 'Processando…'}
                    {item.status === 'done' && 'Concluído · preview disponível'}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </div>

      <Card padding="lg">
        <p className="text-sm font-medium text-zinc-300">Skeleton (loading)</p>
        <p className="mt-1 text-xs text-zinc-600">Exemplo de estado de carregamento para listas</p>
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 max-w-xs" />
            <Skeleton className="h-3 w-full max-w-sm" />
            <Skeleton className="h-2 w-full max-w-md" />
          </div>
        </div>
      </Card>
    </div>
  )
}
