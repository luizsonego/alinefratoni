import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import {
  createR2UploadUrl,
  getR2PublicUrlForObjectKey,
  isR2Configured,
  looksLikeImageFilename,
  parseR2FolderRef,
  r2UploadContentTypeFromFilename,
} from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const uploadUrlSchema = z.object({
  folderId: z.string().min(10),
  filename: z.string().min(1),
  contentType: z.string().min(1),
  expectImage: z.boolean().optional(),
})

function safeFilename(name: string) {
  return name
    .replace(/[^\w.\-() ]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
}

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
  const { prisma } = await import('@/lib/prisma')

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Cloudflare R2 não configurado.' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = uploadUrlSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const folder = await prisma.galleryFolder.findUnique({
    where: { id: parsed.data.folderId },
    select: { driveUrl: true },
  })

  const prefix = folder ? parseR2FolderRef(folder.driveUrl) : null
  if (!prefix) {
    return NextResponse.json({ error: 'Pasta R2 não encontrada.' }, { status: 404 })
  }

  const contentType = r2UploadContentTypeFromFilename(parsed.data.contentType, parsed.data.filename)
  if (
    parsed.data.expectImage &&
    !contentType.startsWith('image/') &&
    !looksLikeImageFilename(parsed.data.filename)
  ) {
    return NextResponse.json(
      { error: 'Neste fluxo só são aceitas imagens. Use o Google Drive para vídeos.' },
      { status: 400 }
    )
  }

  const objectKey = `${prefix}${Date.now()}-${safeFilename(parsed.data.filename)}`
  const signedUrl = await createR2UploadUrl({
    objectKey,
    contentType,
    expiresInSeconds: 3600,
  })

  const publicUrl = getR2PublicUrlForObjectKey(objectKey)

  return NextResponse.json({
    signedUrl,
    objectKey,
    publicUrl,
    /** Mesmo valor usado na assinatura — o cliente deve enviar no PUT para o R2. */
    contentType,
  })
}
