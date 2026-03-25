import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { saveEventCoverFile } from '@/lib/save-event-cover'

const createEventInputSchema = z.object({
  clientId: z.string().min(10, 'Cliente inválido.'),
  title: z.string().trim().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  infoText: z.string().trim().optional().nullable(),
})

export type CreateEventInput = z.infer<typeof createEventInputSchema>

export async function createEventForAdmin(
  input: CreateEventInput,
  options: {
    coverFile?: File | null
    coverUrlRaw?: string | null
  } = {}
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = createEventInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  let coverUrl: string | null = null
  const coverFile = options.coverFile
  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      coverUrl = await saveEventCoverFile(coverFile)
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Falha ao salvar capa.' }
    }
  } else {
    const raw = options.coverUrlRaw?.trim() ?? ''
    if (raw) {
      const urlCheck = z.string().url().safeParse(raw)
      if (!urlCheck.success) {
        return { ok: false, error: 'URL de capa inválida.' }
      }
      coverUrl = urlCheck.data
    }
  }

  const client = await prisma.user.findFirst({
    where: { id: parsed.data.clientId, role: 'CLIENT' },
    select: { id: true },
  })
  if (!client) {
    return { ok: false, error: 'Cliente não encontrado.' }
  }

  const event = await prisma.event.create({
    data: {
      clientId: parsed.data.clientId,
      title: parsed.data.title,
      infoText: parsed.data.infoText || null,
      coverUrl,
    },
    select: { id: true },
  })

  return { ok: true, id: event.id }
}
