'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

export default function ClienteContaPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (newPassword !== newPasswordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível trocar a senha.')
        return
      }
      setSuccess('Senha alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] text-white antialiased">
      <section className="mx-auto w-full max-w-2xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Minha conta</h1>
          <Link href="/cliente" className="text-sm text-zinc-400 hover:text-zinc-200">
            Voltar para eventos
          </Link>
        </div>

        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-medium">Trocar senha</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Senha atual</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="current-password"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Nova senha</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="new-password"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">Confirmar nova senha</span>
              <input
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-black/40 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-zinc-500"
                autoComplete="new-password"
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
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Atualizar senha'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
