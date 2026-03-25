import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteAllObjectsUnderPrefix, isR2Configured, parseR2FolderRef } from '@/lib/r2'

export const runtime = 'nodejs'

type RouteCtx = { params: { folderId: string } }

const driveUrlField = z
  .string()
  .trim()
  .min(12)
  .refine(
    (u) => {
      try {
        const parsed = new URL(u)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
      } catch {
        return false
      }
    },
    'URL inválida.'
  )
  .refine((u) => /drive\.google\.com/i.test(u), 'Use um link de pasta do Google Drive (drive.google.com).')

const patchFolderSchema = z
  .object({
    title: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(120).optional(),
    driveUrl: driveUrlField.optional(),
  })
  .refine((b) => b.title !== undefined || b.driveUrl !== undefined, {
    message: 'Informe título ou URL para atualizar.',
  })

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

export async function PATCH(request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  const folderId = params.folderId?.trim()
  if (!folderId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = patchFolderSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const folder = await prisma.galleryFolder.findUnique({
    where: { id: folderId },
    select: { id: true, eventId: true, driveUrl: true },
  })
  if (!folder) {
    return NextResponse.json({ error: 'Pasta não encontrada.' }, { status: 404 })
  }

  const isR2 = folder.driveUrl.startsWith('r2://')
  if (isR2 && parsed.data.driveUrl !== undefined) {
    return NextResponse.json(
      { error: 'Pastas R2 não permitem alterar a URL; apenas o nome pode ser editado.' },
      { status: 400 }
    )
  }

  await prisma.galleryFolder.update({
    where: { id: folderId },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(!isR2 && parsed.data.driveUrl !== undefined ? { driveUrl: parsed.data.driveUrl } : {}),
    },
  })

  revalidatePath('/admin/projetos')
  revalidatePath(`/admin/projetos/${folder.eventId}`)
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/cliente/evento/${folder.eventId}`)

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  const folderId = params.folderId?.trim()
  if (!folderId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  const folder = await prisma.galleryFolder.findUnique({
    where: { id: folderId },
    select: { id: true, eventId: true, driveUrl: true },
  })
  if (!folder) {
    return NextResponse.json({ error: 'Pasta não encontrada.' }, { status: 404 })
  }

  const prefix = parseR2FolderRef(folder.driveUrl)
  if (prefix) {
    if (!isR2Configured()) {
      return NextResponse.json({ error: 'R2 não configurado; não foi possível apagar arquivos no bucket.' }, { status: 400 })
    }
    await deleteAllObjectsUnderPrefix(prefix)
  }

  await prisma.galleryFolder.delete({ where: { id: folderId } })

  revalidatePath('/admin/projetos')
  revalidatePath(`/admin/projetos/${folder.eventId}`)
  revalidatePath('/admin/upload')
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/cliente/evento/${folder.eventId}`)

  return NextResponse.json({ ok: true })
}
