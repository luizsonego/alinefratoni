import type { ReactNode } from 'react'

type CardProps = {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const pad: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800/80 bg-zinc-900/40 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm ${pad[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
