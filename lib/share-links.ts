import type { ShareExpirationPreset, ShareLink, ShareLinkScope } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { generateShareSlug } from '@/lib/share-slug'
import { isR2ObjectKeyInFolderRefs } from '@/lib/r2-event-access'

const MS_DAY = 24 * 60 * 60 * 1000

export function computeShareExpiresAt(preset: ShareExpirationPreset, from: Date = new Date()): Date | null {
  switch (preset) {
    case 'NEVER':
      return null
    case 'DAYS_7':
      return new Date(from.getTime() + 7 * MS_DAY)
    case 'DAYS_30':
      return new Date(from.getTime() + 30 * MS_DAY)
    case 'DAYS_90':
      return new Date(from.getTime() + 90 * MS_DAY)
    default:
      return null
  }
}

export type CreateShareLinkInput = {
  scope: ShareLinkScope
  eventId: string
  folderId: string | null
  expirationPreset: ShareExpirationPreset
  passwordPlain: string | null
}

export async function createShareLinkWithUniqueSlug(input: CreateShareLinkInput): Promise<ShareLink | { error: string }> {
  if (input.scope === 'FOLDER' && !input.folderId?.trim()) {
    return { error: 'Pasta é obrigatória para link de pasta.' }
  }
  if (input.scope === 'EVENT' && input.folderId) {
    return { error: 'Link de projeto não deve incluir pasta.' }
  }

  const event = await prisma.event.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  })
  if (!event) {
    return { error: 'Projeto não encontrado.' }
  }

  if (input.scope === 'FOLDER' && input.folderId) {
    const folder = await prisma.galleryFolder.findFirst({
      where: { id: input.folderId, eventId: input.eventId },
      select: { id: true },
    })
    if (!folder) {
      return { error: 'Pasta não pertence a este projeto.' }
    }
  }

  const expiresAt = computeShareExpiresAt(input.expirationPreset)
  const passwordHash =
    input.passwordPlain && input.passwordPlain.trim().length > 0
      ? await hashPassword(input.passwordPlain.trim())
      : null

  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = generateShareSlug(10)
    try {
      return await prisma.shareLink.create({
        data: {
          slug,
          scope: input.scope,
          eventId: input.eventId,
          folderId: input.scope === 'FOLDER' ? input.folderId : null,
          expirationPreset: input.expirationPreset,
          expiresAt,
          passwordHash,
        },
      })
    } catch {
      // slug collision rare — tenta de novo
    }
  }

  return { error: 'Não foi possível gerar um código único. Tente novamente.' }
}

export function isShareLinkExpired(share: Pick<ShareLink, 'expiresAt'>): boolean {
  if (!share.expiresAt) return false
  return share.expiresAt <= new Date()
}

export async function getShareLinkForPublicView(slug: string) {
  return prisma.shareLink.findUnique({
    where: { slug },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          infoText: true,
          coverUrl: true,
          folders: { orderBy: { createdAt: 'asc' }, select: { id: true, title: true, driveUrl: true } },
        },
      },
      folder: { select: { id: true, title: true, driveUrl: true } },
    },
  })
}

export function driveUrlsAllowedForShare(share: {
  scope: ShareLinkScope
  folderId: string | null
  event: { folders: { driveUrl: string }[] }
  folder: { driveUrl: string } | null
}): string[] {
  if (share.scope === 'FOLDER' && share.folder) {
    return [share.folder.driveUrl]
  }
  return share.event.folders.map((f) => f.driveUrl)
}

export function assertR2KeyAllowedForShare(
  objectKey: string,
  share: { scope: ShareLinkScope; folderId: string | null; event: { folders: { driveUrl: string }[] }; folder: { driveUrl: string } | null }
): boolean {
  const refs = driveUrlsAllowedForShare(share)
  return isR2ObjectKeyInFolderRefs(objectKey, refs)
}
