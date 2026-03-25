import { randomUUID } from 'crypto'
import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'

const UPLOAD_REL = '/uploads/events'
const MAX_BYTES = 5 * 1024 * 1024

const ALLOWED = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
])

function uploadDir() {
  return path.join(process.cwd(), 'public', 'uploads', 'events')
}

/**
 * Salva arquivo de capa em `public/uploads/events` e retorna URL pública (ex: `/uploads/events/uuid.jpg`).
 */
export async function saveEventCoverFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error('Selecione uma imagem de capa.')
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Imagem muito grande (máximo 5MB).')
  }

  const ext = ALLOWED.get(file.type)
  if (!ext) {
    throw new Error('Formato não permitido. Use JPG, PNG, WebP ou GIF.')
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
  if (!coverUrl || !coverUrl.startsWith(`${UPLOAD_REL}/`)) return
  const filepath = path.join(process.cwd(), 'public', coverUrl)
  try {
    await unlink(filepath)
  } catch {
    // arquivo já removido ou inexistente
  }
}
