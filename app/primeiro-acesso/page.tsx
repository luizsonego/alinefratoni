'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PrimeiroAcessoPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(action: 'skip' | 'change') {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/first-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'skip' ? { action } : { action, password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; redirectTo?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível concluir.')
        return
      }
      router.push(data.redirectTo ?? '/cliente')
      router.refresh()
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }
    await submit('change')
  }

  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">Primeiro acesso</p>
          <h1 className="mt-2 text-lg font-semibold">Crie uma nova senha</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Você pode definir uma nova senha agora ou pular e continuar com a senha inicial.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Nova senha</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="new-password"
                minLength={6}
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Confirmar nova senha</span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="new-password"
                minLength={6}
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => void submit('skip')}
              className="w-full rounded-xl border border-zinc-700 px-4 py-3.5 text-sm font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Pular por enquanto
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
