'use client'

import { Plus, Search, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { AdminClientRow } from '@/lib/admin-clients'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { ClientProfileCard } from '@/components/admin/dashboard/ClientProfileCard'

// ── Keep backward-compat re-export so existing server component keeps working ──
export type { ClientListItem } from '@/lib/admin-clients'

type ClientsPageContentProps = {
  clients: AdminClientRow[]
}

export function ClientsPageContent({ clients }: ClientsPageContentProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!query) return clients
    const q = query.toLowerCase()
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    )
  }, [clients, query])

  // ── Stats ────────────────────────────────────────────────────────────────────

  const totalLtv = clients.reduce((sum, c) => sum + c.ltv, 0)
  const vipCount = clients.filter((c) => c.loyaltyTier === 'vip').length

  // ── Actions ──────────────────────────────────────────────────────────────────

  function sendAccessViaWhatsApp(c: AdminClientRow) {
    if (!c.phone) {
      window.alert('Este cliente não possui telefone cadastrado.')
      return
    }
    const phoneDigits = c.phone.replace(/\D/g, '')
    const defaultPassword = phoneDigits.slice(-5)
    if (!phoneDigits || defaultPassword.length < 5) {
      window.alert('Telefone inválido para envio por WhatsApp.')
      return
    }
    const loginIdentifier = c.username ?? c.email ?? c.phone
    const loginUrl = `${window.location.origin}/login`
    const text = [
      `Olá, ${c.name}!`,
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
    ) return

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

  // ── Empty ────────────────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header + stat metrics */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Summary metrics */}
        <div className="flex flex-wrap gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs text-zinc-600">Total clientes</p>
            <p className="mt-0.5 text-xl font-semibold text-zinc-100">{clients.length}</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs text-zinc-600">LTV total</p>
            <p className="mt-0.5 text-xl font-semibold text-warm-400">
              {totalLtv > 0
                ? totalLtv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : '—'}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3">
            <p className="text-xs text-zinc-600">Clientes VIP</p>
            <p className="mt-0.5 text-xl font-semibold text-zinc-100">{vipCount}</p>
          </div>
        </div>

        <Link
          href="/admin/clientes/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-warm-900/20 transition hover:bg-warm-500"
        >
          <Plus className="h-4 w-4" />
          Novo cliente
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar por nome, e-mail ou telefone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Count after filter */}
      {query && (
        <p className="text-xs text-zinc-500">
          {filtered.length} de {clients.length} clientes
        </p>
      )}

      {/* Client cards grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <ClientProfileCard
              key={c.id}
              client={c}
              onDelete={() => void deleteClient(c.id, c.name)}
              deleting={deletingId === c.id}
              onSendAccess={() => sendAccessViaWhatsApp(c)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-zinc-400">Nenhum cliente encontrado</p>
          <button
            onClick={() => setQuery('')}
            className="text-sm text-warm-400 underline underline-offset-2"
          >
            Limpar busca
          </button>
        </div>
      )}
    </div>
  )
}
