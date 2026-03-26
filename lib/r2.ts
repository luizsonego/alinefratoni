import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.webm', '.m4v'])

export type R2MediaFile = {
  id: string
  name: string
  mediaType: 'image' | 'video'
  thumbnailUrl: string
  downloadUrl: string
  viewUrl: string
  previewUrl: string
}

function getEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} não configurado no ambiente.`)
  }
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error(`${name} não configurado no ambiente.`)
  }
  return trimmed
}

function getOptionalEnv(name: string) {
  const value = process.env[name]
  return value ? value.trim() : ''
}

function ensureTrailingSlash(value: string) {
  return value.endsWith('/') ? value : `${value}/`
}

function extFromName(name: string) {
  const dotIndex = name.lastIndexOf('.')
  if (dotIndex === -1) return ''
  return name.slice(dotIndex).toLowerCase()
}

function mediaTypeFromName(name: string): 'image' | 'video' | null {
  const ext = extFromName(name)
  if (IMAGE_EXTENSIONS.has(ext)) return 'image'
  if (VIDEO_EXTENSIONS.has(ext)) return 'video'
  return null
}

function toPublicUrl(objectKey: string) {
  const baseUrl = getOptionalEnv('R2_PUBLIC_BASE_URL')
  if (!baseUrl) return ''
  const base = baseUrl.replace(/\/$/, '')
  const host = (() => {
    try {
      return new URL(base).hostname.toLowerCase()
    } catch {
      return ''
    }
  })()
  // Endpoint S3 compatível (r2.cloudflarestorage.com) não expõe GET público — só CDN / domínio customizado.
  if (host === 'r2.cloudflarestorage.com' || host.endsWith('.r2.cloudflarestorage.com')) {
    return ''
  }
  return `${base}/${encodeURI(objectKey)}`
}

/** URL pública do objeto no CDN (vazio se `R2_PUBLIC_BASE_URL` não estiver definido). */
export function getR2PublicUrlForObjectKey(objectKey: string) {
  return toPublicUrl(objectKey)
}

/** Prefixo R2 para mídia do site público (hero, portfólio). Padrão: `site/public/`. */
export function getSiteAssetsR2Prefix() {
  const raw = (getOptionalEnv('R2_SITE_PREFIX') || 'site/public').replace(/^\/+/, '')
  return ensureTrailingSlash(raw)
}

/** Garante que só objetos da pasta pública do site sejam expostos via proxy da aplicação. */
export function isSitePublicAssetObjectKey(objectKey: string): boolean {
  const k = objectKey.replace(/^\/+/, '')
  const prefix = getSiteAssetsR2Prefix().replace(/^\/+/, '')
  return k.startsWith(prefix)
}

function buildR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: getEnv('R2_ENDPOINT'),
    // R2 é S3 compatível, mas com endpoints que normalmente exigem path-style.
    // Isso evita variações de canonical URL que podem causar SignatureDoesNotMatch.
    forcePathStyle: true,
    credentials: {
      accessKeyId: getEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getEnv('R2_SECRET_ACCESS_KEY'),
    },
  })
}

export function isR2Configured() {
  return Boolean(
    getOptionalEnv('R2_ENDPOINT') &&
      getOptionalEnv('R2_ACCESS_KEY_ID') &&
      getOptionalEnv('R2_SECRET_ACCESS_KEY') &&
      getOptionalEnv('R2_BUCKET')
  )
}

export function createR2FolderRef(prefix: string) {
  return `r2://${ensureTrailingSlash(prefix)}`
}

export function parseR2FolderRef(ref: string) {
  if (!ref.startsWith('r2://')) return null
  return ensureTrailingSlash(ref.replace('r2://', '').trim())
}

export async function ensureR2Prefix(prefix: string) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const normalizedPrefix = ensureTrailingSlash(prefix)
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: `${normalizedPrefix}.keep`,
      Body: '',
    })
  )
}

export async function createR2UploadUrl(params: {
  objectKey: string
  contentType: string
  expiresInSeconds?: number
}) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.objectKey,
    ContentType: params.contentType,
  })
  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: params.expiresInSeconds ?? 900,
  })
  return signedUrl
}

export type ListR2MediaOptions = {
  /** URLs servidas pelo app (ex. `/api/.../r2-file`) — evita `<img>` quebrado com endpoint S3 ou CORS. */
  resolveMediaUrl?: (objectKey: string) => string
}

