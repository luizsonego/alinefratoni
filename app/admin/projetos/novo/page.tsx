import { requireUser } from '@/lib/auth'
import { CreateProjectForm } from '@/components/admin/dashboard/CreateProjectForm'

export default async function AdminNovoProjetoPage() {
  await requireUser('ADMIN')
  return <CreateProjectForm />
}
