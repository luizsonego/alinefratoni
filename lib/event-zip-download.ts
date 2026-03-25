import archiver from 'archiver'
import { PassThrough } from 'stream'
import { getDriveImagesFromFolder, isDriveConfigured } from '@/lib/google-drive'
import {
  getR2ObjectBuffer,
  isR2Configured,
  listR2MediaFromPrefix,
  parseR2FolderRef,
  sanitizeObjectFilename,
} from '@/lib/r2'

function sanitizeZipFolderSegment(name: string): string {
  const t = name.replace(/[/\\]+/g, '-').replace(/^\.+/, '').trim()
  return t.length > 0 ? t.slice(0, 80) : 'pasta'
}

/**
 * Monta o ZIP no servidor: R2 via SDK; Google Drive via `files/{id}?alt=media` com a mesma API key da listagem.
 */
export async function buildEventMediaZipBuffer(folders: { title: string; driveUrl: string }[]): Promise<
  Buffer | { error: string }
> {
  type Entry = { path: string; buffer: Buffer }
  const entries: Entry[] = []

  for (const folder of folders) {
    const folderSeg = sanitizeZipFolderSegment(folder.title)
    const prefix = parseR2FolderRef(folder.driveUrl)

    if (prefix && isR2Configured()) {
      try {
        const items = await listR2MediaFromPrefix(prefix)
        for (const item of items) {
          try {
            const buffer = await getR2ObjectBuffer(item.id)
            const name = sanitizeObjectFilename(item.name)
            entries.push({
              path: `${folderSeg}/${name}`,
              buffer,
            })
          } catch {
            // ignora arquivo que falhou
          }
        }
      } catch {
        // pasta R2 ilegível
      }
      continue
    }

    if (isDriveConfigured()) {
      const items = await getDriveImagesFromFolder(folder.driveUrl)
      const apiKey = process.env.GOOGLE_DRIVE_API_KEY
      if (!apiKey) continue

      for (const item of items) {
        try {
          const url =
            `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(item.id)}` +
            `?alt=media&key=${encodeURIComponent(apiKey)}`
          const res = await fetch(url)
          if (!res.ok) continue
          const buffer = Buffer.from(await res.arrayBuffer())
          const name = sanitizeObjectFilename(item.name)
          entries.push({
            path: `${folderSeg}/${name}`,
            buffer,
          })
        } catch {
          // ignora
        }
      }
    }
  }

  if (entries.length === 0) {
    return { error: 'Nenhuma mídia disponível para baixar (verifique R2/Drive e permissões dos arquivos).' }
  }

  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = new PassThrough()
  archive.pipe(stream)

  const bufferPromise = new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (c: Buffer) => chunks.push(c))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
    archive.on('error', reject)
  })

  const usedNames = new Set<string>()
  for (const e of entries) {
    let path = e.path
    if (usedNames.has(path)) {
      const dot = path.lastIndexOf('.')
      const base = dot === -1 ? path : path.slice(0, dot)
      const ext = dot === -1 ? '' : path.slice(dot)
      let n = 2
      while (usedNames.has(`${base} (${n})${ext}`)) n += 1
      path = `${base} (${n})${ext}`
    }
    usedNames.add(path)
    archive.append(e.buffer, { name: path })
  }

  await archive.finalize()
  return bufferPromise
}
