'use client'

import { Loader2, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/admin/ui/Card'

type ClientOption = { id: string; name: string; username: string | null }

type Props = {
  projectId: string
  initialTitle: string
  initialInfoText: string | null
  initialClientId: string
  initialCoverUrl: string | null
}

export function ProjectSettingsPanel({
  projectId,
  initialTitle,
  initialInfoText,
  initialClientId,
  initialCoverUrl,
}: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [infoText, setInfoText] = useState(initialInfoText ?? '')
  const [clientId, setClientId] = useState(initialClientId)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl ?? '')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/admin/clients')
        const data = (await res.json().catch(() => ({}))) as { clients?: ClientOption[] }
        if (!cancelled && res.ok && Array.isArray(data.clients)) {
          setClients(data.clients)
        }
      } finally {
        if (!cancelled) setLoadingClients(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          infoText: infoText.trim() || null,
          clientId,
          coverUrl: coverUrl.trim() || null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível salvar.')
        return
      }
      router.refresh()
    } catch {
      setError('Erro de rede.')
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (
      !window.confirm(
        'Excluir este projeto permanentemente? Pastas, vínculos e (no R2) referências serão removidos; arquivos no bucket das pastas R2 devem ser apagados pelas pastas antes, se quiser limpar o storage.'
      )
    ) {
      return
    }
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível excluir.')
        setDeleting(false)
        return
      }
      router.push('/admin/projetos')
      router.refresh()
    } catch {
      setError('Erro de rede.')
      setDeleting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30'

  return (
    <Card padding="lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-zinc-100">Controle do projeto</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Edite dados, reatribua cliente ou exclua o projeto. Pastas da galeria são gerenciadas abaixo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onDelete()}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Excluir projeto
        </button>
      </div>

      <form onSubmit={(e) => void onSave(e)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="proj-title" className="mb-1.5 block text-xs font-medium text-zinc-500">
            Título
          </label>
          <input
            id="proj-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="proj-client" className="mb-1.5 block text-xs font-medium text-zinc-500">
            Cliente
          </label>
          <select
            id="proj-client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            disabled={loadingClients}
            className={inputClass}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.username ? ` (${c.username})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="proj-info" className="mb-1.5 block text-xs font-medium text-zinc-500">
            Texto da galeria (card lateral)
          </label>
          <textarea
            id="proj-info"
            value={infoText}
            onChange={(e) => setInfoText(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="proj-cover" className="mb-1.5 block text-xs font-medium text-zinc-500">
            URL da capa (opcional)
          </label>
          <input
            id="proj-cover"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            type="url"
            placeholder="https://…"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-zinc-600">
            Para trocar capa por arquivo use{' '}
            <Link href="/admin/ferramentas" className="text-warm-400 hover:text-warm-300">
              Ferramentas do sistema
            </Link>
            .
          </p>
        </div>
        {error ? (
          <p className="text-sm text-red-300" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white hover:bg-warm-500 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar alterações
        </button>
      </form>
    </Card>
  )
}
