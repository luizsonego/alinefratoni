'use client'

import { Archive, CheckCircle, Clock, Loader2, PenLine, X } from 'lucide-react'
import { useState } from 'react'
import type { AdminProjectStatus } from '@/lib/admin-projects'
import { adminProjectStatusLabels } from '@/lib/admin-projects'

type BulkActionBarProps = {
  selectedIds: string[]
  onClear: () => void
  onSuccess: () => void
}

const STATUS_OPTIONS: AdminProjectStatus[] = ['editing', 'waiting_selection', 'delivered']

const statusIcon: Record<AdminProjectStatus, React.ReactNode> = {
  editing: <PenLine className="h-3.5 w-3.5" />,
  waiting_selection: <Clock className="h-3.5 w-3.5" />,
  late: <Clock className="h-3.5 w-3.5" />,
  delivered: <CheckCircle className="h-3.5 w-3.5" />,
}

export function BulkActionBar({ selectedIds, onClear, onSuccess }: BulkActionBarProps) {
  const [loading, setLoading] = useState(false)

  if (selectedIds.length === 0) return null

  async function applyBulkStatus(status: AdminProjectStatus) {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        window.alert(data.error ?? 'Erro ao atualizar projetos.')
        return
      }
      onSuccess()
      onClear()
    } finally {
      setLoading(false)
    }
  }

  async function bulkDelete() {
    if (!window.confirm(`Excluir ${selectedIds.length} projeto(s)? Esta ação não pode ser desfeita.`)) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        window.alert(data.error ?? 'Erro ao excluir projetos.')
        return
      }
      onSuccess()
      onClear()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-2 fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-900/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}

      <span className="min-w-[80px] text-sm font-medium text-zinc-200">
        {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
      </span>

      <span className="h-5 w-px bg-zinc-700" />

      <span className="text-xs text-zinc-500">Mudar status:</span>
      {STATUS_OPTIONS.map((st) => (
        <button
          key={st}
          type="button"
          disabled={loading}
          onClick={() => void applyBulkStatus(st)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-50"
        >
          {statusIcon[st]}
          {adminProjectStatusLabels[st]}
        </button>
      ))}

      <span className="h-5 w-px bg-zinc-700" />

      <button
        type="button"
        disabled={loading}
        onClick={() => void bulkDelete()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
      >
        <Archive className="h-3.5 w-3.5" />
        Excluir
      </button>

      <button
        type="button"
        onClick={onClear}
        className="ml-1 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
