'use client'

import { ArrowLeft, Loader2, Search, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/admin/ui/Card'

type SearchClient = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
}

export function CreateProjectForm() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SearchClient[]>([])
  const [selected, setSelected] = useState<SearchClient | null>(null)
  const [openResults, setOpenResults] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async (q: string) => {
    setSearching(true)
    try {
      const res = await fetch(`/api/admin/clients/search?q=${encodeURIComponent(q)}`)
      const data = (await res.json()) as { clients?: SearchClient[]; error?: string }
      if (!res.ok) {
        setResults([])
        return
      }
      setResults(Array.isArray(data.clients) ? data.clients : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => {
      void fetchClients(query)
    }, 280)
    return () => window.clearTimeout(t)
  }, [query, fetchClients])

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!selected) {
      setError('Selecione um cliente na busca.')
      return
    }

    const form = e.currentTarget
    const fd = new FormData(form)
    fd.set('clientId', selected.id)

    setPending(true)
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        body: fd,
      })
      const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível criar o projeto.')
        return
      }
      if (!data.id) {
        setError('Resposta inválida do servidor.')
        return
      }
      router.push(`/admin/upload?eventId=${encodeURIComponent(data.id)}`)
      router.refresh()
    } catch {
      setError('Erro de rede. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Link
        href="/admin/projetos"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para projetos
      </Link>

      <Card padding="lg">
        <h2 className="font-serif text-xl font-semibold text-zinc-50">Novo projeto</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Vincule a um cliente e, ao salvar, você será levado ao upload (fotos no R2 e vídeos via link do Drive).
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div className="relative">
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Cliente
            </label>
            {selected ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-200">{selected.name}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {[selected.username, selected.email, selected.phone].filter(Boolean).join(' · ') ||
                        'Sem contato extra'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(null)
                    setOpenResults(true)
                  }}
                  className="shrink-0 text-xs font-medium text-warm-400 hover:text-warm-300"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <div className="relative z-20">
                <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setOpenResults(true)
                  }}
                  onFocus={() => setOpenResults(true)}
                  className={`${inputClass} relative z-0 pl-10`}
                  placeholder="Nome, usuário, e-mail ou telefone…"
                  autoComplete="off"
                />
                {searching ? (
                  <Loader2 className="absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
                ) : null}
                {openResults && results.length > 0 ? (
                  <ul
                    className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl"
                    role="listbox"
                  >
                    {results.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left text-sm transition hover:bg-zinc-900"
                          onClick={() => {
                            setSelected(c)
                            setOpenResults(false)
                            setQuery('')
                          }}
                        >
                          <span className="font-medium text-zinc-200">{c.name}</span>
                          <span className="text-xs text-zinc-500">
                            {[c.username, c.email, c.phone].filter(Boolean).join(' · ') || '—'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {openResults && !searching && query && results.length === 0 ? (
                  <p className="mt-2 text-xs text-zinc-600">Nenhum cliente encontrado.</p>
                ) : null}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Nome do projeto / evento
            </label>
            <input id="title" name="title" required className={inputClass} placeholder="Casamento Ana & Pedro" />
          </div>

          <div>
            <label
              htmlFor="infoText"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Texto para o cliente (opcional)
            </label>
            <textarea
              id="infoText"
              name="infoText"
              rows={3}
              className={inputClass}
              placeholder="Mensagem no card da galeria…"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Capa (opcional)
            </label>
            <input
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-200"
            />
            <p className="mt-1 text-xs text-zinc-600">JPG, PNG, WebP ou GIF · máx. 5MB</p>
          </div>

          <div>
            <label htmlFor="coverUrl" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
              Ou URL da capa (opcional)
            </label>
            <input id="coverUrl" name="coverUrl" type="url" className={inputClass} placeholder="https://…" />
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
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-warm-900/25 transition hover:bg-warm-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando…
                </>
              ) : (
                'Salvar e ir para upload'
              )}
            </button>
            <Link
              href="/admin/projetos"
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
