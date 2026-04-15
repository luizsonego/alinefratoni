import { requireUser } from '@/lib/auth'
import { listAdminClients } from '@/lib/admin-clients'
import { ClientsPageContent } from '@/components/admin/dashboard/ClientsPageContent'

export const metadata = {
  title: 'Clientes | Admin',
}

export default async function AdminClientesPage() {
  await requireUser('ADMIN')
  const clients = await listAdminClients()
  return <ClientsPageContent clients={clients} />
}
