'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { KeyRound } from 'lucide-react'

type Props = { slug: string }

export function SharePasswordForm({ slug }: Props) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPending(true)
    try {
      const res = await fetch(`/api/share/${encodeURIComponent(slug)}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'Senha incorreta.')
        return
      }
      router.refresh()
    } catch {
      setError('Não foi possível validar. Tente de novo.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-xl">
        <div className="mb-6 flex justify-center text-warm-500">
          <KeyRound className="h-10 w-10" />
        </div>
        <h1 className="text-center font-serif text-xl font-semibold text-zinc-100">Área protegida</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">Digite a senha para ver esta galeria.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Senha"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
            required
          />
          {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-warm-600 py-3 text-sm font-semibold text-white transition hover:bg-warm-500 disabled:opacity-60"
          >
            {pending ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
