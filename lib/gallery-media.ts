import { getDriveImagesFromFolder } from '@/lib/google-drive'
import { listR2MediaFromPrefix, parseR2FolderRef } from '@/lib/r2'

export type GalleryMedia = {
  id: string
  name: string
  mediaType: 'image' | 'video'
  thumbnailUrl: string
  downloadUrl: string
  viewUrl: string
  previewUrl: string
}

/** Usa rotas `/api/...` como proxy — o navegador não acessa o endpoint S3 direto (evita imagens quebradas). */
export type GalleryR2UrlMode =
  | { kind: 'admin-proxy'; eventId: string }
  | { kind: 'client-proxy'; eventId: string }
  | { kind: 'share-proxy'; slug: string }

export async function getGalleryMediaFromFolderRef(
  folderRef: string,
  r2Proxy?: GalleryR2UrlMode
): Promise<GalleryMedia[]> {
  const r2Prefix = parseR2FolderRef(folderRef)
  if (r2Prefix) {
    if (r2Proxy?.kind === 'admin-proxy') {
      const { eventId } = r2Proxy
      return listR2MediaFromPrefix(r2Prefix, {
        resolveMediaUrl: (objectKey) =>
          `/api/admin/r2/file?${new URLSearchParams({ eventId, key: objectKey }).toString()}`,
      })
    }
    if (r2Proxy?.kind === 'client-proxy') {
      const { eventId } = r2Proxy
      return listR2MediaFromPrefix(r2Prefix, {
        resolveMediaUrl: (objectKey) =>
          `/api/events/${encodeURIComponent(eventId)}/r2-file?${new URLSearchParams({ key: objectKey }).toString()}`,
      })
    }
    if (r2Proxy?.kind === 'share-proxy') {
      const { slug } = r2Proxy
      return listR2MediaFromPrefix(r2Prefix, {
        resolveMediaUrl: (objectKey) =>
          `/api/share/${encodeURIComponent(slug)}/r2-file?${new URLSearchParams({ key: objectKey }).toString()}`,
      })
    }
    return listR2MediaFromPrefix(r2Prefix)
  }
  return getDriveImagesFromFolder(folderRef)
}
