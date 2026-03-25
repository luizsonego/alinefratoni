'use client'

import { ArrowLeft, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Card } from '@/components/admin/ui/Card'

export type EditClientInitial = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
}

export function EditClientForm({ client }: { client: EditClientInitial }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const password = String(fd.get('password') ?? '')
    const passwordConfirm = String(fd.get('passwordConfirm') ?? '')
    if (password && password !== passwordConfirm) {
      setError('As senhas não coincidem.')
      return
    }

    const body = {
      name: String(fd.get('name') ?? '').trim(),
      username: String(fd.get('username') ?? '').trim(),
      email: String(fd.get('email') ?? '').trim(),
      phone: String(fd.get('phone') ?? '').trim(),
      ...(password ? { password } : {}),
    }

    setPending(true)
    try {
      const res = await fetch(`/api/admin/clients/${encodeURIComponent(client.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível salvar.')
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

  async function onDelete() {
    if (
      !window.confirm(
        'Excluir este cliente? Todos os projetos vinculados serão apagados (e arquivos R2 desses projetos, se o R2 estiver configurado).'
      )
    ) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/clients/${encodeURIComponent(client.id)}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível excluir.')
        setDeleting(false)
        return
      }
      router.push('/admin/clientes')
      router.refresh()
    } catch {
      setError('Erro de rede.')
      setDeleting(false)
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold text-zinc-50">Editar cliente</h2>
            <p className="mt-1 text-sm text-zinc-500">Altere dados ou exclua o cadastro.</p>
          </div>
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={deleting || pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir cliente
          </button>
        </div>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className={inputClass}
              defaultValue={client.name}
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Usuário (login)
            </label>
            <input
              id="username"
              name="username"
              required
              autoComplete="username"
              className={inputClass}
              defaultValue={client.username ?? ''}
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
              defaultValue={client.email ?? ''}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Telefone (opcional)
            </label>
            <input
              id="phone"
              name="phone"
              autoComplete="tel"
              className={inputClass}
              defaultValue={client.phone ?? ''}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Nova senha (opcional)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={inputClass}
                placeholder="Deixe em branco para manter"
              />
            </div>
            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
              >
                Confirmar nova senha
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </div>
          {error ? (
            <p className="text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending || deleting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-warm-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-warm-900/20 transition hover:bg-warm-500 disabled:opacity-60 sm:w-auto"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Salvar alterações
          </button>
        </form>
      </Card>
    </div>
  )
}
