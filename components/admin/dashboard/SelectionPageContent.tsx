'use client'

import { CheckCircle2, Heart, ImageIcon } from 'lucide-react'
import { CdnImage } from '@/components/CdnImage'
import { useMemo, useState } from 'react'
import { getMediaForProject, mockProjects } from '@/lib/mock-data/admin-dashboard'
import { Card } from '@/components/admin/ui/Card'

export function SelectionPageContent() {
  const project = mockProjects[0]
  const media = useMemo(() => getMediaForProject(project.id).slice(0, 18), [project.id])
  const [selected, setSelected] = useState<Set<string>>(() => new Set(media.filter((_, i) => i % 11 === 0).map((m) => m.id)))

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const finalize = () => {
    alert(`Seleção finalizada (simulado): ${selected.size} fotos.`)
  }

  return (
    <div className="space-y-6">
      <Card padding="md" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Preview · visão do cliente</p>
          <h2 className="mt-1 font-serif text-xl font-semibold text-zinc-50">Escolha suas fotos favoritas</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Projeto de exemplo: <span className="text-zinc-400">{project.name}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-center">
            <p className="text-2xl font-semibold text-warm-400">{selected.size}</p>
            <p className="text-xs text-zinc-500">selecionadas</p>
          </div>
          <button
            type="button"
            onClick={finalize}
            disabled={selected.size === 0}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Finalizar seleção
            </span>
          </button>
        </div>
      </Card>

      <p className="text-sm text-zinc-500">
        Toque nas imagens para selecionar. Este fluxo espelha o que o cliente vê na entrega — dados mockados.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {media.map((m) => {
          const isOn = selected.has(m.id)
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`group relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                isOn ? 'border-warm-500 ring-2 ring-warm-500/30' : 'border-transparent hover:border-zinc-700'
              }`}
            >
              <CdnImage src={m.thumbUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 50vw, 15vw" />
              <div
                className={`absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-2 transition ${
                  isOn ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <span className="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {isOn ? 'Selecionada' : 'Toque para selecionar'}
                </span>
                {isOn ? <Heart className="h-4 w-4 fill-warm-500 text-warm-500" /> : <ImageIcon className="h-4 w-4 text-white/80" />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
