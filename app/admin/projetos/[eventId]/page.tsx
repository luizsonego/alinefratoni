import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { isR2Configured } from '@/lib/r2'
import { getAdminProjectDetail } from '@/lib/admin-projects'
import { ProjectFoldersManager } from '@/components/admin/dashboard/ProjectFoldersManager'
import { ProjectGallery } from '@/components/admin/dashboard/ProjectGallery'
import { ProjectSettingsPanel } from '@/components/admin/dashboard/ProjectSettingsPanel'
import { ProjectUploadWorkspace } from '@/components/admin/dashboard/ProjectUploadWorkspace'

type Props = { params: { eventId: string } }

export default async function AdminProjectDetailPage({ params }: Props) {
  await requireUser('ADMIN')

  const detail = await getAdminProjectDetail(params.eventId)
  if (!detail) notFound()

  return (
    <div className="space-y-10">
      <ProjectSettingsPanel
        projectId={detail.id}
        initialTitle={detail.title}
        initialInfoText={detail.infoText}
        initialClientId={detail.clientId}
        initialCoverUrl={detail.rawCoverUrl ?? ''}
      />
      <ProjectGallery
        project={{
          id: detail.id,
          title: detail.title,
          clientName: detail.clientName,
          photoCount: detail.photoCount,
          videoCount: detail.videoCount,
        }}
        initialMedia={detail.media}
      />
      <ProjectFoldersManager eventId={detail.id} />
      <section>
        <h3 className="mb-3 font-serif text-lg font-semibold text-zinc-100">Upload neste projeto</h3>
        <ProjectUploadWorkspace
          eventId={detail.id}
          eventTitle={detail.title}
          clientName={detail.clientName}
          r2Enabled={isR2Configured()}
        />
      </section>
    </div>
  )
}
