import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import {
  completeMultipartUpload,
  createMultipartUpload,
  createPartUploadUrl,
  isR2Configured,
  parseR2FolderRef,
  r2UploadContentTypeFromFilename,
} from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const multipartSchema = z.object({
  action: z.enum(['init', 'sign-part', 'complete']),
  folderId: z.string().min(10),
  filename: z.string().min(1),
  contentType: z.string().optional(),
  uploadId: z.string().optional(),
  partNumber: z.number().int().min(1).optional(),
  parts: z.array(z.object({ ETag: z.string(), PartNumber: z.number() })).optional(),
})

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

function safeFilename(name: string) {
  return name.replace(/[^\w.\-() ]+/g, '_').replace(/\s+/g, ' ').trim().slice(0, 180)
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Cloudflare R2 não configurado.' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = multipartSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }

  const { action, folderId, filename, uploadId, partNumber, parts } = parsed.data

  const folder = await prisma.galleryFolder.findUnique({
    where: { id: folderId },
    select: { driveUrl: true },
  })

  const prefix = folder ? parseR2FolderRef(folder.driveUrl) : null
  if (!prefix) {
    return NextResponse.json({ error: 'Pasta R2 não encontrada.' }, { status: 404 })
  }

  const contentType = r2UploadContentTypeFromFilename(
    parsed.data.contentType || 'application/octet-stream',
    filename
  )
  const objectKey = `${prefix}${Date.now()}-${safeFilename(filename)}`

  try {
    if (action === 'init') {
      const newUploadId = await createMultipartUpload({ objectKey, contentType })
      return NextResponse.json({ uploadId: newUploadId, objectKey })
    }

    if (action === 'sign-part') {
      if (!uploadId || !partNumber) {
        return NextResponse.json({ error: 'uploadId e partNumber são obrigatórios.' }, { status: 400 })
      }
      const signedUrl = await createPartUploadUrl({
        objectKey: body.objectKey, // Use key from init
        uploadId,
        partNumber,
      })
      return NextResponse.json({ signedUrl })
    }

    if (action === 'complete') {
      if (!uploadId || !parts) {
        return NextResponse.json({ error: 'uploadId e parts são obrigatórios.' }, { status: 400 })
      }
      await completeMultipartUpload({
        objectKey: body.objectKey,
        uploadId,
        parts,
      })
      return NextResponse.json({ success: true })
    }
  } catch (error: any) {
    console.error('Multipart upload error:', error)
    return NextResponse.json({ error: error.message || 'Erro no processo multipart.' }, { status: 500 })
  }

  return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 })
}
