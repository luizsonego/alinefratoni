'use client'

import { Calendar, FolderOpen, Grid3X3, List, Share2, Trash2, Upload, Wifi, WifiOff } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import type { AdminProjectRow } from '@/lib/admin-projects'
import { Card } from '@/components/admin/ui/Card'
import { Dropdown, DropdownItem } from '@/components/admin/ui/Dropdown'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { Tooltip } from '@/components/admin/ui/Tooltip'
import { StatusBadge } from '@/components/admin/dashboard/StatusBadge'
import { BulkActionBar } from '@/components/admin/dashboard/BulkActionBar'
import {
  ProjectFilters,
  type ProjectFilterState,
} from '@/components/admin/dashboard/ProjectFilters'

const PAGE_SIZE = 48

type ProjectsListProps = {
  projects: AdminProjectRow[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

// ─── Quick View Overlay ────────────────────────────────────────────────────────

function QuickView({ p }: { p: AdminProjectRow }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-black/10 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div className="translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Quick View
        </p>
        <h4 className="mt-1 font-serif text-base font-semibold text-white">{p.title}</h4>
        <p className="mt-0.5 text-xs text-zinc-300">{p.clientName}</p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/10 px-2.5 py-2 backdrop-blur-sm">
            <p className="text-[10px] text-zinc-400">Ensaio</p>
            <p className="text-xs font-medium text-white">
              {p.shootDate ? formatDate(p.shootDate) : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-white/10 px-2.5 py-2 backdrop-blur-sm">
            <p className="text-[10px] text-zinc-400">Pastas</p>
            <p className="text-xs font-medium text-white">{p.folderCount}</p>
          </div>
        </div>

        {p.sessionValue != null && p.sessionValue > 0 && (
          <p className="mt-2 text-xs text-warm-300">
            {p.sessionValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── R2 Badge ─────────────────────────────────────────────────────────────────

function R2Badge({ online }: { online: boolean }) {
  return (
    <span
      title={online ? 'Pasta R2 detectada' : 'Sem arquivos no R2'}
      className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
        online
          ? 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30'
          : 'bg-zinc-800/80 text-zinc-500 ring-zinc-700/30'
      }`}
    >
      {online ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
      {online ? 'Online' : 'Offline'}
    </span>
  )
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function ProjectGridCard({
  p,
  selected,
  selectionMode,
  onToggleSelect,
  onDelete,
  deleting,
}: {
  p: AdminProjectRow
  selected: boolean
  selectionMode: boolean
  onToggleSelect: () => void
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <Card padding="none" className={`group relative overflow-hidden transition-all duration-200 ${selected ? 'ring-2 ring-warm-500/60' : ''}`}>
      {/* Checkbox overlay for bulk select */}
      {selectionMode && (
        <button
          type="button"
          onClick={onToggleSelect}
          className="absolute left-2 top-2 z-20 flex h-5 w-5 items-center justify-center rounded-md border-2 border-zinc-400 bg-zinc-900/80 backdrop-blur-sm transition"
          style={{ borderColor: selected ? '#dd6b20' : undefined, background: selected ? '#dd6b20' : undefined }}
        >
          {selected && <span className="text-[10px] text-white">✓</span>}
        </button>
      )}

      <Link href={`/admin/projetos/${p.id}`} className="block" onClick={selectionMode ? (e) => { e.preventDefault(); onToggleSelect() } : undefined}>
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
          <Image
            src={p.coverUrl}
            alt=""
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, 33vw"
            unoptimized={p.coverUrl.startsWith('http')}
          />

          {/* Quick view overlay */}
          <QuickView p={p} />

          {/* Top badges */}
          <R2Badge online={p.r2Online} />
          <span className="absolute right-3 top-3 z-10">
            <StatusBadge status={p.status} />
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3">
        <div className="min-w-0 flex-1">
          <Link href={`/admin/projetos/${p.id}`}>
            <h3 className="truncate font-serif text-sm font-semibold text-zinc-100 hover:text-warm-400">{p.title}</h3>
          </Link>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{p.clientName}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!selectionMode && (
            <ProjectQuickActions
              projectId={p.id}
              onDelete={onDelete}
              deleting={deleting}
              onToggleSelect={onToggleSelect}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── Quick Actions ─────────────────────────────────────────────────────────────

function ProjectQuickActions({
  projectId,
  onDelete,
  deleting,
  onToggleSelect,
}: {
  projectId: string
  onDelete: () => void
  deleting: boolean
  onToggleSelect: () => void
}) {
  return (
    <div className="flex items-center gap-0.5">
      <Tooltip label="Abrir galeria">
        <Link
          href={`/admin/projetos/${projectId}`}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <FolderOpen className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Tooltip label="Compartilhar">
        <Link
          href="/admin/compartilhamento"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Share2 className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Tooltip label="Upload">
        <Link
          href={`/admin/upload?eventId=${encodeURIComponent(projectId)}`}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Upload className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Dropdown label="Mais">
        <div className="p-1">
          <DropdownItem onClick={onToggleSelect}>
            <span className="inline-flex items-center gap-2 text-zinc-300">☑ Selecionar</span>
          </DropdownItem>
          <DropdownItem
            danger
            onClick={() => {
              if (!deleting) onDelete()
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Excluindo…' : 'Excluir'}
            </span>
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState<ProjectFilterState>({
    query: '',
    categories: [],
    statuses: [],
  })

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = projects

    if (filters.query) {
      const q = filters.query.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.clientName.toLowerCase().includes(q)
      )
    }

    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category))
    }

    if (filters.statuses.length > 0) {
      result = result.filter((p) => filters.statuses.includes(p.status))
    }

    return result
  }, [projects, filters])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

  // ── Selection ──────────────────────────────────────────────────────────────

  const selectionMode = selectedIds.length > 0

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function deleteProject(projectId: string, title: string) {
    if (!window.confirm(`Excluir o projeto «${title}»? Pastas e vínculos serão removidos.`)) return
    setDeletingId(projectId)
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        window.alert(data.error ?? 'Não foi possível excluir.')
        return
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Nenhum projeto ainda"
        description="Crie um projeto, vincule a um cliente e envie fotos (R2) ou cadastre vídeos pelo Google Drive."
        action={
          <Link
            href="/admin/projetos/novo"
            className="rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-500"
          >
            Novo projeto
          </Link>
        }
      />
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-5">
        {/* Filters bar */}
        <ProjectFilters
          filters={filters}
          onChange={(f) => { setFilters(f); setPage(1) }}
          totalCount={projects.length}
          filteredCount={filtered.length}
        />

        {/* View toggle + hint */}
        <div className="flex items-center justify-between gap-4">
          {selectionMode ? (
            <p className="text-xs text-zinc-500">
              Clique nos cards para (des)selecionar
            </p>
          ) : (
            <p className="text-xs text-zinc-600">
              Dica: use "Mais" → "Selecionar" para ações em massa
            </p>
          )}
          <div className="flex rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${
                view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-zinc-400">Nenhum projeto encontrado</p>
            <button
              onClick={() => setFilters({ query: '', categories: [], statuses: [] })}
              className="text-sm text-warm-400 underline underline-offset-2"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Grid view */}
        {view === 'grid' && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((p) => (
              <ProjectGridCard
                key={p.id}
                p={p}
                selected={selectedIds.includes(p.id)}
                selectionMode={selectionMode}
                onToggleSelect={() => toggleSelect(p.id)}
                onDelete={() => void deleteProject(p.id, p.title)}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {view === 'list' && filtered.length > 0 && (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="w-8 px-4 py-3">
                      <input
                        type="checkbox"
                        className="rounded border-zinc-700 bg-zinc-900"
                        checked={selectedIds.length === paginated.length && paginated.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedIds(paginated.map((p) => p.id))
                          else setSelectedIds([])
                        }}
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Projeto</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Ensaio</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">R2</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-b border-zinc-800/80 transition hover:bg-zinc-900/40 ${
                        selectedIds.includes(p.id) ? 'bg-warm-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="rounded border-zinc-700 bg-zinc-900"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                            <Image src={p.coverUrl} alt="" fill className="object-cover" sizes="48px" unoptimized={p.coverUrl.startsWith('http')} />
                          </div>
                          <Link href={`/admin/projetos/${p.id}`} className="font-medium text-zinc-100 hover:text-warm-400">
                            {p.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{p.clientName}</td>
                      <td className="px-4 py-3 text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {p.shootDate ? formatDate(p.shootDate) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex h-2 w-2 rounded-full ${p.r2Online ? 'bg-emerald-400' : 'bg-zinc-600'}`} title={p.r2Online ? 'Online' : 'Offline'} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <ProjectQuickActions
                          projectId={p.id}
                          onDelete={() => void deleteProject(p.id, p.title)}
                          deleting={deletingId === p.id}
                          onToggleSelect={() => toggleSelect(p.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200"
            >
              Carregar mais ({filtered.length - paginated.length} restantes)
            </button>
          </div>
        )}
      </div>

      {/* Bulk action floating bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
