'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { removeLocalCoverIfExists, saveEventCoverFile } from '@/lib/save-event-cover'
import { createClientSchema, createClientUser } from '@/lib/admin-clients'
import { createEventForAdmin } from '@/lib/admin-events'

const createEventSchema = z.object({
  clientId: z.string().min(10),
  title: z.string().min(2),
  infoText: z.string().optional(),
})

const createFolderSchema = z.object({
  eventId: z.string().min(10),
  title: z.string().min(2),
  driveUrl: z.string().url(),
})

async function ensureAdmin() {
  await requireUser('ADMIN')
}

export async function createClientAction(formData: FormData) {
  await ensureAdmin()

  const parsed = createClientSchema.safeParse({
    name: formData.get('name'),
    username: String(formData.get('username') ?? '').trim().toLowerCase(),
    email: String(formData.get('email') ?? '').trim().toLowerCase(),
    phone: String(formData.get('phone') ?? '').trim().toLowerCase(),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
  }

  const result = await createClientUser(parsed.data)
  if (!result.ok) {
    throw new Error(result.error)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin/clientes')
}

export async function createEventAction(formData: FormData) {
  await ensureAdmin()

  const parsed = createEventSchema.safeParse({
    clientId: formData.get('clientId'),
    title: formData.get('title'),
    infoText: formData.get('infoText'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
  }

  const coverFile = formData.get('cover')
  const result = await createEventForAdmin(
    {
      clientId: parsed.data.clientId,
      title: parsed.data.title,
      infoText: parsed.data.infoText ?? null,
    },
    {
      coverFile: coverFile instanceof File && coverFile.size > 0 ? coverFile : null,
      coverUrlRaw: String(formData.get('coverUrl') ?? '').trim() || null,
    }
  )

  if (!result.ok) {
    throw new Error(result.error)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/admin/projetos')
  revalidatePath('/admin/upload')
  revalidatePath('/cliente', 'layout')
}

const updateEventCoverSchema = z.object({
  eventId: z.string().min(10),
})

export async function updateEventCoverAction(formData: FormData) {
  await ensureAdmin()

  const parsed = updateEventCoverSchema.safeParse({
    eventId: formData.get('eventId'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Evento inválido.')
  }

  const file = formData.get('cover')
  if (!(file instanceof File) || file.size === 0) {
    revalidatePath('/admin')
    revalidatePath('/admin/ferramentas')
    return
  }

  const existing = await prisma.event.findUnique({
    where: { id: parsed.data.eventId },
  })

  if (!existing) {
    throw new Error('Evento não encontrado.')
  }

  const newUrl = await saveEventCoverFile(file)
  await removeLocalCoverIfExists(existing.coverUrl)

  await prisma.event.update({
    where: { id: parsed.data.eventId },
    data: { coverUrl: newUrl },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/ferramentas')
  revalidatePath('/cliente', 'layout')
  revalidatePath(`/cliente/evento/${parsed.data.eventId}`)
}

export async function createFolderAction(formData: FormData) {
  await ensureAdmin()

  const parsed = createFolderSchema.safeParse({
    eventId: formData.get('eventId'),
    title: formData.get('title'),
    driveUrl: formData.get('driveUrl'),
  })

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Dados inválidos.')
  }

  await prisma.galleryFolder.create({
    data: {
      eventId: parsed.data.eventId,
      title: parsed.data.title,
      driveUrl: parsed.data.driveUrl,
    },
  })

  revalidatePath('/admin')
  revalidatePath('/admin/ferramentas')
}
