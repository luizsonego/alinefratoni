'use client'

import { Film, ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import R2UploadPanel from '@/components/admin/R2UploadPanel'
import { Card } from '@/components/admin/ui/Card'

type ProjectUploadWorkspaceProps = {
  eventId: string
  eventTitle: string
  clientName: string
  r2Enabled: boolean
}

export function ProjectUploadWorkspace({
  eventId,
  eventTitle,
  clientName,
  r2Enabled,
}: ProjectUploadWorkspaceProps) {
  const [tab, setTab] = useState<'photos' | 'videos'>('photos')
  const [driveTitle, setDriveTitle] = useState('Vídeos')
  const [driveUrl, setDriveUrl] = useState('')
  const [savingDrive, setSavingDrive] = useState(false)
  const [driveMessage, setDriveMessage] = useState<string | null>(null)
  const [driveError, setDriveError] = useState<string | null>(null)

  const eventOptions = [{ id: eventId, title: eventTitle, clientName }]
  const lockedLabel = `${eventTitle} · ${clientName}`

  async function saveDriveFolder(e: React.FormEvent) {
    e.preventDefault()
    setDriveError(null)
    setDriveMessage(null)
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
          eventId,
          title: driveTitle.trim() || 'Vídeos',
          driveUrl: url,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setDriveError(data.error ?? 'Não foi possível salvar.')
        return
      }
      setDriveMessage('Pasta vinculada. O cliente verá os vídeos na galeria (API do Drive).')
      setDriveUrl('')
    } catch {
      setDriveError('Erro de rede.')
    } finally {
      setSavingDrive(false)
    }
  }

  const tabBtn = (id: 'photos' | 'videos', label: string, icon: typeof ImageIcon) => {
    const Icon = icon
    return (
      <button
        key={id}
        type="button"
        onClick={() => setTab(id)}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
          tab === id
            ? 'bg-zinc-800 text-white ring-1 ring-white/10'
            : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Upload do projeto</p>
          <h2 className="font-serif text-xl font-semibold text-zinc-50">{eventTitle}</h2>
          <p className="text-sm text-zinc-500">Cliente: {clientName}</p>
        </div>
        <Link
          href="/admin/projetos"
          className="text-sm font-medium text-warm-400 hover:text-warm-300"
        >
          Ver todos os projetos
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2">
        {tabBtn('photos', 'Fotos (sistema)', ImageIcon)}
        {tabBtn('videos', 'Vídeos (Google Drive)', Film)}
      </div>

      {tab === 'photos' ? (
        <R2UploadPanel
          events={eventOptions}
          r2Enabled={r2Enabled}
          lockedEventId={eventId}
          lockedEventLabel={lockedLabel}
          imagesOnly
        />
      ) : (
        <Card padding="lg">
          <h3 className="font-serif text-lg font-semibold text-zinc-100">Link da pasta de vídeos</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Cole o link da pasta compartilhada no Google Drive. As fotos continuam sendo enviadas pelo R2 na outra
            aba.
          </p>
          <form onSubmit={saveDriveFolder} className="mt-6 space-y-4">
            <div>
              <label htmlFor="driveTitle" className="mb-1.5 block text-xs font-medium text-zinc-500">
                Nome exibido na galeria
              </label>
              <input
                id="driveTitle"
                value={driveTitle}
                onChange={(e) => setDriveTitle(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
                placeholder="Vídeos"
              />
            </div>
            <div>
              <label htmlFor="driveUrl" className="mb-1.5 block text-xs font-medium text-zinc-500">
                URL da pasta (drive.google.com)
              </label>
              <input
                id="driveUrl"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                type="url"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
                placeholder="https://drive.google.com/drive/folders/…"
              />
            </div>
            {driveError ? (
              <p className="text-sm text-red-300" role="alert">
                {driveError}
              </p>
            ) : null}
            {driveMessage ? <p className="text-sm text-emerald-400">{driveMessage}</p> : null}
            <button
              type="submit"
              disabled={savingDrive}
              className="inline-flex items-center gap-2 rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white hover:bg-warm-500 disabled:opacity-60"
            >
              {savingDrive ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Salvar pasta de vídeos
            </button>
          </form>
        </Card>
      )}
    </div>
  )
}
