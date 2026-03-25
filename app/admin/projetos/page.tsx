import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireUser } from '@/lib/auth'
import { listAdminProjects } from '@/lib/admin-projects'
import { ProjectsList } from '@/components/admin/dashboard/ProjectsList'

export default async function AdminProjectsPage() {
  await requireUser('ADMIN')
  const projects = await listAdminProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href="/admin/projetos/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-warm-900/20 transition hover:bg-warm-500"
        >
          <Plus className="h-4 w-4" />
          Novo projeto
        </Link>
      </div>
      <ProjectsList projects={projects} />
    </div>
  )
}
