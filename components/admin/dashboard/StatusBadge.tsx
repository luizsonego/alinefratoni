import type { AdminProjectStatus } from '@/lib/admin-projects'
import { adminProjectStatusLabels } from '@/lib/admin-projects'

const statusStyle: Record<AdminProjectStatus, string> = {
  editing:           'bg-zinc-700/40 text-zinc-300 ring-zinc-600/30',
  waiting_selection: 'bg-violet-500/15 text-violet-300 ring-violet-500/25',
  late:              'bg-red-500/15 text-red-300 ring-red-500/25',
  delivered:         'bg-emerald-500/15 text-emerald-300 ring-emerald-500/25',
}

const statusDot: Record<AdminProjectStatus, string> = {
  editing:           'bg-zinc-400',
  waiting_selection: 'bg-violet-400',
  late:              'bg-red-400 animate-pulse',
  delivered:         'bg-emerald-400',
}

type StatusBadgeProps = {
  status: AdminProjectStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const textSize = size === 'md' ? 'text-xs' : 'text-[11px]'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium ring-1 ${textSize} ${statusStyle[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[status]}`} />
      {adminProjectStatusLabels[status]}
    </span>
  )
}
