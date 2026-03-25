'use client'

import type { ReactNode } from 'react'

export type TabItem = {
  id: string
  label: string
  content: ReactNode
}

type TabsProps = {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
}

export function Tabs({ items, activeId, onChange }: TabsProps) {
  return (
    <div>
      <div className="flex gap-1 rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
        {items.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeId === t.id
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{items.find((i) => i.id === activeId)?.content}</div>
    </div>
  )
}
