import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isR2Configured } from '@/lib/r2'
import { ProjectUploadWorkspace } from '@/components/admin/dashboard/ProjectUploadWorkspace'
import { UploadHubContent } from '@/components/admin/dashboard/UploadHubContent'

type Props = {
  searchParams: { eventId?: string }
}

export default async function AdminUploadPage({ searchParams }: Props) {
  await requireUser('ADMIN')

  const eventId = searchParams.eventId?.trim()
  if (!eventId) {
    return <UploadHubContent />
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { client: { select: { name: true } } },
  })

  if (!event) {
    notFound()
  }

  return (
    <ProjectUploadWorkspace
      eventId={event.id}
      eventTitle={event.title}
      clientName={event.client.name}
      r2Enabled={isR2Configured()}
    />
  )
}
