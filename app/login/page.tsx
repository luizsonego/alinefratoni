'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })

    const data = await response.json()
    setLoading(false)

    if (!response.ok) {
      setError(data.error ?? 'Não foi possível entrar.')
      return
    }

    router.push(data.redirectTo)
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">Acesso</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Entre com usuário, e-mail ou telefone.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                Usuário / E-mail / Telefone
              </span>
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-zinc-600 focus:border-zinc-500"
                placeholder="ex: cliente@email.com"
                autoComplete="username"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="pt-1 text-center">
              <Link href="/esqueci-senha" className="text-sm text-zinc-400 transition hover:text-zinc-200">
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
