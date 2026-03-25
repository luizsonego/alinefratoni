'use client'

import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card } from '@/components/admin/ui/Card'

export function CreateClientForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    const body = {
      name: String(fd.get('name') ?? '').trim(),
      username: String(fd.get('username') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
    }

    setPending(true)
    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível criar o cliente.')
        return
      }
      router.push('/admin/clientes')
      router.refresh()
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30'

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>

      <Card padding="lg">
        <h2 className="font-serif text-xl font-semibold text-zinc-50">Novo cliente</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Cadastro para acesso à área do cliente. A senha inicial será os 5 últimos números do telefone (sem pontuação).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Nome completo
            </label>
            <input id="name" name="name" required autoComplete="name" className={inputClass} placeholder="Maria Silva" />
          </div>
          <div>
            <label htmlFor="username" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Usuário (login)
            </label>
            <input
              id="username"
              name="username"
              required
              autoComplete="username"
              className={inputClass}
              placeholder="maria.silva"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              E-mail (opcional)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="maria@email.com"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Telefone
            </label>
            <input
              id="phone"
              name="phone"
              required
              autoComplete="tel"
              className={inputClass}
              placeholder="11999990000"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-warm-900/25 transition hover:bg-warm-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                'Criar cliente'
              )}
            </button>
            <Link
              href="/admin/clientes"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </Card>
    </div>
  )
}
