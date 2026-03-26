import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { readSession } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type RouteCtx = { params: { linkId: string } }

export async function DELETE(_request: Request, { params }: RouteCtx) {
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  const { prisma } = await import('@/lib/prisma')

  const id = params.linkId?.trim()
  if (!id) {
    return NextResponse.json({ error: 'ID inválido.' }, { status: 400 })
  }

  try {
    await prisma.shareLink.delete({ where: { id } })
  } catch {
    return NextResponse.json({ error: 'Link não encontrado.' }, { status: 404 })
  }

  revalidatePath('/admin/compartilhamento')

  return NextResponse.json({ ok: true })
}
