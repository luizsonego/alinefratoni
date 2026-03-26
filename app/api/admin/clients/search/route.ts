import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function ensureAdminApi() {
  const { readSession } = await import('@/lib/auth')
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

  const ci = (value: string) => ({ contains: value, mode: 'insensitive' as const })
  const orFilters = [
    { name: ci(q) },
    { username: ci(q) },
    { email: ci(q) },
    { phone: ci(q) },
  ]

  if (digits.length >= 3) {
    orFilters.push({ phone: ci(digits) })
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
