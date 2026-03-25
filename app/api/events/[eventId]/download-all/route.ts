import { NextResponse } from 'next/server'
import { readSession } from '@/lib/auth'
import { buildEventMediaZipBuffer } from '@/lib/event-zip-download'
import { zipDownloadFilename } from '@/lib/download-in-browser'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await readSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  const event =
    session.role === 'ADMIN'
      ? await prisma.event.findUnique({
          where: { id: params.eventId },
          include: { folders: true },
        })
      : await prisma.event.findFirst({
          where: {
            id: params.eventId,
            clientId: session.sub,
          },
          include: { folders: true },
        })

  if (!event) {
    return NextResponse.json({ error: 'Evento não encontrado.' }, { status: 404 })
  }

  if (event.folders.length === 0) {
    return NextResponse.json({ error: 'Nenhuma pasta neste projeto.' }, { status: 400 })
  }

  const result = await buildEventMediaZipBuffer(
    event.folders.map((f) => ({ title: f.title, driveUrl: f.driveUrl }))
  )

  if ('error' in result && typeof result.error === 'string') {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const buffer = result as Buffer
  const filename = zipDownloadFilename(event.title)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(buffer.length),
    },
  })
}
