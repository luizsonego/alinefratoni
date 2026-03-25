import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword, readSession, verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const changeSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
})

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

  const parsed = changeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, passwordHash: true },
  })
  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
  }

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  })

  return NextResponse.json({ ok: true })
}
