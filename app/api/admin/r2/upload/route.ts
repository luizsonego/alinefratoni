import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isR2Configured, parseR2FolderRef, uploadFileToR2Prefix } from '@/lib/r2'

export const runtime = 'nodejs'

const uploadSchema = z.object({
  folderId: z.string().min(10),
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

  const formData = await request.formData()
  const parsed = uploadSchema.safeParse({
    folderId: formData.get('folderId'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  if (formData.get('expectImage') === '1' && !file.type.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Neste fluxo só são aceitas imagens. Use o Google Drive para vídeos.' },
      { status: 400 }
    )
  }

  const folder = await prisma.galleryFolder.findUnique({
    where: { id: parsed.data.folderId },
    select: { driveUrl: true },
  })
  const prefix = folder ? parseR2FolderRef(folder.driveUrl) : null
  if (!prefix) {
    return NextResponse.json({ error: 'Pasta R2 não encontrada.' }, { status: 404 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const uploaded = await uploadFileToR2Prefix({
    prefix,
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    body: new Uint8Array(arrayBuffer),
  })

  return NextResponse.json({
    ok: true,
    objectKey: uploaded.objectKey,
    publicUrl: uploaded.publicUrl,
  })
}
