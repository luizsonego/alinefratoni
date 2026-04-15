import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const bulkStatusSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(200),
  status: z.enum(['editing', 'waiting_selection', 'late', 'delivered']),
})

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(200),
})

/**
 * PATCH /api/admin/events/bulk
 * Body: { ids: string[], status: AdminProjectStatus }
 *
 * Updates deliveredAt / clears it based on target status.
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireUser('ADMIN')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json().catch(() => null)
  const parsed = bulkStatusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  }

  const { ids, status } = parsed.data

  // Map logical status → deliveredAt update
  // (category / shootDate keep their existing values)
  const data: { deliveredAt: Date | null } = {
    deliveredAt: status === 'delivered' ? new Date() : null,
  }

  await prisma.event.updateMany({
    where: { id: { in: ids } },
    data,
  })

  return NextResponse.json({ ok: true, updated: ids.length })
}

/**
 * DELETE /api/admin/events/bulk
 * Body: { ids: string[] }
 */
export async function DELETE(req: NextRequest) {
  try {
    await requireUser('ADMIN')
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: unknown = await req.json().catch(() => null)
  const parsed = bulkDeleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  }

  const { ids } = parsed.data

  await prisma.event.deleteMany({
    where: { id: { in: ids } },
  })

  return NextResponse.json({ ok: true, deleted: ids.length })
}
