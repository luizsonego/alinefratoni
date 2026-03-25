import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, readSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const firstAccessSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('skip') }),
  z.object({
    action: z.literal('change'),
    password: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
  }),
])

export async function POST(req: Request) {
  const session = await readSession()
  if (!session || session.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = firstAccessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  if (parsed.data.action === 'skip') {
    await prisma.user.update({
      where: { id: session.sub },
      data: { mustChangePassword: false },
    })
    return NextResponse.json({ ok: true, redirectTo: '/cliente' })
  }

  await prisma.user.update({
    where: { id: session.sub },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: false,
    },
  })

  return NextResponse.json({ ok: true, redirectTo: '/cliente' })
}
