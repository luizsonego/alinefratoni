import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  createClientAction,
  createEventAction,
  updateEventCoverAction,
} from '../actions'
import LogoutButton from '@/components/LogoutButton'
import R2UploadPanel from '@/components/admin/R2UploadPanel'
import { isR2Configured } from '@/lib/r2'

type ClientRow = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
}

type EventRow = {
  id: string
  title: string
  client: { name: string }
  folders: { id: string }[]
}

export default async function AdminFerramentasPage() {
  const admin = await requireUser('ADMIN')
  const r2Enabled = isR2Configured()

  const [clients, events] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'CLIENT' },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.findMany({
      include: {
        client: true,
        folders: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-400">Integração com banco e R2</p>
          <h1 className="font-serif text-2xl font-semibold text-zinc-50">Olá, {admin.name}</h1>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <form action={createClientAction} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-lg font-semibold">1) Criar cliente</h2>
          <p className="mt-1 text-sm text-zinc-400">Cadastro básico de acesso.</p>
          <div className="mt-5 space-y-3">
            <input name="name" placeholder="Nome" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
            <input name="username" placeholder="Usuário (único)" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
            <input name="email" placeholder="E-mail (opcional)" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
            <input name="phone" placeholder="Telefone (opcional)" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
            <input name="password" type="password" placeholder="Senha" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          </div>
          <button className="mt-4 rounded-md bg-warm-600 px-4 py-2 text-sm font-semibold text-white hover:bg-warm-700">
            Salvar cliente
          </button>
        </form>

        <form
          action={createEventAction}
          encType="multipart/form-data"
          className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6"
        >
          <h2 className="text-lg font-semibold">2) Criar evento</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Envie uma imagem de capa ou use URL externa (opcional).
          </p>
          <div className="mt-5 space-y-3">
            <select name="clientId" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm">
              <option value="">Selecione o cliente</option>
              {clients.map((client: ClientRow) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.username ?? client.email ?? client.phone})
                </option>
              ))}
            </select>
            <input name="title" placeholder="Título do evento" className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
            <label className="block">
              <span className="mb-1 block text-xs text-zinc-400">Capa (upload)</span>
              <input
                name="cover"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-200"
              />
            </label>
            <p className="text-xs text-zinc-500">JPG, PNG, WebP ou GIF · máx. 5MB</p>
            <input
              name="coverUrl"
              placeholder="Ou URL de capa externa (opcional)"
              className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <textarea name="infoText" placeholder="Texto do card esquerdo" rows={4} className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm" />
          </div>
          <button className="mt-4 rounded-md bg-warm-600 px-4 py-2 text-sm font-semibold text-white hover:bg-warm-700">
            Salvar evento
          </button>
        </form>

        <R2UploadPanel
          events={events.map((event: EventRow) => ({
            id: event.id,
            title: event.title,
            clientName: event.client.name,
          }))}
          r2Enabled={r2Enabled}
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold">Resumo rápido</h2>
        <p className="text-sm text-zinc-400">Eventos e pastas cadastrados no sistema.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {events.map((event: EventRow) => (
            <article key={event.id} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
              <h3 className="font-medium">{event.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">Cliente: {event.client.name}</p>
              <p className="mt-1 text-sm text-zinc-500">Pastas vinculadas: {event.folders.length}</p>
              <form
                action={updateEventCoverAction}
                encType="multipart/form-data"
                className="mt-4 flex flex-col gap-2 border-t border-zinc-800 pt-4"
              >
                <input type="hidden" name="eventId" value={event.id} />
                <span className="text-xs text-zinc-400">Trocar capa</span>
                <div className="flex flex-wrap items-end gap-2">
                  <input
                    name="cover"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    required
                    className="min-w-0 flex-1 text-xs file:mr-2 file:rounded file:border-0 file:bg-zinc-800 file:px-2 file:py-1"
                  />
                  <button
                    type="submit"
                    className="rounded-md border border-zinc-600 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                  >
                    Atualizar capa
                  </button>
                </div>
              </form>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
