'use client'

import { Search, X } from 'lucide-react'
import type { AdminProjectCategory, AdminProjectStatus } from '@/lib/admin-projects'
import { adminCategoryLabels, adminProjectStatusLabels } from '@/lib/admin-projects'

export type ProjectFilterState = {
  query: string
  categories: AdminProjectCategory[]
  statuses: AdminProjectStatus[]
}

type ProjectFiltersProps = {
  filters: ProjectFilterState
  onChange: (f: ProjectFilterState) => void
  totalCount: number
  filteredCount: number
}

const ALL_CATEGORIES: AdminProjectCategory[] = ['FEMININE', 'KIDS', 'EVENT', 'OTHER']
const ALL_STATUSES: AdminProjectStatus[] = ['editing', 'waiting_selection', 'late', 'delivered']

const categoryIcon: Record<AdminProjectCategory, string> = {
  FEMININE: '🌸',
  KIDS: '🧸',
  EVENT: '🎉',
  OTHER: '📁',
}

const statusColor: Record<AdminProjectStatus, string> = {
  editing:           'border-zinc-700 text-zinc-400 data-[active=true]:bg-zinc-700 data-[active=true]:text-zinc-100 data-[active=true]:border-zinc-600',
  waiting_selection: 'border-violet-700/50 text-violet-400 data-[active=true]:bg-violet-500/20 data-[active=true]:text-violet-200 data-[active=true]:border-violet-500/50',
  late:              'border-red-700/50 text-red-400 data-[active=true]:bg-red-500/20 data-[active=true]:text-red-200 data-[active=true]:border-red-500/50',
  delivered:         'border-emerald-700/50 text-emerald-400 data-[active=true]:bg-emerald-500/20 data-[active=true]:text-emerald-200 data-[active=true]:border-emerald-500/50',
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
}

export function ProjectFilters({ filters, onChange, totalCount, filteredCount }: ProjectFiltersProps) {
  const hasActiveFilters =
    filters.query !== '' ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0

  function clearAll() {
    onChange({ query: '', categories: [], statuses: [] })
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar projeto ou cliente…"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/70 py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 outline-none transition focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50"
        />
        {filters.query && (
          <button
            onClick={() => onChange({ ...filters, query: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Category chips */}
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            data-active={filters.categories.includes(cat)}
            onClick={() => onChange({ ...filters, categories: toggleItem(filters.categories, cat) })}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200 data-[active=true]:border-warm-600/60 data-[active=true]:bg-warm-500/10 data-[active=true]:text-warm-300"
          >
            <span>{categoryIcon[cat]}</span>
            {adminCategoryLabels[cat]}
          </button>
        ))}

        <span className="h-4 w-px bg-zinc-800" />

        {/* Status chips */}
        {ALL_STATUSES.map((st) => (
          <button
            key={st}
            type="button"
            data-active={filters.statuses.includes(st)}
            onClick={() => onChange({ ...filters, statuses: toggleItem(filters.statuses, st) })}
            className={`inline-flex items-center rounded-full border bg-zinc-900/50 px-3 py-1 text-xs transition ${statusColor[st]}`}
          >
            {adminProjectStatusLabels[st]}
          </button>
        ))}

        {/* Clear + count */}
        <div className="ml-auto flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-300"
            >
              Limpar filtros
            </button>
          )}
          <p className="text-xs text-zinc-500">
            {filteredCount === totalCount
              ? `${totalCount} projeto${totalCount !== 1 ? 's' : ''}`
              : `${filteredCount} de ${totalCount}`}
          </p>
        </div>
      </div>
    </div>
  )
}
