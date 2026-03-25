import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendEmail } from '@/lib/mailer'
import { makePasswordResetToken } from '@/lib/password-reset'
import { prisma } from '@/lib/prisma'

const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email('Informe um e-mail válido.'),
})

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const parsed = forgotSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { email: parsed.data.email },
    select: { id: true, email: true, name: true },
  })

  // Não revela existência do e-mail
  if (!user?.email) {
    return NextResponse.json({ ok: true })
  }

  const { token, tokenHash, expiresAt } = makePasswordResetToken()
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: expiresAt,
    },
  })

  const appUrl = process.env.APP_URL ?? new URL(req.url).origin
  const resetUrl = `${appUrl}/resetar-senha?token=${encodeURIComponent(token)}`

  const text = [
    `Olá, ${user.name}!`,
    '',
    'Recebemos uma solicitação para redefinir sua senha.',
    `Acesse o link abaixo para criar uma nova senha:`,
    resetUrl,
    '',
    'Este link expira em 30 minutos.',
    'Se você não solicitou, ignore este e-mail.',
  ].join('\n')

  try {
    await sendEmail({
      to: user.email,
      subject: 'Redefinição de senha',
      text,
    })
  } catch {
    return NextResponse.json({ error: 'Falha ao enviar e-mail de recuperação.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
