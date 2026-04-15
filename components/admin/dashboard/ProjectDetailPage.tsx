'use client'

import {
  ArrowLeft,
  Camera,
  Check,
  Film,
  FolderOpen,
  Link2,
  Loader2,
  Pencil,
  Save,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProjectGallery, type ProjectGalleryProject } from './ProjectGallery'
import { ProjectFoldersManager } from './ProjectFoldersManager'
import { UploadWorkspace } from '@/components/admin/upload/UploadWorkspace'
import type { AdminGalleryMediaItem, AdminProjectCategory, AdminProjectStatus } from '@/lib/admin-projects'
import { adminCategoryLabels, adminProjectStatusLabels } from '@/lib/admin-projects'
import { StatusBadge } from '@/components/admin/dashboard/StatusBadge'

type Tab = 'gallery' | 'upload' | 'folders' | 'settings'

type ClientOption = { id: string; name: string; username: string | null }

const STATUS_OPTIONS: AdminProjectStatus[] = ['editing', 'waiting_selection', 'late', 'delivered']

const STATUS_DESCRIPTIONS: Record<AdminProjectStatus, string> = {
  editing: 'Fotos em tratamento / projeto em andamento',
  waiting_selection: 'Aguardando seleção das fotos pelo cliente',
  late: 'Prazo ultrapassado sem entrega',
  delivered: 'Material entregue ao cliente',
}

const CATEGORY_OPTIONS: AdminProjectCategory[] = ['FEMININE', 'KIDS', 'EVENT', 'OTHER']

const CATEGORY_ICON: Record<AdminProjectCategory, string> = {
  FEMININE: '🌸',
  KIDS: '🧸',
  EVENT: '🎉',
  OTHER: '📁',
}

type Props = {
  projectId: string
  initialTitle: string
  initialInfoText: string | null
  initialClientId: string
  initialClientName: string
  initialCoverUrl: string | null
  initialStatus: AdminProjectStatus
  initialCategory: AdminProjectCategory
  initialShootDate: string | null
  initialDeliveredAt: string | null
  initialSessionValue: number | null
  photoCount: number
  videoCount: number
  initialMedia: AdminGalleryMediaItem[]
  r2Enabled: boolean
}

