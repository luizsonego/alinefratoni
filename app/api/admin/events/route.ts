import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function ensureAdminApi() {
  const { readSession } = await import('@/lib/auth')
  const session = await readSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
  }
  return null
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi()
  if (unauthorized) return unauthorized
  const { createEventForAdmin } = await import('@/lib/admin-events')

  const formData = await request.formData()
  const coverFile = formData.get('cover')
  const coverUrlRaw = String(formData.get('coverUrl') ?? '').trim()

  const result = await createEventForAdmin(
    {
      clientId: String(formData.get('clientId') ?? ''),
      title: String(formData.get('title') ?? ''),
      infoText: String(formData.get('infoText') ?? '').trim() || null,
    },
    {
      coverFile: coverFile instanceof File && coverFile.size > 0 ? coverFile : null,
      coverUrlRaw: coverUrlRaw || null,
    }
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  revalidatePath('/admin')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/upload')
  revalidatePath('/cliente', 'layout')

  return NextResponse.json({ id: result.id }, { status: 201 })
}
