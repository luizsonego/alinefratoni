import { requireUser } from '@/lib/auth'
import { listAdminProjects } from '@/lib/admin-projects'
import { SharingPageContent } from '@/components/admin/dashboard/SharingPageContent'

export default async function AdminSharingPage() {
  await requireUser('ADMIN')
  const projects = await listAdminProjects()

  return (
    <SharingPageContent
      projects={projects.map((p) => ({
        id: p.id,
        title: p.title,
        clientName: p.clientName,
        clientPhone: p.clientPhone,
      }))}
    />
  )
}
