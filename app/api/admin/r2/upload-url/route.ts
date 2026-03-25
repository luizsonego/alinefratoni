import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createR2UploadUrl, isR2Configured, parseR2FolderRef } from '@/lib/r2'

export const runtime = 'nodejs'

const uploadUrlSchema = z.object({
  folderId: z.string().min(10),
  filename: z.string().min(1),
  contentType: z.string().min(1),
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

  const objectKey = `${prefix}${Date.now()}-${safeFilename(parsed.data.filename)}`
  const signedUrl = await createR2UploadUrl({
    objectKey,
    contentType: parsed.data.contentType,
  })

  return NextResponse.json({
    signedUrl,
    objectKey,
  })
}
