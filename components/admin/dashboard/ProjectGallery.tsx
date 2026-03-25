'use client'

import {
  CheckSquare,
  Download,
  Heart,
  Image as ImageIcon,
  Link2,
  Loader2,
  Square,
  Trash2,
  Video,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { DownloadAllZipButton } from '@/components/DownloadAllZipButton'
import type { AdminGalleryMediaItem } from '@/lib/admin-projects'
import { downloadUrlInBrowser } from '@/lib/download-in-browser'
import { Card } from '@/components/admin/ui/Card'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { Modal } from '@/components/admin/ui/Modal'
import { Tooltip } from '@/components/admin/ui/Tooltip'

type FilterKey = 'all' | 'photo' | 'video' | 'favorite' | 'client'

const filters: { id: FilterKey; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'photo', label: 'Fotos' },
  { id: 'video', label: 'Vídeos' },
  { id: 'favorite', label: 'Favoritos' },
  { id: 'client', label: 'Selecionadas (cliente)' },
]

export type ProjectGalleryProject = {
  id: string
  title: string
  clientName: string
  photoCount: number
  videoCount: number
}

type ProjectGalleryProps = {
  project: ProjectGalleryProject
  initialMedia: AdminGalleryMediaItem[]
}

type DisplayItem = AdminGalleryMediaItem & {
  favorite: boolean
  clientSelected: boolean
}

