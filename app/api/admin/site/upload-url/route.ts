import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import {
  createR2UploadUrl,
  getR2PublicUrlForObjectKey,
  getSiteAssetsR2Prefix,
  isR2Configured,
  sanitizeObjectFilename,
} from '@/lib/r2'

export const runtime = 'nodejs'

const bodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
})

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Cloudflare R2 não configurado.' }, { status: 400 })
  }

  const json = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const ct = parsed.data.contentType.toLowerCase()
  const isImage = ct.startsWith('image/')
  const isVideo = ct.startsWith('video/')
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: 'Use image/* ou video/* como tipo do arquivo.' },
      { status: 400 }
    )
  }

  const prefix = getSiteAssetsR2Prefix()
  const objectKey = `${prefix}${Date.now()}-${sanitizeObjectFilename(parsed.data.filename)}`
  const signedUrl = await createR2UploadUrl({
    objectKey,
    contentType: parsed.data.contentType,
    expiresInSeconds: 3600,
  })

  const publicUrl = getR2PublicUrlForObjectKey(objectKey)

  return NextResponse.json({
    signedUrl,
    objectKey,
    publicUrl,
    cdnConfigured: Boolean(publicUrl),
  })
}
