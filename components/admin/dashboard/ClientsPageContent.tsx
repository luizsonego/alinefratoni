'use client'

import { Mail, Pencil, Plus, Send, Smartphone, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card } from '@/components/admin/ui/Card'
import { EmptyState } from '@/components/admin/ui/EmptyState'

export type ClientListItem = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
  createdAt: string
  clientEvents: { id: string; title: string }[]
}

type ClientsPageContentProps = {
  clients: ClientListItem[]
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function ClientsPageContent({ clients }: ClientsPageContentProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function sendAccessViaWhatsApp(client: ClientListItem) {
    if (!client.phone) {
      window.alert('Este cliente não possui telefone cadastrado.')
      return
    }

    const phoneDigits = client.phone.replace(/\D/g, '')
    const defaultPassword = phoneDigits.slice(-5)
    if (!phoneDigits || defaultPassword.length < 5) {
      window.alert('Telefone inválido para envio por WhatsApp.')
      return
    }

    const loginIdentifier = client.username ?? client.email ?? client.phone
    const loginUrl = `${window.location.origin}/login`
    const text = [
      `Olá, ${client.name}!`,
      '',
      'Aqui estão seus dados de acesso:',
      `- Login: ${loginIdentifier}`,
      `- Senha inicial: ${defaultPassword} (5 últimos números do seu telefone)`,
      `- Link: ${loginUrl}`,
      '',
      'No primeiro acesso você poderá criar uma nova senha (ou pular).',
      '',
      'Se precisar de suporte para acessar, me avise.',
    ].join('\n')

    const whatsappUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  async function deleteClient(id: string, name: string) {
    if (
      !window.confirm(
        `Excluir o cliente "${name}" e todos os projetos vinculados? Esta ação não pode ser desfeita.`
      )
    ) {
      return
    }
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/clients/${encodeURIComponent(id)}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        window.alert(data.error ?? 'Não foi possível excluir.')
        return
      }
      router.refresh()
    } catch {
      window.alert('Erro de rede.')
    } finally {
      setDeletingId(null)
    }
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente cadastrado"
        description="Crie o primeiro cliente para vincular eventos e liberar a área do cliente."
        action={
          <Link
            href="/admin/clientes/novo"
            className="rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-warm-500"
          >
            Novo cliente
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
        </p>
        <Link
          href="/admin/clientes/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-warm-900/20 transition hover:bg-warm-500"
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <Card key={c.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-200">
                {initials(c.name)}
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Link>
                <button
                  type="button"
                  disabled={deletingId === c.id}
                  onClick={() => void deleteClient(c.id, c.name)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
                <button
                  type="button"
                  onClick={() => sendAccessViaWhatsApp(c)}
                  className="rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5" /> Enviar acesso
                  </span>
                </button>
              </div>
            </div>
            <h3 className="mt-4 font-serif text-lg font-semibold text-zinc-100">{c.name}</h3>
            {c.username ? (
              <p className="mt-1 text-xs text-zinc-600">
                Usuário: <span className="text-zinc-400">{c.username}</span>
              </p>
            ) : null}
            <div className="mt-3 space-y-2 text-sm text-zinc-500">
              {c.email ? (
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" /> {c.email}
                </p>
              ) : (
                <p className="text-zinc-600">Sem e-mail</p>
              )}
              {c.phone ? (
                <p className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 shrink-0" /> {c.phone}
                </p>
              ) : (
                <p className="text-zinc-600">Sem telefone</p>
              )}
            </div>
            <div className="mt-4 border-t border-zinc-800 pt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Projetos</p>
              {c.clientEvents.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-600">Nenhum evento vinculado</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {c.clientEvents.map((ev) => (
                    <li key={ev.id}>
                      <Link
                        href={`/admin/projetos/${ev.id}`}
                        className="text-sm text-warm-400 hover:text-warm-300"
                      >
                        {ev.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-4 text-xs text-zinc-600">
              Cadastro: {new Date(c.createdAt).toLocaleString('pt-BR')}
            </p>
          </Card>
        ))}
      </div>

      <Card padding="md">
        <h3 className="font-serif text-base font-semibold text-zinc-100">Histórico de acessos</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Em breve: registros reais de login e downloads por cliente.
        </p>
      </Card>
    </div>
  )
}
