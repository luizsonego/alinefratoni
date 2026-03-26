import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteCtx = { params: { folderId: string } }

function isValidDriveUrl(value: string) {
  const url = value.trim()
  if (url.length < 12) return false
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false
  } catch {
    return false
  }
  return /drive\.google\.com/i.test(url)
}

function parsePatchFolderBody(json: unknown):
  | { ok: true; data: { title?: string; driveUrl?: string } }
  | { ok: false; error: string } {
  if (!json || typeof json !== 'object') {
    return { ok: false, error: 'Dados inválidos.' }
  }
  const body = json as Record<string, unknown>
  const out: { title?: string; driveUrl?: string } = {}

  if (body.title !== undefined) {
    if (typeof body.title !== 'string') return { ok: false, error: 'Nome inválido.' }
    const t = body.title.trim()
    if (t.length < 2) return { ok: false, error: 'Nome deve ter pelo menos 2 caracteres.' }
    if (t.length > 120) return { ok: false, error: 'Nome deve ter no máximo 120 caracteres.' }
    out.title = t
  }

  if (body.driveUrl !== undefined) {
    if (typeof body.driveUrl !== 'string') return { ok: false, error: 'URL inválida.' }
    const u = body.driveUrl.trim()
    if (!isValidDriveUrl(u)) {
      return { ok: false, error: 'Use um link de pasta do Google Drive (drive.google.com).' }
    }
    out.driveUrl = u
  }

  if (out.title === undefined && out.driveUrl === undefined) {
    return { ok: false, error: 'Informe título ou URL para atualizar.' }
  }

  return { ok: true, data: out }
}

async function ensureAdminApi() {
  const { readSession } = await import('@/lib/auth')
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

export async function PATCH(request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

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

  const parsed = parsePatchFolderBody(json)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

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
  const { prisma } = await import('@/lib/prisma')
  const { deleteAllObjectsUnderPrefix, isR2Configured, parseR2FolderRef } = await import('@/lib/r2')

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
