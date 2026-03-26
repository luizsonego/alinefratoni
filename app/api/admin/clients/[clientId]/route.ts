import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/auth'
import { updateClientSchema, updateClientUser } from '@/lib/admin-clients'
import { prisma } from '@/lib/prisma'
import { removeLocalCoverIfExists } from '@/lib/save-event-cover'
import { deleteAllObjectsUnderPrefix, isR2Configured, parseR2FolderRef } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteCtx = { params: { clientId: string } | Promise<{ clientId: string }> }

async function getClientIdFromParams(params: RouteCtx['params']) {
  const resolved = await params
  return resolved?.clientId?.trim() || ''
}

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

  const clientId = await getClientIdFromParams(params)
  if (!clientId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = updateClientSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const result = await updateClientUser(clientId, parsed.data)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }

  revalidatePath('/admin/clientes')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin')
  revalidatePath('/cliente', 'layout')

  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: Request, { params }: RouteCtx) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  const clientId = await getClientIdFromParams(params)
  if (!clientId) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  const existing = await prisma.user.findFirst({
    where: { id: clientId, role: 'CLIENT' },
    select: { id: true },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 })
  }

  const events = await prisma.event.findMany({
    where: { clientId },
    select: {
      coverUrl: true,
      folders: { select: { driveUrl: true } },
    },
  })

  if (isR2Configured()) {
    for (const ev of events) {
      for (const f of ev.folders) {
        const prefix = parseR2FolderRef(f.driveUrl)
        if (prefix) {
          await deleteAllObjectsUnderPrefix(prefix)
        }
      }
    }
  }

  for (const ev of events) {
    await removeLocalCoverIfExists(ev.coverUrl)
  }

  await prisma.user.delete({ where: { id: clientId } })

  revalidatePath('/admin/clientes')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/upload')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin')
  revalidatePath('/cliente', 'layout')

  return NextResponse.json({ ok: true })
}
