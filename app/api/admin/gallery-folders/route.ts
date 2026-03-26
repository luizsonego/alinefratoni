import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { readSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const driveFolderSchema = z.object({
  eventId: z.string().min(10),
  title: z.string().trim().min(2, 'Nome da pasta deve ter pelo menos 2 caracteres.').max(120),
  driveUrl: z
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
    .refine((u) => /drive\.google\.com/i.test(u), 'Use um link de pasta do Google Drive (drive.google.com).'),
})

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
    where: { eventId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      driveUrl: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ folders })
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { prisma } = await import('@/lib/prisma')

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = driveFolderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 }
    )
  }

  const event = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
    select: { id: true },
  })
  if (!event) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  const folder = await prisma.galleryFolder.create({
    data: {
      eventId: parsed.data.eventId,
      title: parsed.data.title,
      driveUrl: parsed.data.driveUrl,
    },
    select: {
      id: true,
      title: true,
      driveUrl: true,
    },
  })

  revalidatePath('/admin/ferramentas')
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/cliente/evento/${parsed.data.eventId}`)

  return NextResponse.json({ folder }, { status: 201 })
}
