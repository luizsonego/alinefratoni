'use client'

import { Bell, Search } from 'lucide-react'
import { AdminSidebarToggle } from './AdminSidebar'

type AdminTopbarProps = {
  title: string
  subtitle?: string
  onMenuClick: () => void
}

export function AdminTopbar({ title, subtitle, onMenuClick }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-zinc-800/80 bg-zinc-950/80 px-4 backdrop-blur-md sm:px-6">
      <AdminSidebarToggle onClick={onMenuClick} />

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-serif text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl">{title}</h1>
        {subtitle ? <p className="truncate text-xs text-zinc-500 sm:text-sm">{subtitle}</p> : null}
      </div>

      <div className="hidden max-w-md flex-1 md:flex">
        <label className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="search"
            placeholder="Buscar projetos, clientes, arquivos…"
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
          />
        </label>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-warm-500 ring-2 ring-zinc-950" />
        </button>
        <div className="ml-1 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 py-1 pl-1 pr-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-semibold text-zinc-200">
            AF
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-medium text-zinc-200">Conta</p>
            <p className="text-[11px] text-zinc-500">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  )
}
