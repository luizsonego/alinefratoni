import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isShareLinkExpired } from '@/lib/share-links'
import { setShareAccessCookie } from '@/lib/share-token'

export const runtime = 'nodejs'

type RouteCtx = { params: { slug: string } }

export async function POST(request: Request, { params }: RouteCtx) {
  const slug = params.slug?.trim()
  if (!slug) {
    return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { slug },
    select: { passwordHash: true, expiresAt: true },
  })

  if (!share || isShareLinkExpired(share)) {
    return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 404 })
  }

  if (!share.passwordHash) {
    return NextResponse.json({ error: 'Este link não usa senha.' }, { status: 400 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const password = String(body.password ?? '')
  const ok = await verifyPassword(password, share.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }

  await setShareAccessCookie(slug, share.expiresAt)

  return NextResponse.json({ ok: true })
}
