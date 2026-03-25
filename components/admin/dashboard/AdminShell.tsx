'use client'

import { useState, type ReactNode } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

type AdminShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AdminShell({ title, subtitle, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-app min-h-screen bg-[#070708] text-zinc-100">
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen((o) => !o)} />

      <div className="lg:pl-[260px]">
        <AdminTopbar title={title} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
