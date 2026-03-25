import { prisma } from '@/lib/prisma'
import { parseR2FolderRef } from '@/lib/r2'

export function isR2ObjectKeyInFolderRefs(objectKey: string, driveUrls: string[]) {
  for (const ref of driveUrls) {
    const prefix = parseR2FolderRef(ref)
    if (prefix && objectKey.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export async function loadEventFolderRefs(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      clientId: true,
      folders: { select: { driveUrl: true } },
    },
  })
}
