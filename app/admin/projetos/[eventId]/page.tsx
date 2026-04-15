import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { isR2Configured } from '@/lib/r2'
import { getAdminProjectDetail } from '@/lib/admin-projects'
import { ProjectDetailPage } from '@/components/admin/dashboard/ProjectDetailPage'

type Props = { params: { eventId: string } }

export default async function AdminProjectDetailPage({ params }: Props) {
  await requireUser('ADMIN')

  const detail = await getAdminProjectDetail(params.eventId)
  if (!detail) notFound()

  return (
    <ProjectDetailPage
      projectId={detail.id}
      initialTitle={detail.title}
      initialInfoText={detail.infoText}
      initialClientId={detail.clientId}
      initialClientName={detail.clientName}
      initialCoverUrl={detail.rawCoverUrl ?? null}
      initialStatus={detail.status}
      initialCategory={detail.category}
      initialShootDate={detail.shootDate}
      initialDeliveredAt={detail.deliveredAt}
      initialSessionValue={detail.sessionValue}
      photoCount={detail.photoCount}
      videoCount={detail.videoCount}
      initialMedia={detail.media}
      r2Enabled={isR2Configured()}
    />
  )
}
