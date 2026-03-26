import { NextResponse } from 'next/server'
import { getR2ObjectStreamForResponse, isR2Configured } from '@/lib/r2'
import { r2SdkBodyToWebStream } from '@/lib/r2-response-stream'
import { resolveObjectKeyFromSiteAssetToken } from '@/lib/site-asset-url'

export const runtime = 'nodejs'

/** Versão pública recomendada: sem `?key=` (compatível com `next/image`). */
export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  if (!isR2Configured()) {
    return NextResponse.json({ error: 'Armazenamento não configurado.' }, { status: 503 })
  }

  const token = params.token
  const objectKey = resolveObjectKeyFromSiteAssetToken(token)
  if (!objectKey) {
    return NextResponse.json({ error: 'Não encontrado.' }, { status: 404 })
  }

  try {
    const { body, contentType } = await getR2ObjectStreamForResponse(objectKey)
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
