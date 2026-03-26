import { NextResponse } from 'next/server'
import { getR2ObjectStreamForResponse, isR2Configured, isSitePublicAssetObjectKey } from '@/lib/r2'
import { r2SdkBodyToWebStream } from '@/lib/r2-response-stream'

export const runtime = 'nodejs'

/** Entrega imagens públicas do portfólio/site quando não há CDN (R2_PUBLIC_BASE_URL). Somente chaves `site/public/…`. */
export async function GET(request: Request) {
  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Armazenamento não configurado.' }, { status: 503 })
  }

  let key = new URL(request.url).searchParams.get('key')?.trim()
  if (key) {
    try {
      key = decodeURIComponent(key)
    } catch {
      /* já decodificado */
    }
  }
  if (!key || !isSitePublicAssetObjectKey(key)) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  }

  try {
    const { body, contentType } = await getR2ObjectStreamForResponse(key)
    const stream = r2SdkBodyToWebStream(body)
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  }
}
