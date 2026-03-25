import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ClientsPageContent } from '@/components/admin/dashboard/ClientsPageContent'

export default async function AdminClientesPage() {
  await requireUser('ADMIN')

  const rows = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      createdAt: true,
      clientEvents: {
        select: { id: true, title: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const clients = rows.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  return <ClientsPageContent clients={clients} />
}
