import { requireUser } from '@/lib/auth'
import { CreateClientForm } from '@/components/admin/dashboard/CreateClientForm'

export default async function AdminNovoClientePage() {
  await requireUser('ADMIN')
  return <CreateClientForm />
}
