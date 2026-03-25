'use client'

import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type DropdownProps = {
  label: string
  children: ReactNode
  align?: 'left' | 'right'
}

export function Dropdown({ label, children, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200 transition hover:border-zinc-600 hover:bg-zinc-800"
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          className={`absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

type DropdownItemProps = {
  children: ReactNode
  onClick?: () => void
  danger?: boolean
}

export function DropdownItem({ children, onClick, danger }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
      }}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-zinc-900 ${
        danger ? 'text-red-400 hover:text-red-300' : 'text-zinc-300'
      }`}
    >
      {children}
    </button>
  )
}
