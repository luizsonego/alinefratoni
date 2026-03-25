import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth'
import { isR2ObjectKeyInFolderRefs, loadEventFolderRefs } from '@/lib/r2-event-access'
import { getR2ObjectStreamForResponse, isR2Configured } from '@/lib/r2'
import { r2SdkBodyToWebStream } from '@/lib/r2-response-stream'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  if (!isR2Configured()) {
    return NextResponse.json({ error: 'R2 não configurado.' }, { status: 400 })
  }

  const url = new URL(request.url)
  const eventId = url.searchParams.get('eventId')?.trim()
  const objectKey = url.searchParams.get('key')?.trim()
  if (!eventId || !objectKey) {
    return NextResponse.json({ error: 'Parâmetros eventId e key são obrigatórios.' }, { status: 400 })
  }

  const event = await loadEventFolderRefs(eventId)
  if (!event) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 })
  }

  const refs = event.folders.map((f) => f.driveUrl)
  if (!isR2ObjectKeyInFolderRefs(objectKey, refs)) {
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