export function ProjectGallery({ project, initialMedia }: ProjectGalleryProps) {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modalId, setModalId] = useState<string | null>(null)
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    setFavoriteIds(new Set())
    setSelected(new Set())
    setModalId(null)
  }, [project.id])

  const merged = useMemo(() => {
    return initialMedia.map((m) => ({
      ...m,
      favorite: favoriteIds.has(m.id),
      clientSelected: false,
    }))
  }, [initialMedia, favoriteIds])

  const visible = useMemo(() => {
    return merged.filter((m) => {
      if (filter === 'photo') return m.kind === 'photo'
      if (filter === 'video') return m.kind === 'video'
      if (filter === 'favorite') return m.favorite
      if (filter === 'client') return m.clientSelected
      return true
    })
  }, [merged, filter])

  const modalItem = useMemo(
    () => (modalId ? merged.find((m) => m.id === modalId) ?? null : null),
    [modalId, merged]
  )

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const thumbUnoptimized = (url: string) => url.startsWith('http')

  async function deleteR2Media(item: DisplayItem) {
    if (item.storage !== 'r2' || !item.r2ObjectKey) return
    if (!window.confirm(`Remover permanentemente "${item.name}" do R2?`)) return
    setDeletingId(item.id)
    try {
      const res = await fetch('/api/admin/r2/object', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: project.id, objectKey: item.r2ObjectKey }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        window.alert(data.error ?? 'Não foi possível excluir.')
        return
      }
      setModalId((id) => (id === item.id ? null : id))
      router.refresh()
    } catch {
      window.alert('Erro de rede.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-zinc-50">{project.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {project.clientName} · {project.photoCount} fotos · {project.videoCount} vídeos
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
          >
            <Link2 className="h-4 w-4" />
            Gerar link para cliente
          </button>
          <DownloadAllZipButton eventId={project.id} eventTitle={project.title} variant="admin" />
        </div>
      </div>

      <Card padding="sm" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              filter === f.id
                ? 'bg-zinc-800 text-white ring-1 ring-white/10'
                : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        {selected.size > 0 ? (
          <span className="ml-auto self-center text-xs text-zinc-500">
            {selected.size} selecionado{selected.size !== 1 ? 's' : ''}
          </span>
        ) : null}
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={merged.length === 0 ? 'Nenhuma mídia ainda' : 'Nada neste filtro'}
          description={
            merged.length === 0
              ? 'Use a seção de upload abaixo para criar pastas no R2 (fotos) ou vincular uma pasta de vídeos no Google Drive.'
              : 'Tente outro filtro ou adicione mais arquivos ao projeto.'
          }
          action={
            merged.length === 0 ? (
              <Link
                href={`/admin/upload?eventId=${encodeURIComponent(project.id)}`}
                className="rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-warm-500"
              >
                Ir para upload
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((item) => (
            <GalleryTile
              key={item.id}
              item={item}
              selected={selected.has(item.id)}
              thumbUnoptimized={thumbUnoptimized(item.thumbUrl)}
              deleting={deletingId === item.id}
              onOpen={() => setModalId(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onToggleSelect={() => toggleSelect(item.id)}
              onDeleteR2={() => void deleteR2Media(item)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!modalItem}
        onClose={() => setModalId(null)}
        title={modalItem?.kind === 'video' ? 'Vídeo' : 'Foto'}
        size="xl"
      >
        {modalItem ? (
          <div className="space-y-4">
            <div className="relative w-full overflow-hidden rounded-xl bg-black">
              {modalItem.kind === 'video' ? (
                <video
                  src={modalItem.url}
                  controls
                  className="mx-auto max-h-[75vh] w-full"
                  playsInline
                />
              ) : (
                <div className="relative aspect-video w-full">
                  <Image
                    src={modalItem.url}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="100vw"
                    unoptimized={thumbUnoptimized(modalItem.url)}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => void downloadUrlInBrowser(modalItem.downloadUrl, modalItem.name)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-600 bg-zinc-900 py-3 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 sm:w-auto sm:px-6"
            >
              <Download className="h-4 w-4" />
              Baixar arquivo
            </button>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

function GalleryTile({
  item,
  selected,
  thumbUnoptimized,
  deleting,
  onOpen,
  onToggleFavorite,
  onToggleSelect,
  onDeleteR2,
}: {
  item: DisplayItem
  selected: boolean
  thumbUnoptimized: boolean
  deleting: boolean
  onOpen: () => void
  onToggleFavorite: () => void
  onToggleSelect: () => void
  onDeleteR2: () => void
}) {
  const canDeleteStorage = item.storage === 'r2' && Boolean(item.r2ObjectKey)
  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900">
      <button type="button" onClick={onOpen} className="absolute inset-0 z-0">
        {item.kind === 'video' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
          />
        ) : (
          <Image
            src={item.thumbUrl}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:brightness-110"
            sizes="(max-width: 768px) 50vw, 20vw"
            unoptimized={thumbUnoptimized}
          />
        )}
      </button>
      {item.kind === 'video' ? (
        <span className="pointer-events-none absolute left-2 top-2 z-10 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
          <Video className="h-3 w-3" /> Vídeo
        </span>
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-1 p-2">
          <div className="pointer-events-auto flex gap-1">
            <Tooltip label={item.favorite ? 'Remover favorito' : 'Favoritar'}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite()
                }}
                className={`rounded-lg p-2 backdrop-blur ${
                  item.favorite ? 'bg-warm-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                <Heart className={`h-4 w-4 ${item.favorite ? 'fill-current' : ''}`} />
              </button>
            </Tooltip>
            <Tooltip label="Baixar">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void downloadUrlInBrowser(item.downloadUrl, item.name)
                }}
                className="rounded-lg bg-black/50 p-2 text-white backdrop-blur hover:bg-black/70"
              >
                <Download className="h-4 w-4" />
              </button>
            </Tooltip>
            <Tooltip label="Selecionar">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleSelect()
                }}
                className={`rounded-lg p-2 backdrop-blur ${
                  selected ? 'bg-emerald-600 text-white' : 'bg-black/50 text-white hover:bg-black/70'
                }`}
              >
                {selected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </button>
            </Tooltip>
            {canDeleteStorage ? (
              <Tooltip label="Excluir do R2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteR2()
                  }}
                  className="rounded-lg bg-red-600/80 p-2 text-white backdrop-blur hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
      {item.clientSelected ? (
        <span className="absolute right-2 top-2 z-10 rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Cliente
        </span>
      ) : null}
    </div>
  )
}