export function ProjectDetailPage({
  projectId,
  initialTitle,
  initialInfoText,
  initialClientId,
  initialClientName,
  initialCoverUrl,
  initialStatus,
  initialCategory,
  initialShootDate,
  initialDeliveredAt,
  initialSessionValue,
  photoCount,
  videoCount,
  initialMedia,
  r2Enabled,
}: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('gallery')

  // Settings state
  const [title, setTitle] = useState(initialTitle)
  const [infoText, setInfoText] = useState(initialInfoText ?? '')
  const [clientId, setClientId] = useState(initialClientId)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl ?? '')
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loadingClients, setLoadingClients] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  // Status / CRM state
  const [status, setStatus] = useState<AdminProjectStatus>(initialStatus)
  const [category, setCategory] = useState<AdminProjectCategory>(initialCategory)
  const [shootDate, setShootDate] = useState(initialShootDate ? initialShootDate.slice(0, 10) : '')
  const [deliveredAt, setDeliveredAt] = useState(initialDeliveredAt ? initialDeliveredAt.slice(0, 10) : '')
  const [sessionValue, setSessionValue] = useState(initialSessionValue != null ? String(initialSessionValue) : '')
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Drive folder state
  const [driveTitle, setDriveTitle] = useState('Vídeos')
  const [driveUrl, setDriveUrl] = useState('')
  const [savingDrive, setSavingDrive] = useState(false)
  const [driveError, setDriveError] = useState<string | null>(null)
  const [driveSaved, setDriveSaved] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)

  const project: ProjectGalleryProject = {
    id: projectId,
    title: initialTitle,
    clientName: initialClientName,
    photoCount,
    videoCount,
  }

  // Load clients only when settings tab is opened
  useEffect(() => {
    if (tab !== 'settings') return
    let cancelled = false
    setLoadingClients(true)
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
  }, [tab])

  async function onSave(e: React.FormEvent) {
    e.preventDefault()
    setSettingsError(null)
    setSettingsSaved(false)
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
        setSettingsError(data.error ?? 'Não foi possível salvar.')
        return
      }
      setSettingsSaved(true)
      router.refresh()
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch {
      setSettingsError('Erro de rede.')
    } finally {
      setSaving(false)
    }
  }

  async function onSaveStatus() {
    setStatusError(null)
    setStatusSaved(false)
    setSavingStatus(true)

    // Derive deliveredAt from status selection
    let resolvedDeliveredAt: string | null | '' = deliveredAt
      ? new Date(deliveredAt).toISOString()
      : null
    if (status === 'delivered' && !deliveredAt) {
      resolvedDeliveredAt = new Date().toISOString()
    } else if (status !== 'delivered') {
      resolvedDeliveredAt = null
    }

    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          shootDate: shootDate ? new Date(shootDate).toISOString() : null,
          deliveredAt: resolvedDeliveredAt,
          sessionValue: sessionValue !== '' ? Number(sessionValue) : null,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setStatusError(data.error ?? 'Não foi possível salvar.')
        return
      }
      setStatusSaved(true)
      router.refresh()
      setTimeout(() => setStatusSaved(false), 3000)
    } catch {
      setStatusError('Erro de rede.')
    } finally {
      setSavingStatus(false)
    }
  }

  async function onSaveDrive(e: React.FormEvent) {
    e.preventDefault()
    setDriveError(null)
    setDriveSaved(false)
    const url = driveUrl.trim()
    if (!url) {
      setDriveError('Cole o link da pasta do Google Drive.')
      return
    }
    setSavingDrive(true)
    try {
      const res = await fetch('/api/admin/gallery-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: projectId,
          title: driveTitle.trim() || 'Vídeos',
          driveUrl: url,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setDriveError(data.error ?? 'Não foi possível vincular a pasta.')
        return
      }
      setDriveSaved(true)
      setDriveUrl('')
      router.refresh()
      setTimeout(() => setDriveSaved(false), 4000)
    } catch {
      setDriveError('Erro de rede.')
    } finally {
      setSavingDrive(false)
    }
  }

  async function onDelete() {
    if (
      !window.confirm(
        'Excluir este projeto permanentemente? Todas as pastas e referências serão removidas.'
      )
    ) {
      return
    }
    setDeleting(true)
    setSettingsError(null)
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setSettingsError(data.error ?? 'Não foi possível excluir.')
        return
      }
      router.push('/admin/projetos')
      router.refresh()
    } catch {
      setSettingsError('Erro de rede.')
    } finally {
      setDeleting(false)
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof Camera; badge?: string }[] = [
    { id: 'gallery', label: 'Galeria', icon: Camera, badge: String(photoCount + videoCount) || undefined },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'folders', label: 'Pastas', icon: FolderOpen },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  const inputClass =
    'w-full rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30 transition-all'

  return (
    <div className="min-h-screen">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-900/50 mb-8">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-warm-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-warm-800/10 blur-2xl" />

        <div className="relative p-6 sm:p-8">
          {/* Back link */}
          <Link
            href="/admin/projetos"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Todos os projetos
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-warm-500">
                Projeto
              </p>
              <h1 className="font-serif text-3xl font-bold text-zinc-50 tracking-tight sm:text-4xl">
                {initialTitle}
              </h1>
              <p className="text-sm text-zinc-500">
                {initialClientName} ·{' '}
                <span className="text-zinc-400">
                  {photoCount} foto{photoCount !== 1 ? 's' : ''}
                </span>{' '}
                ·{' '}
                <span className="text-zinc-400">
                  {videoCount} vídeo{videoCount !== 1 ? 's' : ''}
                </span>
              </p>
            </div>

            {/* Quick action: go to upload */}
            <button
              type="button"
              onClick={() => setTab('upload')}
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-warm-900/30 hover:bg-warm-500 active:scale-95 transition-all"
            >
              <Upload className="h-4 w-4" />
              Adicionar fotos
            </button>
          </div>

          {/* Tab bar */}
          <div className="mt-8 -mb-px flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 rounded-t-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                  tab === id
                    ? 'bg-zinc-950 text-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {label}
                {badge && badge !== '0' && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums transition-colors ${
                      tab === id
                        ? 'bg-warm-600/20 text-warm-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}

      {tab === 'gallery' && (
        <ProjectGallery project={project} initialMedia={initialMedia} />
      )}

      {tab === 'upload' && (
        <div className="space-y-10">
          <UploadWorkspace
            eventId={projectId}
            eventTitle={initialTitle}
            r2Enabled={r2Enabled}
          />

          {/* ── Google Drive section ── */}
          <div className="relative rounded-3xl border border-zinc-800/60 bg-zinc-900/40 overflow-hidden">
            {/* subtle accent */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />

            <div className="relative p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-700/60 bg-zinc-800/80 text-blue-400">
                  <Film className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-zinc-100">
                    Pasta de vídeos (Google Drive)
                  </h3>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Vincule uma pasta compartilhada do Drive. Os vídeos aparecerão automaticamente na galeria do cliente.
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => void onSaveDrive(e)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Folder label */}
                  <div>
                    <label
                      htmlFor="drive-title"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500"
                    >
                      Nome da pasta
                    </label>
                    <input
                      id="drive-title"
                      value={driveTitle}
                      onChange={(e) => setDriveTitle(e.target.value)}
                      placeholder="Vídeos"
                      className={inputClass}
                    />
                  </div>

                  {/* Drive URL */}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="drive-url"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500"
                    >
                      URL da pasta
                    </label>
                    <div className="relative">
                      <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 pointer-events-none" />
                      <input
                        id="drive-url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        type="url"
                        placeholder="https://drive.google.com/drive/folders/…"
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>

                {driveError && (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300" role="alert">
                    {driveError}
                  </p>
                )}

                {driveSaved && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
                    <Check className="h-4 w-4 shrink-0" />
                    Pasta vinculada! O cliente verá os vídeos na galeria.
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={savingDrive}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white active:scale-95 transition-all shadow-lg shadow-blue-900/20"
                  >
                    {savingDrive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Film className="h-4 w-4" />}
                    Vincular pasta do Drive
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'folders' && (
        <div>
          <div className="mb-6">
            <h2 className="font-serif text-xl font-semibold text-zinc-100">Pastas da galeria</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Gerencie as pastas R2 e links do Google Drive vinculados a este projeto.
            </p>
          </div>
          <ProjectFoldersManager eventId={projectId} />
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-2xl space-y-8">
          {/* Settings header */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-zinc-100">Configurações do projeto</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Edite os metadados do projeto. Alterações são refletidas imediatamente na galeria do cliente.
            </p>
          </div>

          {/* ── Status & CRM Block ─────────────────────────────────────────── */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Status do projeto</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Altera o ciclo de vida do ensaio. Afeta os badges na listagem.
                </p>
              </div>
              <StatusBadge status={status} size="md" />
            </div>

            {/* Status picker */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(s)
                    // auto-set deliveredAt when marking as delivered
                    if (s === 'delivered' && !deliveredAt) {
                      setDeliveredAt(new Date().toISOString().slice(0, 10))
                    }
                    if (s !== 'delivered') setDeliveredAt('')
                  }}
                  className={`flex flex-col gap-1 rounded-xl border p-3 text-left text-xs transition ${
                    status === s
                      ? 'border-warm-600/60 bg-warm-500/10 text-warm-200'
                      : 'border-zinc-800 bg-zinc-950/40 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <span className="font-semibold">{adminProjectStatusLabels[s]}</span>
                  <span className="leading-snug opacity-70">{STATUS_DESCRIPTIONS[s]}</span>
                </button>
              ))}
            </div>

            {/* Category + dates + value */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Categoria
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition ${
                        category === cat
                          ? 'border-warm-600/60 bg-warm-500/10 text-warm-300'
                          : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                      }`}
                    >
                      {CATEGORY_ICON[cat]} {adminCategoryLabels[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="proj-session-value" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Valor do ensaio (R$)
                </label>
                <input
                  id="proj-session-value"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
                  value={sessionValue}
                  onChange={(e) => setSessionValue(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="proj-shoot-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Data do ensaio
                </label>
                <input
                  id="proj-shoot-date"
                  type="date"
                  value={shootDate}
                  onChange={(e) => setShootDate(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="proj-delivered-at" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Data de entrega
                  <span className="ml-2 normal-case font-normal text-zinc-600">(preenchido ao marcar Entregue)</span>
                </label>
                <input
                  id="proj-delivered-at"
                  type="date"
                  value={deliveredAt}
                  onChange={(e) => setDeliveredAt(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            {statusError && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300" role="alert">
                {statusError}
              </p>
            )}
            {statusSaved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
                <Check className="h-4 w-4 shrink-0" /> Status atualizado com sucesso.
              </div>
            )}

            <button
              type="button"
              disabled={savingStatus}
              onClick={() => void onSaveStatus()}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-100 hover:bg-zinc-600 disabled:opacity-60 active:scale-95 transition-all"
            >
              {savingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              Salvar status
            </button>
          </div>

          <form onSubmit={(e) => void onSave(e)} className="space-y-5">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-5">
              <div>
                <label htmlFor="proj-title" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Título do projeto
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
                <label htmlFor="proj-client" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Cliente
                </label>
                <select
                  id="proj-client"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={loadingClients}
                  className={inputClass}
                >
                  {loadingClients ? (
                    <option>Carregando...</option>
                  ) : (
                    clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.username ? ` (${c.username})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="proj-info" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  Texto da galeria
                  <span className="ml-2 normal-case font-normal text-zinc-600">
                    (card lateral para o cliente)
                  </span>
                </label>
                <textarea
                  id="proj-info"
                  value={infoText}
                  onChange={(e) => setInfoText(e.target.value)}
                  rows={4}
                  placeholder="Escreva uma mensagem especial para o cliente..."
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="proj-cover" className="mb-1.5 block text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                  URL da capa
                  <span className="ml-2 normal-case font-normal text-zinc-600">(opcional)</span>
                </label>
                <input
                  id="proj-cover"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  type="url"
                  placeholder="https://…"
                  className={inputClass}
                />
              </div>
            </div>

            {settingsError ? (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
                {settingsError}
              </p>
            ) : null}

            {settingsSaved ? (
              <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                ✓ Alterações salvas com sucesso.
              </p>
            ) : null}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-6 py-3 text-sm font-semibold text-white hover:bg-warm-500 disabled:opacity-60 active:scale-95 transition-all"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar alterações
              </button>
            </div>
          </form>

          {/* Danger zone */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-red-200 text-sm">Zona de perigo</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Ações irreversíveis. Pastas R2 devem ser esvaziadas manualmente no storage antes de excluir o projeto.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void onDelete()}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50 active:scale-95 transition-all"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir projeto permanentemente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
