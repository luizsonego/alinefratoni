'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { downloadUrlInBrowser } from '@/lib/download-in-browser'
import { type GalleryMedia } from '@/lib/gallery-media'
import Image from 'next/image'

const ASPECT = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[5/4]'] as const

/** Primeira leva na grade — sensação de página instantânea; o restante entra com scroll. */
const GRID_INITIAL_COUNT = 10
const GRID_LOAD_MORE = 10
/** Miniaturas: qualidade menor no otimizador Next (R2 / mesma origem). */
const GRID_IMAGE_QUALITY = 45
/** Lightbox: arquivo maior / mais nítido. */
const LIGHTBOX_IMAGE_QUALITY = 80

/** `/_next/image` busca no servidor sem cookies — quebra `/api/share/...` com senha. */
function isAppProxyMediaUrl(src: string) {
  return src.startsWith('/api/')
}

type Props = {
  images: GalleryMedia[]
  folderTitle: string
  driveFolderUrl: string
}

export default function PhotoMasonry({ images, folderTitle, driveFolderUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(GRID_INITIAL_COUNT, images.length),
  )
  const sentinelRef = useRef<HTMLDivElement>(null)
  const canOpenFolderLink = /^https?:\/\//i.test(driveFolderUrl)

  useEffect(() => {
    setVisibleCount(Math.min(GRID_INITIAL_COUNT, images.length))
  }, [folderTitle, images.length])

  useEffect(() => {
    if (visibleCount >= images.length) return
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + GRID_LOAD_MORE, images.length))
        }
      },
      { root: null, rootMargin: '700px 0px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visibleCount, images.length])

  const lightbox = useMemo(
    () => (lightboxIndex != null ? images[lightboxIndex] ?? null : null),
    [images, lightboxIndex],
  )

  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i == null || images.length < 2) return i
      return (i - 1 + images.length) % images.length
    })
  }, [images.length])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i == null || images.length < 2) return i
      return (i + 1) % images.length
    })
  }, [images.length])

  useEffect(() => {
    if (lightboxIndex == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (images.length < 2) return
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        goNext()
      }
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [lightboxIndex, closeLightbox, images.length, goPrev, goNext])

  useEffect(() => {
    if (lightboxIndex == null || images.length < 2) return
    const preload = (m: GalleryMedia | undefined) => {
      if (!m || m.mediaType !== 'image') return
      const img = new window.Image()
      img.src = m.previewUrl
    }
    preload(images[(lightboxIndex - 1 + images.length) % images.length])
    preload(images[(lightboxIndex + 1) % images.length])
  }, [lightboxIndex, images])

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-6 text-sm text-zinc-400">
        Não foi possível listar midias automaticamente.{' '}
        <a
          href={driveFolderUrl}
          target="_blank"
          rel="noreferrer"
          className={`font-medium text-white underline decoration-zinc-600 underline-offset-4 hover:decoration-white ${canOpenFolderLink ? '' : 'pointer-events-none opacity-60'
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
        {images.slice(0, visibleCount).map((image, index) => (
          <figure
            key={image.id}
            className={`group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950 shadow-lg shadow-black/20 ${ASPECT[index % ASPECT.length]}`}
          >
            <Image
              src={image.thumbnailUrl}
              alt={image.name}
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={GRID_IMAGE_QUALITY}
              priority={index < 8}
              unoptimized={isAppProxyMediaUrl(image.thumbnailUrl)}
              loading={index < 4 ? 'eager' : 'lazy'}
              layout='responsive'
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition group-hover:opacity-100" />
            <button
              type="button"
              onClick={() => setLightboxIndex(index)}
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
                    setLightboxIndex(index)
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
      {visibleCount < images.length ? (
        <div ref={sentinelRef} className="mt-3 h-10 w-full shrink-0" aria-hidden />
      ) : null}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualizacao de midia"
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800/80 px-4 py-3 md:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-200">{lightbox.name}</p>
              {images.length > 1 && lightboxIndex != null && (
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {lightboxIndex + 1} de {images.length}
                </p>
              )}
            </div>
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
          <div className="relative flex min-h-0 flex-1">
            <button
              type="button"
              className="absolute inset-0 z-[1] cursor-default"
              onClick={closeLightbox}
              aria-label="Fechar"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  className="absolute left-2 top-1/2 z-[3] -translate-y-1/2 rounded-full border border-zinc-600/80 bg-black/50 p-2.5 text-zinc-100 backdrop-blur-sm transition hover:border-zinc-400 hover:bg-black/70 md:left-4 md:p-3"
                  aria-label="Midia anterior"
                >
                  <ChevronLeft className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  className="absolute right-2 top-1/2 z-[3] -translate-y-1/2 rounded-full border border-zinc-600/80 bg-black/50 p-2.5 text-zinc-100 backdrop-blur-sm transition hover:border-zinc-400 hover:bg-black/70 md:right-4 md:p-3"
                  aria-label="Proxima midia"
                >
                  <ChevronRight className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.75} />
                </button>
              </>
            )}
            <div className="pointer-events-none relative z-[2] flex min-h-0 flex-1 items-center justify-center p-4 md:p-8">
              <div className="pointer-events-auto">
                {lightbox.mediaType === 'video' ? (
                  <video
                    key={lightbox.id}
                    src={lightbox.previewUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[calc(100vh-5rem)] max-w-full object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div
                    key={lightbox.id}
                    className="relative h-[min(85dvh,calc(100dvh-5.5rem))] w-full max-w-[min(1400px,calc(100vw-2rem))] min-h-[12rem] shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={lightbox.previewUrl}
                      alt={lightbox.name}
                      fill
                      style={{ position: 'relative' }}
                      className="object-contain"
                      sizes="100vw"
                      quality={LIGHTBOX_IMAGE_QUALITY}
                      priority
                      unoptimized={isAppProxyMediaUrl(lightbox.previewUrl)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
