'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, Menu } from 'lucide-react'
import { mainNav, secondaryNav } from './nav'

type AdminSidebarProps = {
  open: boolean
  onToggle: () => void
}

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  onNavigate,
}: {
  href: string
  label: string
  icon: (typeof mainNav)[0]['icon']
  badge?: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
        active
          ? 'bg-zinc-800/90 text-white shadow-sm ring-1 ring-white/5'
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0 opacity-80 group-hover:opacity-100" strokeWidth={1.5} />
      <span className="flex-1 truncate">{label}</span>
      {badge ? (
        <span className="rounded-md bg-warm-600/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warm-400">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export function AdminSidebar({ open, onToggle }: AdminSidebarProps) {
  const closeMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) onToggle()
  }

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-zinc-800/80 bg-zinc-950/95 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800/80 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-warm-500 to-amber-700 text-sm font-bold text-white shadow-lg shadow-warm-900/30">
            E
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-zinc-100">Estúdio</p>
            <p className="truncate text-xs text-zinc-500">Painel administrativo</p>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
            aria-label="Fechar menu"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Menu</p>
            <div className="space-y-0.5">
              {mainNav.map((item) => (
                <NavLink key={item.href} {...item} onNavigate={closeMobile} />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Sistema</p>
            <div className="space-y-0.5">
              {secondaryNav.map((item) => (
                <NavLink key={item.href} {...item} onNavigate={closeMobile} />
              ))}
            </div>
          </div>
        </nav>

        <div className="border-t border-zinc-800/80 p-4">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3">
            <p className="text-xs text-zinc-500">Armazenamento simulado</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-warm-500 to-amber-500" />
            </div>
            <p className="mt-2 text-[11px] text-zinc-600">38% do plano Pro</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export function AdminSidebarToggle({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
      aria-label="Abrir menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
