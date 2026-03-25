import ClientAreaHeader from '@/components/cliente/ClientAreaHeader'
import EventGridCard from '@/components/cliente/EventGridCard'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type EventListItem = {
  id: string
  title: string
  coverUrl: string | null
  folders: { id: string }[]
}

export default async function ClientePage() {
  const client = await requireUser('CLIENT')

  const events: EventListItem[] = await prisma.event.findMany({
    where: { clientId: client.id },
    include: { folders: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen">
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 md:px-8">
        <ClientAreaHeader
          eyebrow="Área do cliente"
          title="Seus eventos"
          subtitle="Escolha um evento para ver e baixar as fotos."
        />

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
          {events.map((event) => (
            <EventGridCard
              key={event.id}
              href={`/cliente/evento/${event.id}`}
              title={event.title}
              coverUrl={event.coverUrl}
              folderCount={event.folders.length}
            />
          ))}
        </div>

        {!events.length && (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/50 px-6 py-12 text-center text-sm text-zinc-400">
            Nenhum evento disponível no momento.
          </div>
        )}
      </section>
    </main>
  )
}
