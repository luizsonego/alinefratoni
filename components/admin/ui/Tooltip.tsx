import type { ReactNode } from 'react'

type TooltipProps = {
  children: ReactNode
  label: string
  side?: 'top' | 'bottom'
}

export function Tooltip({ children, label, side = 'top' }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-200 opacity-0 shadow-lg transition group-hover:opacity-100 ${
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        }`}
      >
        {label}
      </span>
    </span>
  )
}
