'use client'

import { FolderOpen, Loader2, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '@/components/admin/ui/Card'

type FolderRow = {
  id: string
  title: string
  driveUrl: string
  createdAt: string
}

type Props = {
  eventId: string
}

export function ProjectFoldersManager({ eventId }: Props) {
  const router = useRouter()
  const [folders, setFolders] = useState<FolderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDriveUrl, setEditDriveUrl] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/gallery-folders?eventId=${encodeURIComponent(eventId)}`)
      const data = (await res.json().catch(() => ({}))) as { folders?: FolderRow[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Falha ao listar pastas.')
        setFolders([])
        return
      }
      setFolders(Array.isArray(data.folders) ? data.folders : [])
    } catch {
      setError('Erro de rede.')
      setFolders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [eventId])

  function startEdit(f: FolderRow) {
    setEditingId(f.id)
    setEditTitle(f.title)
    setEditDriveUrl(f.driveUrl.startsWith('r2://') ? '' : f.driveUrl)
    setError(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  async function saveEdit(folderId: string, isR2: boolean) {
    setSavingId(folderId)
    setError(null)
    try {
      const body: { title?: string; driveUrl?: string } = { title: editTitle.trim() }
      if (!isR2 && editDriveUrl.trim()) {
        body.driveUrl = editDriveUrl.trim()
      }
      const res = await fetch(`/api/admin/gallery-folders/${encodeURIComponent(folderId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível salvar.')
        return
      }
      setEditingId(null)
      await load()
      router.refresh()
    } catch {
      setError('Erro de rede.')
    } finally {
      setSavingId(null)
    }
  }

  async function removeFolder(folderId: string, title: string) {
    if (!window.confirm(`Excluir a pasta "${title}"? No R2, todos os arquivos dessa pasta serão apagados do bucket.`)) {
      return
    }
    setDeletingId(folderId)
    setError(null)
    try {
      const res = await fetch(`/api/admin/gallery-folders/${encodeURIComponent(folderId)}`, {
        method: 'DELETE',
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Não foi possível excluir.')
        return
      }
      if (editingId === folderId) setEditingId(null)
      await load()
      router.refresh()
    } catch {
      setError('Erro de rede.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-warm-500">
          <FolderOpen className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-zinc-100">Pastas da galeria</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Edite nome ou link do Drive; exclua pastas R2 ou Drive. Excluir pasta R2 remove os arquivos no Cloudflare R2.
          </p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-6 text-sm text-zinc-500">Carregando…</p>
      ) : folders.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600">Nenhuma pasta vinculada a este projeto.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {folders.map((f) => {
            const isR2 = f.driveUrl.startsWith('r2://')
            const isEditing = editingId === f.id
            return (
              <li
                key={f.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs text-zinc-500">Nome</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                      />
                    </div>
                    {!isR2 ? (
                      <div>
                        <label className="mb-1 block text-xs text-zinc-500">URL do Google Drive</label>
                        <input
                          value={editDriveUrl}
                          onChange={(e) => setEditDriveUrl(e.target.value)}
                          type="url"
                          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-600">Pasta R2: apenas o nome pode ser alterado.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingId === f.id}
                        onClick={() => void saveEdit(f.id, isR2)}
                        className="rounded-lg bg-warm-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-warm-500 disabled:opacity-50"
                      >
                        {savingId === f.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-200">{f.title}</p>
                      <p className="mt-1 truncate text-xs text-zinc-500" title={f.driveUrl}>
                        {isR2 ? 'Armazenamento: R2' : f.driveUrl}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(f)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === f.id}
                        onClick={() => void removeFolder(f.id, f.title)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {deletingId === f.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
