'use client'

import { Calendar, Crown, Mail, Pencil, Send, Smartphone, Star, Trash2, Users } from 'lucide-react'
import { CdnImage } from '@/components/CdnImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { AdminClientRow, ClientLoyaltyTier } from '@/lib/admin-clients'
import { ADMIN_PROJECT_FALLBACK_COVER } from '@/lib/admin-projects'

// ─── Loyalty badge ────────────────────────────────────────────────────────────

const loyaltyConfig: Record<
  ClientLoyaltyTier,
  { label: string; color: string; icon: React.ReactNode }
> = {
  nova: {
    label: 'Nova',
    color: 'bg-zinc-700/40 text-zinc-400 ring-zinc-600/30',
    icon: <Users className="h-3 w-3" />,
  },
  recorrente: {
    label: 'Recorrente',
    color: 'bg-sky-500/15 text-sky-300 ring-sky-500/25',
    icon: <Star className="h-3 w-3" />,
  },
  vip: {
    label: 'VIP',
    color: 'bg-warm-500/15 text-warm-300 ring-warm-500/25',
    icon: <Crown className="h-3 w-3" />,
  },
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'from-rose-500 to-pink-700',
  'from-violet-500 to-purple-700',
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-amber-500 to-orange-700',
  'from-indigo-500 to-blue-600',
]

function avatarGradient(name: string) {
  const code = name.charCodeAt(0) + (name.charCodeAt(1) ?? 0)
  return AVATAR_GRADIENTS[code % AVATAR_GRADIENTS.length]
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

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── ClientProfileCard ───────────────────────────────────────────────────────

type ClientProfileCardProps = {
  client: AdminClientRow
  onDelete: () => void
  deleting: boolean
  onSendAccess: () => void
}

export function ClientProfileCard({ client: c, onDelete, deleting, onSendAccess }: ClientProfileCardProps) {
  const [expanded, setExpanded] = useState(false)
  const loyalty = loyaltyConfig[c.loyaltyTier]
  const isNextContactSoon =
    c.nextContactDate != null &&
    new Date(c.nextContactDate).getTime() - Date.now() < 7 * 86400000

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 transition-all duration-300 hover:border-zinc-700/80 hover:bg-zinc-900/90">

      {/* Top accent line by tier */}
      <div
        className={`h-0.5 w-full ${
          c.loyaltyTier === 'vip'
            ? 'bg-gradient-to-r from-warm-600 to-warm-400'
            : c.loyaltyTier === 'recorrente'
            ? 'bg-gradient-to-r from-sky-700 to-sky-500'
            : 'bg-zinc-800'
        }`}
      />

      <div className="flex flex-col gap-4 p-5">
        {/* Header: avatar + name + tier + actions */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-lg ${avatarGradient(c.name)}`}
          >
            {initials(c.name)}
          </div>

          {/* Name + tier */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-serif text-base font-semibold text-zinc-100">{c.name}</h3>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${loyalty.color}`}
              >
                {loyalty.icon}
                {loyalty.label}
              </span>
            </div>
            {c.username && (
              <p className="mt-0.5 truncate text-xs text-zinc-600">@{c.username}</p>
            )}
          </div>

          {/* Kebab actions */}
          <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Link
              href={`/admin/clientes/${c.id}`}
              title="Editar"
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              title="Enviar acesso"
              onClick={onSendAccess}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={deleting}
              title="Excluir"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-900/40 hover:text-red-300 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-xs text-zinc-500">
          {c.email ? (
            <p className="flex items-center gap-2 truncate">
              <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              {c.email}
            </p>
          ) : null}
          {c.phone ? (
            <p className="flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              {c.phone}
            </p>
          ) : null}
        </div>

        {/* CRM metrics row */}
        <div className="grid grid-cols-3 divide-x divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950/50">
          <div className="px-3 py-2.5 text-center">
            <p className="text-xs text-zinc-600">Ensaios</p>
            <p className="mt-0.5 text-base font-semibold text-zinc-200">{c.projectCount}</p>
          </div>
          <div className="px-3 py-2.5 text-center">
            <p className="text-xs text-zinc-600">LTV</p>
            <p className="mt-0.5 text-sm font-semibold text-warm-400">
              {c.ltv > 0 ? formatCurrency(c.ltv) : '—'}
            </p>
          </div>
          <div className="px-3 py-2.5 text-center">
            <p className="text-xs text-zinc-600">Desde</p>
            <p className="mt-0.5 text-xs font-medium text-zinc-400">
              {new Date(c.createdAt).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Next contact banner */}
        {c.nextContactDate ? (
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
              isNextContactSoon
                ? 'border border-warm-700/40 bg-warm-500/10 text-warm-300'
                : 'border border-zinc-800 bg-zinc-950/40 text-zinc-500'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>
              {isNextContactSoon ? '⚡ ' : ''}
              Próximo contato sugerido:{' '}
              <span className={isNextContactSoon ? 'font-semibold text-warm-200' : 'text-zinc-400'}>
                {formatDate(c.nextContactDate)}
              </span>
            </span>
          </div>
        ) : null}

        {/* Recent projects mini-gallery */}
        {c.recentProjects.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-zinc-600 hover:text-zinc-400"
            >
              Projetos recentes
              <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">
                {c.projectCount}
              </span>
            </button>
            {expanded && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {c.recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/projetos/${p.id}`}
                    className="group/mini relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-zinc-800"
                  >
                    <CdnImage
                      src={p.coverUrl || ADMIN_PROJECT_FALLBACK_COVER}
                      alt={p.title}
                      fill
                      className="object-cover transition group-hover/mini:scale-105"
                      sizes="96px"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent p-1">
                      <span className="line-clamp-1 text-[9px] font-medium text-zinc-200">{p.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
