import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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

export async function GET() {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  const { prisma } = await import('@/lib/prisma')
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      createdAt: true,
      clientEvents: {
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return NextResponse.json({ clients })
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { createClientUser, parseCreateClientBody } = await import('@/lib/admin-clients')
  const parsed = parseCreateClientBody(json)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Dados inválidos.'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const result = await createClientUser(parsed.data)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }

  revalidatePath('/admin/clientes')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin')

  return NextResponse.json({ id: result.id }, { status: 201 })
}
