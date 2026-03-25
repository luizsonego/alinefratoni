import { prisma } from '@/lib/prisma'
import type { GalleryMedia } from '@/lib/gallery-media'
import { getGalleryMediaFromFolderRef } from '@/lib/gallery-media'

/** Capa quando o evento não tem imagem (Next/Image precisa de host em remotePatterns). */
export const ADMIN_PROJECT_FALLBACK_COVER =
  'https://placehold.co/800x600/18181b/a1a1aa/png?text=Sem+capa'

export type AdminProjectStatus = 'editing' | 'delivered'

export const adminProjectStatusLabels: Record<AdminProjectStatus, string> = {
  editing: 'Em edição',
  delivered: 'Com mídia',
}

export type AdminProjectRow = {
  id: string
  title: string
  clientName: string
  /** Telefone do cliente (campo `User.phone`), se cadastrado. */
  clientPhone: string | null
  createdAt: string
  folderCount: number
  status: AdminProjectStatus
  coverUrl: string
}

export type AdminGalleryMediaItem = {
  id: string
  folderId: string
  /** Origem da mídia — só fotos R2 podem ser apagadas pelo painel (objeto no bucket). */
  storage: 'r2' | 'drive'
  /** Chave S3/R2 quando `storage === 'r2'`; caso contrário `null`. */
  r2ObjectKey: string | null
  kind: 'photo' | 'video'
  url: string
  thumbUrl: string
  downloadUrl: string
  name: string
}

export type AdminProjectDetail = {
  id: string
  title: string
  clientId: string
  infoText: string | null
  clientName: string
  clientEmail: string | null
  /** URL de capa para exibição (fallback se vazio). */
  coverUrl: string
  /** Valor salvo no banco (pode ser null). */
  rawCoverUrl: string | null
  folderCount: number
  status: AdminProjectStatus
  media: AdminGalleryMediaItem[]
  photoCount: number
  videoCount: number
}

function deriveStatus(folderCount: number): AdminProjectStatus {
  return folderCount === 0 ? 'editing' : 'delivered'
}

function mapGalleryMedia(
  folderId: string,
  folderRef: string,
  m: GalleryMedia
): AdminGalleryMediaItem {
  const isR2 = folderRef.startsWith('r2://')
  return {
    id: `${folderId}::${m.id}`,
    folderId,
    storage: isR2 ? 'r2' : 'drive',
    r2ObjectKey: isR2 ? m.id : null,
    kind: m.mediaType === 'video' ? 'video' : 'photo',
    url: m.previewUrl,
    thumbUrl: m.thumbnailUrl,
    downloadUrl: m.downloadUrl,
    name: m.name,
  }
}

export async function listAdminProjects(): Promise<AdminProjectRow[]> {
  const rows = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, phone: true } },
      _count: { select: { folders: true } },
    },
  })

  return rows.map((e) => ({
    id: e.id,
    title: e.title,
    clientName: e.client.name,
    clientPhone: e.client.phone,
    createdAt: e.createdAt.toISOString(),
    folderCount: e._count.folders,
    status: deriveStatus(e._count.folders),
    coverUrl: e.coverUrl || ADMIN_PROJECT_FALLBACK_COVER,
  }))
}

export async function getAdminProjectDetail(eventId: string): Promise<AdminProjectDetail | null> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      client: { select: { name: true, email: true } },
      folders: {
        orderBy: { createdAt: 'asc' },
        select: { id: true, title: true, driveUrl: true },
      },
    },
  })

  if (!event) return null

  const media: AdminGalleryMediaItem[] = []
  for (const folder of event.folders) {
    const items = await getGalleryMediaFromFolderRef(folder.driveUrl, {
      kind: 'admin-proxy',
      eventId: event.id,
    })
    for (const m of items) {
      media.push(mapGalleryMedia(folder.id, folder.driveUrl, m))
    }
  }

  const photoCount = media.filter((m) => m.kind === 'photo').length
  const videoCount = media.filter((m) => m.kind === 'video').length
  const folderCount = event.folders.length

  return {
    id: event.id,
    title: event.title,
    clientId: event.clientId,
    infoText: event.infoText,
    clientName: event.client.name,
    clientEmail: event.client.email,
    coverUrl: event.coverUrl || ADMIN_PROJECT_FALLBACK_COVER,
    rawCoverUrl: event.coverUrl,
    folderCount,
    status: deriveStatus(folderCount),
    media,
    photoCount,
    videoCount,
  }
}