export async function listR2MediaFromPrefix(
  prefix: string,
  options?: ListR2MediaOptions
): Promise<R2MediaFile[]> {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const publicBase = getOptionalEnv('R2_PUBLIC_BASE_URL')
  const normalizedPrefix = ensureTrailingSlash(prefix)
  const list = await client.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: normalizedPrefix,
      MaxKeys: 1000,
    })
  )

  const contents = Array.isArray(list.Contents) ? list.Contents : []
  const keys = contents
    .map((item) => item.Key)
    .filter((key): key is string => Boolean(key && !key.endsWith('/.keep') && !key.endsWith('.keep')))

  type Row = { key: string; name: string; mediaType: 'image' | 'video' } | null
  const rows: Row[] = keys.map((key) => {
    const mediaType = mediaTypeFromName(key)
    if (!mediaType) return null
    const name = key.split('/').pop() ?? key
    return { key, name, mediaType }
  })

  const valid = rows.filter((r): r is NonNullable<typeof r> => r !== null)
  valid.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  if (options?.resolveMediaUrl) {
    const resolve = options.resolveMediaUrl
    return valid.map((row) => {
      const url = resolve(row.key)
      return {
        id: row.key,
        name: row.name,
        mediaType: row.mediaType,
        thumbnailUrl: url,
        downloadUrl: url,
        viewUrl: url,
        previewUrl: url,
      } satisfies R2MediaFile
    })
  }

  if (publicBase) {
    return valid.map((row) => {
      const publicUrl = toPublicUrl(row.key)
      return {
        id: row.key,
        name: row.name,
        mediaType: row.mediaType,
        thumbnailUrl: publicUrl,
        downloadUrl: publicUrl,
        viewUrl: publicUrl,
        previewUrl: publicUrl,
      } satisfies R2MediaFile
    })
  }

  /** Sem `R2_PUBLIC_BASE_URL`, a listagem ainda funciona via URLs assinadas (painel + galeria do cliente). */
  const signedTtl = 3600
  return Promise.all(
    valid.map(async (row) => {
      const signedUrl = await createR2DownloadUrl(row.key, signedTtl)
      return {
        id: row.key,
        name: row.name,
        mediaType: row.mediaType,
        thumbnailUrl: signedUrl,
        downloadUrl: signedUrl,
        viewUrl: signedUrl,
        previewUrl: signedUrl,
      } satisfies R2MediaFile
    })
  )
}

export async function createR2DownloadUrl(objectKey: string, expiresInSeconds = 900) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  })
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
}

export function contentTypeForR2Key(objectKey: string) {
  const ext = extFromName(objectKey)
  return MIME_BY_EXT[ext] ?? 'application/octet-stream'
}

export async function getR2ObjectStreamForResponse(objectKey: string) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const out = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    })
  )
  if (!out.Body) {
    throw new Error('Objeto vazio no R2.')
  }
  const contentType = out.ContentType?.trim() || contentTypeForR2Key(objectKey)
  return { body: out.Body, contentType }
}

/** Lê o objeto inteiro na memória (ex.: ZIP no servidor). */
export async function getR2ObjectBuffer(objectKey: string): Promise<Buffer> {
  const { body } = await getR2ObjectStreamForResponse(objectKey)
  const bytes = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray()
  return Buffer.from(bytes)
}

export function sanitizeObjectFilename(name: string) {
  return name
    .replace(/[^\w.\-() ]+/g, '_')
    // Evita espaços na Key (pode causar diferenças de encoding na validação de assinatura).
    .replace(/\s+/g, '_')
    .trim()
    .slice(0, 180)
}

export async function deleteR2ObjectKey(objectKey: string) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    })
  )
}

/** Remove todos os objetos sob o prefixo (inclui `.keep` de pastas vazias). */
export async function deleteAllObjectsUnderPrefix(prefix: string) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const normalizedPrefix = ensureTrailingSlash(prefix)
  let continuationToken: string | undefined

  do {
    const list = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: normalizedPrefix,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      })
    )

    const keys = (list.Contents ?? [])
      .map((c) => c.Key)
      .filter((k): k is string => Boolean(k))

    for (const key of keys) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      )
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
  } while (continuationToken)
}

export async function uploadFileToR2Prefix(params: {
  prefix: string
  filename: string
  contentType: string
  body: Uint8Array
}) {
  const client = buildR2Client()
  const bucket = getEnv('R2_BUCKET')
  const normalizedPrefix = ensureTrailingSlash(params.prefix)
  const objectKey = `${normalizedPrefix}${Date.now()}-${sanitizeObjectFilename(params.filename)}`

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: params.body,
      ContentType: params.contentType,
    })
  )

  return {
    objectKey,
    publicUrl: toPublicUrl(objectKey),
  }
}
