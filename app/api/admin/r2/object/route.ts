import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { deleteR2ObjectKey, isR2Configured, parseR2FolderRef } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  eventId: z.string().min(10),
  objectKey: z.string().min(1),
})

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

function objectKeyAllowedForEvent(objectKey: string, folderRefs: string[]) {
  for (const ref of folderRefs) {
    const prefix = parseR2FolderRef(ref)
    if (prefix && objectKey.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export async function DELETE(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Cloudflare R2 não configurado.' }, { status: 400 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
    select: {
      id: true,
      folders: { select: { driveUrl: true } },
    },
  })
  if (!event) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  const refs = event.folders.map((f) => f.driveUrl)
  if (!objectKeyAllowedForEvent(parsed.data.objectKey, refs)) {
    return NextResponse.json({ error: 'Chave não pertence a este projeto.' }, { status: 403 })
  }

  await deleteR2ObjectKey(parsed.data.objectKey)

  revalidatePath('/admin/projetos')
  revalidatePath(`/admin/projetos/${event.id}`)
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/cliente/evento/${event.id}`)

  return NextResponse.json({ ok: true })
}
