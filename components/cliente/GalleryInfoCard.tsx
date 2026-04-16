import { DownloadAllZipButton } from '@/components/DownloadAllZipButton'
import GalleryWatermark from './GalleryWatermark'
import { type GalleryMedia } from '@/lib/gallery-media'

type Props = {
  title: string
  infoText: string | null
  eventId: string
  showDriveHint: boolean
  showDownloadAll?: boolean
  /** Se definido, o ZIP usa `/api/share/{slug}/download-all` (galeria pública compartilhada). */
  shareSlug?: string
  allMedia?: GalleryMedia[]
}

export default function GalleryInfoCard({
  title,
  infoText,
  eventId,
  showDriveHint,
  showDownloadAll = true,
  shareSlug,
  allMedia = [],
}: Props) {
  return (
    <aside className="relative flex min-h-[min(520px,70vh)] flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-7 shadow-2xl shadow-black/40 backdrop-blur-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <GalleryWatermark />

      <div className="relative z-10 flex flex-1 flex-col">
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">
          Galeria
        </p>
        <h1 className="mt-3 text-balance font-sans text-3xl font-semibold uppercase leading-[1.1] tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        <p className="mt-6 flex-1 whitespace-pre-line text-sm leading-relaxed text-zinc-400">
          {infoText || 'Sem informações adicionais para este evento.'}
        </p>

        {showDownloadAll ? (
          <div className="mt-8">
            <DownloadAllZipButton
              eventId={eventId}
              eventTitle={title}
              variant="client"
              shareSlug={shareSlug}
              allMedia={allMedia}
            />
          </div>
        ) : null}

        {showDriveHint && (
          <p className="relative z-10 mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] leading-snug text-amber-100/90">
            Configure <code className="rounded bg-black/30 px-1 py-0.5 text-[10px]">GOOGLE_DRIVE_API_KEY</code>{' '}
            ou as variáveis de <code className="rounded bg-black/30 px-1 py-0.5 text-[10px]">R2_*</code> para
            listar miniaturas automaticamente.
          </p>
        )}
      </div>
    </aside>
  )
}
