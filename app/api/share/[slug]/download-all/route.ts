import { NextResponse } from 'next/server'
import { zipDownloadFilename } from '@/lib/download-in-browser'
import { buildEventMediaZipBuffer } from '@/lib/event-zip-download'
import { isShareLinkExpired } from '@/lib/share-links'
import { verifyShareAccessCookie } from '@/lib/share-token'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type RouteCtx = { params: { slug: string } }

export async function GET(_req: Request, { params }: RouteCtx) {
  const slug = params.slug?.trim()
  if (!slug) {
    return NextResponse.json({ error: 'Slug inválido.' }, { status: 400 })
  }

  const share = await prisma.shareLink.findUnique({
    where: { slug },
    include: {
      event: {
        select: {
          title: true,
          folders: { orderBy: { createdAt: 'asc' }, select: { title: true, driveUrl: true } },
        },
      },
      folder: { select: { title: true, driveUrl: true } },
    },
  })

  if (!share || isShareLinkExpired(share)) {
    return NextResponse.json({ error: 'Link inválido ou expirado.' }, { status: 404 })
  }

  if (share.passwordHash) {
    const ok = await verifyShareAccessCookie(slug)
    if (!ok) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
  }

  if (share.scope === 'FOLDER' && !share.folder) {
    return NextResponse.json({ error: 'Pasta não encontrada.' }, { status: 404 })
  }

  const folders =
    share.scope === 'FOLDER' && share.folder
      ? [{ title: share.folder.title, driveUrl: share.folder.driveUrl }]
      : share.event.folders.map((f) => ({ title: f.title, driveUrl: f.driveUrl }))

  if (folders.length === 0) {
    return NextResponse.json({ error: 'Nenhuma pasta neste link.' }, { status: 400 })
  }

  const result = await buildEventMediaZipBuffer(folders)

  if ('error' in result && typeof result.error === 'string') {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  const buffer = result as Buffer
  const filename = zipDownloadFilename(share.event.title)

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Length': String(buffer.length),
    },
  })
}
