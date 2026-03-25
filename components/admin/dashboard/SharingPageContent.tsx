'use client'

import { Copy, FolderOpen, Globe, KeyRound, Link2, MessageCircle, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/admin/ui/Card'
import { Tabs } from '@/components/admin/ui/Tabs'
import {
  shareExpirationPresetLabels,
  shareLinkScopeLabels,
  type ShareExpirationPresetLabelKey,
  type ShareLinkScopeLabelKey,
} from '@/lib/share-labels'
import { ShareWhatsAppModal } from '@/components/admin/dashboard/ShareWhatsAppModal'

type ProjectOption = { id: string; title: string; clientName: string; clientPhone: string | null }

type ShareRow = {
  id: string
  slug: string
  scope: ShareLinkScopeLabelKey
  eventId: string
  eventTitle: string
  clientName: string
  clientPhone: string | null
  folderId: string | null
  folderTitle: string | null
  expirationPreset: ShareExpirationPresetLabelKey
  expiresAt: string | null
  hasPassword: boolean
  createdAt: string
}

type FolderOption = { id: string; title: string }

const PRESETS = ['NEVER', 'DAYS_7', 'DAYS_30', 'DAYS_90'] as const satisfies readonly ShareExpirationPresetLabelKey[]

type Props = { projects: ProjectOption[] }

export function SharingPageContent({ projects }: Props) {
  const [tab, setTab] = useState('gerar')
  const [eventId, setEventId] = useState(() => projects[0]?.id ?? '')
  const [scope, setScope] = useState<ShareLinkScopeLabelKey>('EVENT')
  const [folderId, setFolderId] = useState('')
  const [folders, setFolders] = useState<FolderOption[]>([])
  const [foldersLoading, setFoldersLoading] = useState(false)
  const [expirationPreset, setExpirationPreset] = useState<ShareExpirationPresetLabelKey>('DAYS_30')
  const [usePassword, setUsePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [links, setLinks] = useState<ShareRow[]>([])
  const [linksLoading, setLinksLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  type WaModalState = {
    url: string
    clientName: string
    defaultPhone: string | null
    linkHasPassword: boolean
    initialPasswordForMessage: string | null
  }
  const [waModal, setWaModal] = useState<WaModalState | null>(null)

  const loadFolders = useCallback(async (eid: string) => {
    if (!eid) {
      setFolders([])
      setFolderId('')
      return
    }
    setFoldersLoading(true)
    try {
      const res = await fetch(`/api/admin/gallery-folders?eventId=${encodeURIComponent(eid)}`)
      const data = (await res.json()) as { folders?: FolderOption[]; error?: string }
      if (!res.ok) {
        setFolders([])
        return
      }
      setFolders(data.folders ?? [])
      setFolderId((prev) => {
        const ids = new Set((data.folders ?? []).map((f) => f.id))
        if (prev && ids.has(prev)) return prev
        return (data.folders ?? [])[0]?.id ?? ''
      })
    } finally {
      setFoldersLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFolders(eventId)
  }, [eventId, loadFolders])

  const loadLinks = useCallback(async () => {
    setLinksLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/share-links')
      const data = (await res.json()) as { links?: ShareRow[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível carregar os links.')
        return
      }
      setLinks(data.links ?? [])
    } finally {
      setLinksLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'ativos') loadLinks()
  }, [tab, loadLinks])

  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(typeof window !== 'undefined' ? window.location.origin : '')
  }, [])

  function shareUrl(slug: string) {
    const base = origin || (typeof window !== 'undefined' ? window.location.origin : '')
    return `${base}/p/${slug}`
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setMessage('Copiado para a área de transferência.')
      setTimeout(() => setMessage(null), 2500)
    } catch {
      setError('Não foi possível copiar.')
    }
  }

  async function postCreateShare(): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
    if (!eventId) {
      return { ok: false, error: 'Selecione um projeto.' }
    }
    if (scope === 'FOLDER' && !folderId) {
      return { ok: false, error: 'Selecione uma pasta ou crie pastas no projeto.' }
    }

    const res = await fetch('/api/admin/share-links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        scope,
        folderId: scope === 'FOLDER' ? folderId : null,
        expirationPreset,
        password: usePassword ? password : undefined,
      }),
    })
    const data = (await res.json()) as { error?: string; link?: { slug: string } }
    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Não foi possível criar o link.' }
    }
    const slug = data.link?.slug
    if (!slug) {
      return { ok: false, error: 'Resposta inválida do servidor.' }
    }
    return { ok: true, slug }
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    setSubmitting(true)
    try {
      const result = await postCreateShare()
      if (!result.ok) {
        setError(result.error)
        return
      }
      const url = shareUrl(result.slug)
      await copyText(url)
      setMessage(`Link criado: ${url}`)
      loadLinks()
      if (usePassword) setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  async function onCreateAndOpenWhatsApp() {
    setError(null)
    setMessage(null)
    const pwdSnapshot = usePassword && password.trim() ? password.trim() : null

    setSubmitting(true)
    try {
      const result = await postCreateShare()
      if (!result.ok) {
        setError(result.error)
        return
      }
      const proj = projects.find((p) => p.id === eventId)
      setWaModal({
        url: shareUrl(result.slug),
        clientName: proj?.clientName ?? 'Cliente',
        defaultPhone: proj?.clientPhone ?? null,
        linkHasPassword: usePassword,
        initialPasswordForMessage: pwdSnapshot,
      })
      loadLinks()
      if (usePassword) setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  function openWhatsAppForExistingLink(link: ShareRow) {
    setWaModal({
      url: shareUrl(link.slug),
      clientName: link.clientName,
      defaultPhone: link.clientPhone,
      linkHasPassword: link.hasPassword,
      initialPasswordForMessage: null,
    })
  }

  async function onDelete(id: string) {
    if (!confirm('Revogar este link? Quem tiver o endereço deixará de acessar.')) return
    setError(null)
    const res = await fetch(`/api/admin/share-links/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      setError(data.error ?? 'Não foi possível remover.')
      return
    }
    loadLinks()
  }

  const tabItems = [
    {
      id: 'gerar',
      label: 'Gerar link',
      content: (
        <form onSubmit={onCreate} className="space-y-6">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Projeto</label>
            <select
              value={eventId}
              onChange={(ev) => setEventId(ev.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
              required
            >
              {projects.length === 0 ? (
                <option value="">Nenhum projeto</option>
              ) : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.clientName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">O que compartilhar</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'EVENT'}
                  onChange={() => setScope('EVENT')}
                  className="h-4 w-4 border-zinc-600 bg-zinc-900 text-warm-600 focus:ring-warm-600"
                />
                <span className="text-sm text-zinc-300">
                  <Globe className="mb-0.5 inline h-4 w-4 text-zinc-500" /> Projeto inteiro (visão do cliente)
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'FOLDER'}
                  onChange={() => setScope('FOLDER')}
                  className="h-4 w-4 border-zinc-600 bg-zinc-900 text-warm-600 focus:ring-warm-600"
                />
                <span className="text-sm text-zinc-300">
                  <FolderOpen className="mb-0.5 inline h-4 w-4 text-zinc-500" /> Apenas uma pasta
                </span>
              </label>
            </div>
          </div>

          {scope === 'FOLDER' ? (
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Pasta</label>
              <select
                value={folderId}
                onChange={(ev) => setFolderId(ev.target.value)}
                disabled={foldersLoading || folders.length === 0}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30 disabled:opacity-50"
              >
                {folders.length === 0 ? (
                  <option value="">{foldersLoading ? 'Carregando…' : 'Nenhuma pasta neste projeto'}</option>
                ) : null}
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Tipo de expiração</label>
            <select
              value={expirationPreset}
              onChange={(ev) => setExpirationPreset(ev.target.value as ShareExpirationPresetLabelKey)}
              className="mt-2 w-full max-w-xs rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200"
            >
              {PRESETS.map((p) => (
                <option key={p} value={p}>
                  {shareExpirationPresetLabels[p]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={usePassword}
                onChange={(ev) => setUsePassword(ev.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-warm-600 focus:ring-warm-600"
              />
              <span className="inline-flex items-center gap-2 text-sm text-zinc-300">
                <KeyRound className="h-4 w-4 text-zinc-500" /> Proteger com senha (quem abrir precisa digitar)
              </span>
            </label>
            {usePassword ? (
              <input
                type="password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="Senha do link"
                autoComplete="new-password"
                className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
                required={usePassword}
              />
            ) : null}
          </div>

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-400/90">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white hover:bg-warm-500 disabled:opacity-50"
            >
              {submitting ? 'Gerando…' : 'Gerar link'}
            </button>
            <button
              type="button"
              onClick={onCreateAndOpenWhatsApp}
              disabled={submitting || projects.length === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-900/50 disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              Enviar pelo WhatsApp
            </button>
          </div>
          <p className="text-[11px] text-zinc-600">
            &quot;Enviar pelo WhatsApp&quot; cria o link e abre a confirmação; o número vem do cadastro do cliente (+55)
            ou você informa na hora.
          </p>
        </form>
      ),
    },
    {
      id: 'ativos',
      label: 'Links ativos',
      content: (
        <div className="space-y-4">
          {linksLoading ? (
            <p className="text-sm text-zinc-500">Carregando…</p>
          ) : links.length === 0 ? (
            <p className="text-sm text-zinc-500">Nenhum link criado ainda.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3">Link curto</th>
                    <th className="px-4 py-3">Escopo</th>
                    <th className="px-4 py-3">Projeto</th>
                    <th className="px-4 py-3">Pasta</th>
                    <th className="px-4 py-3">Expiração</th>
                    <th className="px-4 py-3">Senha</th>
                    <th className="px-4 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr key={link.id} className="border-b border-zinc-800/80 text-zinc-300 last:border-0">
                      <td className="px-4 py-3 font-mono text-xs text-warm-500/90">/p/{link.slug}</td>
                      <td className="px-4 py-3">{shareLinkScopeLabels[link.scope]}</td>
                      <td className="max-w-[140px] truncate px-4 py-3" title={link.eventTitle}>
                        {link.eventTitle}
                      </td>
                      <td className="max-w-[120px] truncate px-4 py-3 text-zinc-500" title={link.folderTitle ?? ''}>
                        {link.folderTitle ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-zinc-400">{shareExpirationPresetLabels[link.expirationPreset]}</span>
                        {link.expiresAt ? (
                          <span className="mt-0.5 block text-[11px] text-zinc-600">
                            até {new Date(link.expiresAt).toLocaleString('pt-BR')}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{link.hasPassword ? 'Sim' : 'Não'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => copyText(shareUrl(link.slug))}
                            className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-2 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                            title="Copiar URL completa"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openWhatsAppForExistingLink(link)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-800/60 px-2 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950/50"
                            title="Enviar pelo WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(link.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-900/50 px-2 py-1.5 text-xs text-red-400 hover:bg-red-950/40"
                            title="Revogar link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <Card padding="lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-warm-500">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-zinc-100">Compartilhamento</h2>
            <p className="text-sm text-zinc-500">
              Links curtos em <span className="font-mono text-zinc-400">/p/…</span> — projeto inteiro ou uma pasta, com expiração e senha opcional.
            </p>
          </div>
        </div>
        <Tabs items={tabItems} activeId={tab} onChange={setTab} />
      </Card>

      <ShareWhatsAppModal
        open={waModal !== null}
        onClose={() => setWaModal(null)}
        clientName={waModal?.clientName ?? ''}
        defaultPhone={waModal?.defaultPhone ?? null}
        shareUrl={waModal?.url ?? ''}
        linkHasPassword={waModal?.linkHasPassword ?? false}
        initialPasswordForMessage={waModal?.initialPasswordForMessage ?? null}
      />
    </div>
  )
}
