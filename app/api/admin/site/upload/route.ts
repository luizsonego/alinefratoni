import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth'
import {
  getSiteAssetsR2Prefix,
  isR2Configured,
  uploadFileToR2Prefix,
} from '@/lib/r2'
import { buildPortfolioImageRefFromObjectKey } from '@/lib/site-asset-url'

export const runtime = 'nodejs'

/** Upload da pasta “site” via app (evita CORS do PUT direto no R2 a partir do navegador). */
export async function POST(request: Request) {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 não configurado.' }, { status: 400 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: 'Arquivo inválido.' }, { status: 400 })
  }

  const nameLooksImage = /\.(jpe?g|png|gif|webp|avif|heic|heif|bmp)$/i.test(file.name)
  if (!file.type.startsWith('image/') && !nameLooksImage) {
    return NextResponse.json(
      { error: 'Use apenas imagens (JPEG, PNG, WebP, HEIC…). Vídeos: aba Hero com URL assinada.' },
      { status: 400 }
    )
  }

  const body = new Uint8Array(await file.arrayBuffer())
  const uploaded = await uploadFileToR2Prefix({
    prefix: getSiteAssetsR2Prefix(),
    filename: file.name,
    contentType: file.type || 'image/jpeg',
    body,
  })

  const publicUrl = uploaded.publicUrl?.trim() || null
  const imageRef = buildPortfolioImageRefFromObjectKey(uploaded.objectKey)

  return NextResponse.json({
    ok: true,
    objectKey: uploaded.objectKey,
    publicUrl,
    imageRef,
    cdnConfigured: Boolean(publicUrl),
  })
}
