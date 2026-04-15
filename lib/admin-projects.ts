import { prisma } from '@/lib/prisma'
import type { GalleryMedia } from '@/lib/gallery-media'
import { getGalleryMediaFromFolderRef } from '@/lib/gallery-media'

/** Capa quando o evento não tem imagem (Next/Image precisa de host em remotePatterns). */
export const ADMIN_PROJECT_FALLBACK_COVER =
  'https://placehold.co/800x600/18181b/a1a1aa/png?text=Sem+capa'

export type AdminProjectStatus = 'editing' | 'waiting_selection' | 'late' | 'delivered'

export type AdminProjectCategory = 'FEMININE' | 'KIDS' | 'EVENT' | 'OTHER'

export const adminProjectStatusLabels: Record<AdminProjectStatus, string> = {
  editing: 'Em edição',
  waiting_selection: 'Aguard. seleção',
  late: 'Atrasado',
  delivered: 'Entregue',
}

export const adminCategoryLabels: Record<AdminProjectCategory, string> = {
  FEMININE: 'Feminino',
  KIDS: 'Infantil',
  EVENT: 'Evento',
  OTHER: 'Outro',
}

export type AdminProjectRow = {
  id: string
  title: string
  clientName: string
  clientId: string
  /** Telefone do cliente (campo `User.phone`), se cadastrado. */
  clientPhone: string | null
  createdAt: string
  shootDate: string | null
  deliveredAt: string | null
  sessionValue: number | null
  category: AdminProjectCategory
  folderCount: number
  status: AdminProjectStatus
  coverUrl: string
  /** true = pasta R2 verificada e existe; false = não encontrada ou sem R2 */
  r2Online: boolean
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
  category: AdminProjectCategory
  shootDate: string | null
  deliveredAt: string | null
  sessionValue: number | null
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

/** Derivação automática de status com base em datas e pastas. */
function deriveStatus(
  folderCount: number,
  shootDate: Date | null,
  deliveredAt: Date | null
): AdminProjectStatus {
  if (deliveredAt) return 'delivered'
  if (folderCount > 0 && !deliveredAt) return 'waiting_selection'
  if (shootDate) {
    const daysSinceShoot = (Date.now() - shootDate.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceShoot > 15) return 'late'
  }
  return 'editing'
}

/** Testa se uma pasta R2 existe via HEAD no primeiro objeto listado. Nunca lança. */
async function checkR2FolderOnline(eventId: string): Promise<boolean> {
  try {
    const { S3Client, ListObjectsV2Command } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT ?? '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
      },
    })
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET ?? '',
        Prefix: `events/${eventId}/`,
        MaxKeys: 1,
      })
    )
    return (res.KeyCount ?? 0) > 0
  } catch {
    return false
  }
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
      client: { select: { id: true, name: true, phone: true } },
      _count: { select: { folders: true } },
    },
  })

  // Verifica R2 online em paralelo com timeout de 3 s
  const r2Checks = await Promise.allSettled(
    rows.map((e) =>
      Promise.race([
        checkR2FolderOnline(e.id),
        new Promise<boolean>((res) => setTimeout(() => res(false), 3000)),
      ])
    )
  )

  return rows.map((e, i) => ({
    id: e.id,
    title: e.title,
    clientId: e.clientId,
    clientName: e.client.name,
    clientPhone: e.client.phone,
    createdAt: e.createdAt.toISOString(),
    shootDate: e.shootDate ? e.shootDate.toISOString() : null,
    deliveredAt: e.deliveredAt ? e.deliveredAt.toISOString() : null,
    sessionValue: e.sessionValue ?? null,
    category: (e.category ?? 'OTHER') as AdminProjectCategory,
    folderCount: e._count.folders,
    status: deriveStatus(e._count.folders, e.shootDate, e.deliveredAt),
    coverUrl: e.coverUrl || ADMIN_PROJECT_FALLBACK_COVER,
    r2Online: r2Checks[i].status === 'fulfilled' ? (r2Checks[i] as PromiseFulfilledResult<boolean>).value : false,
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
    category: (event.category ?? 'OTHER') as AdminProjectCategory,
    shootDate: event.shootDate ? event.shootDate.toISOString() : null,
    deliveredAt: event.deliveredAt ? event.deliveredAt.toISOString() : null,
    sessionValue: event.sessionValue ?? null,
    coverUrl: event.coverUrl || ADMIN_PROJECT_FALLBACK_COVER,
    rawCoverUrl: event.coverUrl,
    folderCount,
    status: deriveStatus(folderCount, event.shootDate, event.deliveredAt),
    media,
    photoCount,
    videoCount,
  }
}
