import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EditClientForm } from '@/components/admin/dashboard/EditClientForm'

type Props = { params: { clientId: string } }

export default async function AdminEditClientePage({ params }: Props) {
  await requireUser('ADMIN')

  const client = await prisma.user.findFirst({
    where: { id: params.clientId, role: 'CLIENT' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
    },
  })

  if (!client) notFound()

  return (
    <EditClientForm
      client={{
        id: client.id,
        name: client.name,
        username: client.username,
        email: client.email,
        phone: client.phone,
      }}
    />
  )
}
