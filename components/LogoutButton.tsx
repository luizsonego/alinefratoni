'use client'

import { useRouter } from 'next/navigation'

type Props = {
  variant?: 'default' | 'minimal'
  className?: string
}

export default function LogoutButton({ variant = 'default', className = '' }: Props) {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const base =
    variant === 'minimal'
      ? 'rounded-full border border-zinc-700/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-400 transition hover:border-zinc-500 hover:text-white'
      : 'rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 transition hover:bg-zinc-800'

  return (
    <button type="button" onClick={handleLogout} className={`${base} ${className}`.trim()}>
      Sair
    </button>
  )
}
