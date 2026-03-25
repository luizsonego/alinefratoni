import { NextResponse } from 'next/server'
import { z } from 'zod'
import { loginWithIdentifier } from '@/lib/auth'

const loginSchema = z.object({
  identifier: z.string().min(3, 'Informe usuário, e-mail ou telefone.'),
  password: z.string().min(5, 'Senha inválida.'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
    }

    const user = await loginWithIdentifier(parsed.data.identifier, parsed.data.password)
    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 })
    }

    return NextResponse.json({
      ok: true,
      redirectTo:
        user.role === 'ADMIN'
          ? '/admin'
          : user.mustChangePassword
            ? '/primeiro-acesso'
            : '/cliente',
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao autenticar.' }, { status: 500 })
  }
}
