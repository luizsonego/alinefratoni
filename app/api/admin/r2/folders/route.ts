import { NextResponse } from 'next/server'
import { z } from 'zod'
import { readSession } from '@/lib/auth'
import { createR2FolderRef, ensureR2Prefix, isR2Configured } from '@/lib/r2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const createFolderSchema = z.object({
  eventId: z.string().min(10),
  title: z.string().min(2),
})

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

async function ensureAdminApi() {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

export async function GET(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  const url = new URL(request.url)
  const eventId = url.searchParams.get('eventId')
  if (!eventId) {
    return NextResponse.json({ error: 'eventId é obrigatório.' }, { status: 400 })
  }

  const folders = await prisma.galleryFolder.findMany({
    where: {
      eventId,
      driveUrl: {
        startsWith: 'r2://',
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      driveUrl: true,
    },
  })

  return NextResponse.json({ folders })
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Cloudflare R2 não configurado.' }, { status: 400 })
  }

  const body = await request.json()
  const parsed = createFolderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
    select: { id: true },
  })
  if (!event) {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }

  const folderSlug = slugify(parsed.data.title) || 'pasta'
  const prefix = `events/${parsed.data.eventId}/${Date.now()}-${folderSlug}/`
  await ensureR2Prefix(prefix)

  const created = await prisma.galleryFolder.create({
    data: {
      eventId: parsed.data.eventId,
      title: parsed.data.title,
      driveUrl: createR2FolderRef(prefix),
    },
    select: {
      id: true,
      title: true,
      driveUrl: true,
    },
  })

  return NextResponse.json({ folder: created }, { status: 201 })
}
