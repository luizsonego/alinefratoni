import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

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

  const url = new URL(request.url)
  const q = (url.searchParams.get('q') ?? '').trim()
  const digits = q.replace(/\D/g, '')

  const baseSelect = {
    id: true,
    name: true,
    username: true,
    email: true,
    phone: true,
  } as const

  if (!q) {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { name: 'asc' },
      take: 40,
      select: baseSelect,
    })
    return NextResponse.json({ clients })
  }

  const orFilters: Prisma.UserWhereInput[] = [
    { name: { contains: q, mode: 'insensitive' } },
    { username: { contains: q, mode: 'insensitive' } },
    { email: { contains: q, mode: 'insensitive' } },
    { phone: { contains: q, mode: 'insensitive' } },
  ]

  if (digits.length >= 3) {
    orFilters.push({ phone: { contains: digits, mode: 'insensitive' } })
  }

  const clients = await prisma.user.findMany({
    where: {
      role: 'CLIENT',
      OR: orFilters,
    },
    orderBy: { name: 'asc' },
    take: 40,
    select: baseSelect,
  })

  return NextResponse.json({ clients })
}
