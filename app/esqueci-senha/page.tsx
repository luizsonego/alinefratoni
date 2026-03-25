'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível enviar o e-mail.')
        return
      }
      setSuccess('Se o e-mail estiver cadastrado, você receberá o link de recuperação.')
      setEmail('')
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">Recuperação</p>
          <h1 className="mt-2 text-lg font-semibold">Esqueci minha senha</h1>
          <p className="mt-2 text-sm text-zinc-400">Informe seu e-mail para receber o link de redefinição.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="email"
                required
              />
            </label>

            {error ? (
              <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            ) : null}
            {success ? (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
          </form>

          <Link href="/login" className="mt-5 inline-block text-sm text-zinc-400 hover:text-zinc-200">
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  )
}
