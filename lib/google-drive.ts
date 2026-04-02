export type DriveImage = {
  id: string
  name: string
  mediaType: 'image' | 'video'
  thumbnailUrl: string
  downloadUrl: string
  viewUrl: string
  previewUrl: string
}

/** URL para exibir a foto em tamanho maior (lightbox), sem abrir o Drive. */
export function getDriveImageLargeUrl(image: DriveImage): string {
  const u = image.thumbnailUrl
  if (u.includes('googleusercontent.com')) {
    const upgraded = u.replace(/=s\d+(-c)?($|\?)/, '=s2048$1')
    if (upgraded !== u) return upgraded
    if (u.includes('=s')) return u.replace(/=s\d+/, '=s2048')
  }
  return `https://lh3.googleusercontent.com/d/${image.id}=s2048`
}

/** URL para abrir mídia dentro do site (imagem ou vídeo). */
export function getDrivePreviewUrl(media: DriveImage): string {
  if (media.mediaType === 'video') {
    return media.previewUrl
  }
  return getDriveImageLargeUrl(media)
}

function extractFolderId(driveUrl: string) {
  const match = driveUrl.match(/folders\/([a-zA-Z0-9_-]+)/)
  if (match?.[1]) return match[1]

  try {
    const url = new URL(driveUrl)
    const fromParam = url.searchParams.get('id')
    return fromParam ?? null
  } catch {
    return null
  }
}

export function isDriveConfigured() {
  return Boolean(process.env.GOOGLE_DRIVE_API_KEY)
}

export async function getDriveImagesFromFolder(driveUrl: string): Promise<DriveImage[]> {
  const apiKey = process.env.GOOGLE_DRIVE_API_KEY
  const folderId = extractFolderId(driveUrl)

  if (!apiKey || !folderId) return []

  const query = encodeURIComponent(
    `'${folderId}' in parents and trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')`
  )

  const endpoint =
    `https://www.googleapis.com/drive/v3/files` +
    `?q=${query}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink)` +
    `&orderBy=name&pageSize=200&key=${apiKey}`

  const response = await fetch(endpoint, {
    next: { revalidate: 60 },
  })

  if (!response.ok) return []

  const data = await response.json()
  const files = Array.isArray(data.files) ? data.files : []

  return files.map((file: any) => {
    const mediaType = String(file.mimeType ?? '').startsWith('video/') ? 'video' : 'image'
    const id = file.id
    /** Grade: leve (~480px) para carregar rápido; lightbox usa `previewUrl` maior. */
    const thumb =
      file.thumbnailLink?.replace('=s220', '=s480') ??
      `https://lh3.googleusercontent.com/d/${id}=s480`
    const downloadUrl =
      file.webContentLink ?? `https://drive.google.com/uc?export=download&id=${id}`
    return {
      mediaType,
      id,
      name: file.name,
      thumbnailUrl: thumb,
      downloadUrl,
      viewUrl: file.webViewLink ?? `https://drive.google.com/file/d/${id}/view`,
      previewUrl:
        mediaType === 'video'
          ? downloadUrl
          : `https://lh3.googleusercontent.com/d/${id}=s2048`,
    }
  })
}
