import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { deleteR2ObjectKey, isR2Configured, uploadFileToR2Prefix } from '@/lib/r2'

const UPLOAD_REL = '/uploads/events'
const R2_COVERS_PREFIX = 'site/events/covers'
const MAX_BYTES = 25 * 1024 * 1024

const ALLOWED = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

function uploadDir() {
  return path.join(process.cwd(), 'public', 'uploads', 'events')
}

function shouldUseR2ForCoverUpload() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
}

function getR2ObjectKeyFromCoverUrl(coverUrl: string) {
  const baseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  if (!baseUrl) return null
  if (!coverUrl.startsWith(`${baseUrl}/`)) return null
  const encoded = coverUrl.slice(baseUrl.length + 1)
  return decodeURI(encoded)
}

/**
 * Salva arquivo de capa em `public/uploads/events` e retorna URL pública (ex: `/uploads/events/uuid.jpg`).
 */
export async function saveEventCoverFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Selecione uma imagem de capa.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Imagem muito grande (máximo ${MAX_BYTES / 1024 / 1024}MB).`)
  }

  const ext = ALLOWED.get(file.type)
  if (!ext) {
    throw new Error('Formato não permitido. Use JPG, PNG, WebP ou GIF.')
  }

  if (shouldUseR2ForCoverUpload()) {
    if (!isR2Configured()) {
      throw new Error('Upload em produção requer R2 configurado no ambiente.')
    }
    const buffer = new Uint8Array(await file.arrayBuffer())
    const filename = `${randomUUID()}${ext}`
    const uploaded = await uploadFileToR2Prefix({
      prefix: R2_COVERS_PREFIX,
      filename,
      contentType: file.type,
      body: buffer,
    })
    if (!uploaded.publicUrl) {
      throw new Error('R2 configurado sem URL pública para exibir a capa.')
    }
    return uploaded.publicUrl
  }

  await mkdir(uploadDir(), { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filename = `${randomUUID()}${ext}`
  const filepath = path.join(uploadDir(), filename)
  await writeFile(filepath, buffer)

  return `${UPLOAD_REL}/${filename}`
}

/**
 * Remove arquivo local antigo se `coverUrl` for um upload nosso (`/uploads/events/...`).
 */
export async function removeLocalCoverIfExists(coverUrl: string | null | undefined) {
  if (coverUrl && isR2Configured()) {
    const objectKey = getR2ObjectKeyFromCoverUrl(coverUrl)
    if (objectKey) {
      try {
        await deleteR2ObjectKey(objectKey)
      } catch {
        // objeto já removido ou inexistente
      }
      return
    }
  }

  if (!coverUrl || !coverUrl.startsWith(`${UPLOAD_REL}/`)) return
  const filepath = path.join(process.cwd(), 'public', coverUrl)
  try {
    await unlink(filepath)
  } catch {
    // arquivo já removido ou inexistente
  }
}
