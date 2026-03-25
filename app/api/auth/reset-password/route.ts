import { NextResponse } from 'next/server'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'
import { sha256 } from '@/lib/password-reset'
import { prisma } from '@/lib/prisma'

const resetSchema = z.object({
  token: z.string().min(10, 'Token inválido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const tokenHash = sha256(parsed.data.token)
  const user = await prisma.user.findFirst({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      mustChangePassword: false,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  })

  return NextResponse.json({ ok: true })
}
