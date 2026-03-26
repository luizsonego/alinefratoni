import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { ShareExpirationPreset, ShareLinkScope } from '@prisma/client'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { createShareLinkWithUniqueSlug } from '@/lib/share-links'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

const createSchema = z.object({
  eventId: z.string().min(10),
  scope: z.nativeEnum(ShareLinkScope),
  folderId: z.string().min(1).nullable().optional(),
  expirationPreset: z.nativeEnum(ShareExpirationPreset),
  password: z.string().optional(),
})

export async function GET(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  const eventId = new URL(request.url).searchParams.get('eventId')?.trim()

  const links = await prisma.shareLink.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      event: {
        select: {
          title: true,
          client: { select: { name: true, phone: true } },
        },
      },
      folder: { select: { title: true } },
    },
  })

  return NextResponse.json({
    links: links.map((l) => ({
      id: l.id,
      slug: l.slug,
      scope: l.scope,
      eventId: l.eventId,
      eventTitle: l.event.title,
      clientName: l.event.client.name,
      clientPhone: l.event.client.phone,
      folderId: l.folderId,
      folderTitle: l.folder?.title ?? null,
      expirationPreset: l.expirationPreset,
      expiresAt: l.expiresAt?.toISOString() ?? null,
      hasPassword: Boolean(l.passwordHash),
      createdAt: l.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const passwordRaw = parsed.data.password?.trim()
  const result = await createShareLinkWithUniqueSlug({
    scope: parsed.data.scope,
    eventId: parsed.data.eventId,
    folderId: parsed.data.folderId ?? null,
    expirationPreset: parsed.data.expirationPreset,
    passwordPlain: passwordRaw && passwordRaw.length > 0 ? passwordRaw : null,
  })

  if ('error' in result && typeof result.error === 'string') {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const link = result as import('@prisma/client').ShareLink

  revalidatePath('/admin/compartilhamento')

  return NextResponse.json(
    {
      link: {
        id: link.id,
        slug: link.slug,
        scope: link.scope,
        eventId: link.eventId,
        folderId: link.folderId,
        expirationPreset: link.expirationPreset,
        expiresAt: link.expiresAt?.toISOString() ?? null,
        hasPassword: Boolean(link.passwordHash),
      },
    },
    { status: 201 }
  )
}
