import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertR2KeyAllowedForShare, isShareLinkExpired } from '@/lib/share-links'
import { verifyShareAccessCookie } from '@/lib/share-token'
import { getR2ObjectStreamForResponse, isR2Configured } from '@/lib/r2'
import { r2SdkBodyToWebStream } from '@/lib/r2-response-stream'

export const runtime = 'nodejs'

type RouteCtx = { params: { slug: string } }

export async function GET(request: Request, { params }: RouteCtx) {
  const slug = params.slug?.trim()
  const objectKey = new URL(request.url).searchParams.get('key')?.trim()
  if (!slug || !objectKey) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 não configurado.' }, { status: 400 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      event: { select: { folders: { select: { driveUrl: true } } } },
      folder: { select: { driveUrl: true } },
    },
  })

  if (!share || isShareLinkExpired(share)) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  }

  if (share.passwordHash) {
    const cookieOk = await verifyShareAccessCookie(slug)
    if (!cookieOk) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
  }

  if (!assertR2KeyAllowedForShare(objectKey, share)) {
    return NextResponse.json({ error: 'Acesso negado a este arquivo.' }, { status: 403 })
  }

  try {
    const { body, contentType } = await getR2ObjectStreamForResponse(objectKey)
    const stream = r2SdkBodyToWebStream(body)
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=120',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado no R2.' }, { status: 404 })
  }
}
