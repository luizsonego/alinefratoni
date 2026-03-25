'use client'

import { useCallback, useEffect, useState } from 'react'
import { downloadUrlInBrowser } from '@/lib/download-in-browser'
import { type GalleryMedia } from '@/lib/gallery-media'

const ASPECT = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'] as const

type Props = {
  images: GalleryMedia[]
  folderTitle: string
  driveFolderUrl: string
}

export default function PhotoMasonry({ images, folderTitle, driveFolderUrl }: Props) {
  const [lightbox, setLightbox] = useState<GalleryMedia | null>(null)
  const canOpenFolderLink = /^https?:\/\//i.test(driveFolderUrl)

  const closeLightbox = useCallback(() => setLightbox(null), [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [lightbox, closeLightbox])

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 text-sm text-zinc-400">
        Não foi possível listar midias automaticamente.{' '}
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noreferrer"
          className={`font-medium text-white underline decoration-zinc-600 underline-offset-4 hover:decoration-white ${
            canOpenFolderLink ? '' : 'pointer-events-none opacity-60'
          }`}
        >
          {canOpenFolderLink ? 'Abrir pasta' : 'Pasta interna (R2)'}
        </a>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        {folderTitle}
      </h2>
      <div className="columns-2 gap-3 sm:columns-3 lg:gap-4 xl:columns-4">
        {images.map((image, index) => (
          <figure
            key={image.id}
            className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950 shadow-lg shadow-black/20 ${ASPECT[index % ASPECT.length]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinamicas (Drive/R2) */}
            <img
              src={image.thumbnailUrl}
              alt={image.name}
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />
            <button
              type="button"
              onClick={() => setLightbox(image)}
              className="absolute inset-0 z-[5] cursor-zoom-in bg-transparent"
              aria-label={`Ampliar midia ${image.name}`}
            />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-3">
              {image.mediaType === 'video' && (
                <span className="w-max rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-200">
                  Video
                </span>
              )}
              <span className="line-clamp-1 text-[10px] font-medium text-zinc-300/90">{image.name}</span>
              <div className="pointer-events-auto flex gap-2 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightbox(image)
                  }}
                  className="rounded-lg border border-white/20 bg-black/40 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
                >
                  Ver
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    void downloadUrlInBrowser(image.downloadUrl, image.name)
                  }}
                  className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black transition hover:bg-zinc-200"
                >
                  Baixar
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizacao de midia"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800/80 px-4 py-3 md:px-6">
            <p className="min-w-0 truncate text-sm font-medium text-zinc-200">{lightbox.name}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => void downloadUrlInBrowser(lightbox.downloadUrl, lightbox.name)}
                className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-200 transition hover:bg-zinc-800 hover:text-white"
              >
                Baixar
              </button>
              <button
                type="button"
                onClick={closeLightbox}
                className="rounded-full border border-zinc-600 px-4 py-2 text-xs font-medium uppercase tracking-wider text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
          <button
            type="button"
            className="relative flex min-h-0 flex-1 cursor-default items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
            aria-label="Fechar"
          >
            {lightbox.mediaType === 'video' ? (
              <video
                src={lightbox.previewUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[calc(100vh-5rem)] max-w-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- lightbox: dimensoes dinamicas, URL do Drive
              <img
                src={lightbox.previewUrl}
                alt={lightbox.name}
                className="max-h-[calc(100vh-5rem)] max-w-full object-contain shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
