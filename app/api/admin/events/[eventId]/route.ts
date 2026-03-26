import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { removeLocalCoverIfExists } from '@/lib/save-event-cover'
import { deleteAllObjectsUnderPrefix, isR2Configured, parseR2FolderRef } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const patchEventSchema = z
  .object({
    title: z.string().trim().min(2, 'Título deve ter pelo menos 2 caracteres.').optional(),
    infoText: z.union([z.string(), z.null()]).optional(),
    clientId: z.string().min(10).optional(),
    coverUrl: z
      .union([z.string().url('URL de capa inválida.'), z.literal(''), z.null()])
      .optional(),
  })
  .refine((o) => o.title !== undefined || o.infoText !== undefined || o.clientId !== undefined || o.coverUrl !== undefined, {
    message: 'Nenhum campo para atualizar.',
  })

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

type RouteCtx = { params: { eventId: string } }

export async function PATCH(request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  const eventId = params.eventId?.trim()
  if (!eventId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = patchEventSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, coverUrl: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  if (parsed.data.clientId) {
    const client = await prisma.user.findFirst({
      where: { id: parsed.data.clientId, role: 'CLIENT' },
      select: { id: true },
    })
    if (!client) {
      return NextResponse.json({ error: 'Cliente inválido.' }, { status: 400 })
    }
  }

  const data: {
    title?: string
    infoText?: string | null
    clientId?: string
    coverUrl?: string | null
  } = {}

  if (parsed.data.title !== undefined) data.title = parsed.data.title
  if (parsed.data.infoText !== undefined) {
    data.infoText =
      parsed.data.infoText === null || parsed.data.infoText === ''
        ? null
        : String(parsed.data.infoText)
  }
  if (parsed.data.clientId !== undefined) data.clientId = parsed.data.clientId
  if (parsed.data.coverUrl !== undefined) {
    const raw = parsed.data.coverUrl
    if (raw === '' || raw === null) {
      data.coverUrl = null
    } else {
      data.coverUrl = raw
    }
  }

  await prisma.event.update({
    where: { id: eventId },
    data,
  })

  revalidatePath('/admin')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/upload')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/admin/projetos/${eventId}`)
  revalidatePath(`/cliente/evento/${eventId}`)

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  const eventId = params.eventId?.trim()
  if (!eventId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  const existing = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      coverUrl: true,
      folders: { select: { driveUrl: true } },
    },
  })

  if (!existing) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  if (isR2Configured()) {
    for (const f of existing.folders) {
      const prefix = parseR2FolderRef(f.driveUrl)
      if (prefix) {
        await deleteAllObjectsUnderPrefix(prefix)
      }
    }
  }

  await removeLocalCoverIfExists(existing.coverUrl)

  await prisma.event.delete({
    where: { id: eventId },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/upload')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin/clientes')
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/admin/projetos/${eventId}`)

  return NextResponse.json({ ok: true })
}
