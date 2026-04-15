'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type EventOption = {
  id: string
  title: string
  clientName: string
}

type FolderOption = {
  id: string
  title: string
  driveUrl: string
}

type UploadStatus = 'pending' | 'uploading' | 'done' | 'error'

type UploadItem = {
  id: string
  file: File
  status: UploadStatus
  progress: number
  uploadedBytes: number
  totalBytes: number
  startedAt: number | null
  etaSeconds: number | null
  error: string | null
}

type Props = {
  events: EventOption[]
  r2Enabled: boolean
  /** Fixa o evento (oculta o seletor) — fluxo pós-criação de projeto */
  lockedEventId?: string
  lockedEventLabel?: string
  /** Somente imagens para R2; vídeos ficam no Google Drive */
  imagesOnly?: boolean
}

/** Máximo de uploads simultâneos (evita travar o navegador com muitas conexões). */
const MAX_PARALLEL_UPLOADS = 3

/** Intervalo mínimo entre atualizações de UI de progresso por arquivo (ms). */
const PROGRESS_UI_MS = 200

function formatDuration(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return '--:--'
  const safe = Math.ceil(seconds)
  const mm = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0')
  const ss = Math.floor(safe % 60)
    .toString()
    .padStart(2, '0')
  return `${mm}:${ss}`
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function isImageOrVideo(file: File) {
  return file.type.startsWith('image/') || file.type.startsWith('video/')
}

function nameLooksLikeImage(name: string) {
  return /\.(jpe?g|png|gif|webp|avif|heic|heif|bmp)$/i.test(name)
}

function isImage(file: File) {
  return file.type.startsWith('image/') || nameLooksLikeImage(file.name)
}

async function parseJsonSafe(response: Response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function putWithProgress(
  file: File,
  folderId: string,
  onProgress: (loaded: number, total: number) => void,
  expectImageOnly: boolean
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/admin/r2/upload')
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded, event.total)
      }
    }
    xhr.onerror = () => reject(new Error('Falha de rede no upload.'))
    xhr.onabort = () => reject(new Error('Upload cancelado.'))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        let message = `Upload falhou com status ${xhr.status}.`
        try {
          const parsed = JSON.parse(xhr.responseText) as { error?: string }
          if (parsed?.error) message = parsed.error
        } catch {
          // sem JSON de erro
        }
        reject(new Error(message))
      }
    }

    const formData = new FormData()
    formData.append('folderId', folderId)
    formData.append('file', file)
    if (expectImageOnly) {
      formData.append('expectImage', '1')
    }
    xhr.send(formData)
  })
}

export default function R2UploadPanel({
  events,
  r2Enabled,
  lockedEventId,
  lockedEventLabel,
  imagesOnly = false,
}: Props) {
  const [eventId, setEventId] = useState(lockedEventId ?? '')
  const [folderTitle, setFolderTitle] = useState('')
  const [folders, setFolders] = useState<FolderOption[]>([])
  const [folderId, setFolderId] = useState('')
  const [loadingFolders, setLoadingFolders] = useState(false)
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([])
  const [dragOver, setDragOver] = useState(false)

  const uploadQueueRef = useRef<UploadItem[]>([])
  const folderIdRef = useRef(folderId)
  const imagesOnlyRef = useRef(imagesOnly)
  const progressLastUiRef = useRef<Map<string, number>>(new Map())
  const pumpScheduledRef = useRef(false)
  const pumpWorkersRef = useRef<() => void>(() => {})

  folderIdRef.current = folderId
  imagesOnlyRef.current = imagesOnly

  function tryClaimNextWorker(): { item: UploadItem; startedAt: number } | null {
    const q = uploadQueueRef.current
    const uploading = q.filter((i) => i.status === 'uploading').length
    if (uploading >= MAX_PARALLEL_UPLOADS) return null
    const idx = q.findIndex((i) => i.status === 'pending')
    if (idx === -1) return null
    const item = q[idx]
    const startedAt = Date.now()
    const next = q.map((it, i) =>
      i === idx ? { ...it, status: 'uploading' as const, startedAt, error: null } : it
    )
    uploadQueueRef.current = next
    setUploadQueue(next)
    return { item, startedAt }
  }

  function updateItemProgress(id: string, loaded: number, total: number, startedAt: number) {
    const now = Date.now()
    const last = progressLastUiRef.current.get(id) ?? 0
    if (now - last < PROGRESS_UI_MS && loaded < total) return
    progressLastUiRef.current.set(id, now)

    const elapsedMs = Math.max(now - startedAt, 1)
    const speed = loaded / (elapsedMs / 1000)
    const remaining = Math.max(total - loaded, 0)
    const etaSeconds = speed > 0 ? remaining / speed : null
    const progress = total > 0 ? (loaded / total) * 100 : 0

    const next = uploadQueueRef.current.map((it) =>
      it.id === id ? { ...it, uploadedBytes: loaded, totalBytes: total, progress, etaSeconds } : it
    )
    uploadQueueRef.current = next
    setUploadQueue(next)
  }

  function markItemDone(id: string) {
    const next = uploadQueueRef.current.map((it) =>
      it.id === id
        ? {
            ...it,
            status: 'done' as const,
            progress: 100,
            etaSeconds: 0,
            uploadedBytes: it.totalBytes,
          }
        : it
    )
    uploadQueueRef.current = next
    setUploadQueue(next)
    progressLastUiRef.current.delete(id)
  }

  function markItemError(id: string, error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha no upload.'
    const next = uploadQueueRef.current.map((it) =>
      it.id === id ? { ...it, status: 'error' as const, error: message } : it
    )
    uploadQueueRef.current = next
    setUploadQueue(next)
    progressLastUiRef.current.delete(id)
  }

  function pumpWorkers() {
    if (!folderIdRef.current) return
    while (true) {
      const q = uploadQueueRef.current
      const uploading = q.filter((i) => i.status === 'uploading').length
      const hasPending = q.some((i) => i.status === 'pending')
      if (!hasPending || uploading >= MAX_PARALLEL_UPLOADS) break
      const claimed = tryClaimNextWorker()
      if (!claimed) break
      void runOneUpload(claimed.item, claimed.startedAt)
    }
  }

  function schedulePump() {
    if (pumpScheduledRef.current) return
    pumpScheduledRef.current = true
    queueMicrotask(() => {
      pumpScheduledRef.current = false
      pumpWorkers()
    })
  }

  async function runOneUpload(item: UploadItem, startedAt: number) {
    const fid = folderIdRef.current
    if (!fid) {
      markItemError(item.id, new Error('Selecione uma pasta de upload.'))
      schedulePump()
      return
    }
    try {
      await putWithProgress(
        item.file,
        fid,
        (loaded, total) => updateItemProgress(item.id, loaded, total, startedAt),
        imagesOnlyRef.current
      )
      markItemDone(item.id)
    } catch (error) {
      markItemError(item.id, error)
    } finally {
      schedulePump()
    }
  }

  pumpWorkersRef.current = pumpWorkers

  useEffect(() => {
    if (lockedEventId) {
      setEventId(lockedEventId)
    }
  }, [lockedEventId])

  useEffect(() => {
    async function loadFolders() {
      if (!eventId) {
        setFolders([])
        setFolderId('')
        return
      }

      setLoadingFolders(true)
      try {
        const response = await fetch(`/api/admin/r2/folders?eventId=${encodeURIComponent(eventId)}`)
        const data = await parseJsonSafe(response)
        if (!response.ok) {
          throw new Error((data as { error?: string } | null)?.error ?? 'Não foi possível listar pastas.')
        }
        const nextFolders = Array.isArray((data as { folders?: FolderOption[] } | null)?.folders)
          ? ((data as { folders: FolderOption[] }).folders)
          : []
        setFolders(nextFolders)
        setFolderId((prev) => (nextFolders.some((f: FolderOption) => f.id === prev) ? prev : nextFolders[0]?.id ?? ''))
      } catch {
        setFolders([])
        setFolderId('')
      } finally {
        setLoadingFolders(false)
      }
    }

    void loadFolders()
  }, [eventId])

  const queueStats = useMemo(() => {
    const total = uploadQueue.length
    const done = uploadQueue.filter((item) => item.status === 'done').length
    const uploading = uploadQueue.filter((item) => item.status === 'uploading').length
    const pending = uploadQueue.filter((item) => item.status === 'pending').length
    const error = uploadQueue.filter((item) => item.status === 'error').length
    return { total, done, uploading, pending, error }
  }, [uploadQueue])

  async function createFolder() {
    if (!eventId || !folderTitle.trim()) return
    setCreatingFolder(true)
    try {
      const response = await fetch('/api/admin/r2/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, title: folderTitle }),
      })
      const data = await parseJsonSafe(response)
      if (!response.ok) {
        throw new Error((data as { error?: string } | null)?.error ?? 'Não foi possível criar pasta.')
      }
      if (!(data as { folder?: FolderOption } | null)?.folder) {
        throw new Error('Resposta inválida ao criar pasta.')
      }
      setFolders((prev) => [data.folder, ...prev])
      setFolderId(data.folder.id)
      setFolderTitle('')
    } catch (error) {
      // eslint-disable-next-line no-alert
      window.alert(error instanceof Error ? error.message : 'Falha ao criar pasta.')
    } finally {
      setCreatingFolder(false)
    }
  }

  function enqueueFiles(files: File[]) {
    const valid = files.filter(imagesOnly ? isImage : isImageOrVideo)
    if (!valid.length) return

    const items: UploadItem[] = valid.map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      status: 'pending',
      progress: 0,
      uploadedBytes: 0,
      totalBytes: file.size,
      startedAt: null,
      etaSeconds: null,
      error: null,
    }))
    setUploadQueue((prev) => {
      const next = [...prev, ...items]
      uploadQueueRef.current = next
      return next
    })
    schedulePump()
  }

  useEffect(() => {
    queueMicrotask(() => pumpWorkersRef.current())
  }, [folderId])

  const heading = imagesOnly ? 'Fotos (R2)' : '3) Cloudflare R2 (pasta + upload)'
  const sub =
    imagesOnly && lockedEventId
      ? 'Apenas imagens — vídeos devem ser cadastrados na aba com link do Google Drive.'
      : 'Crie pastas no R2 e envie imagens/videos com arrastar e soltar.'

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <p className="mt-1 text-sm text-zinc-400">{sub}</p>

      {!r2Enabled && (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Configure as variáveis do R2 no ambiente para habilitar esta área.
        </p>
      )}

      <div className="mt-5 space-y-3">
        {lockedEventId ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-300">
            <span className="text-zinc-500">Projeto · </span>
            {lockedEventLabel ?? `ID ${lockedEventId}`}
          </div>
        ) : (
          <select
            name="eventId"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          >
            <option value="">Selecione o evento</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {event.clientName}
              </option>
            ))}
          </select>
        )}

        <div className="flex gap-2">
          <input
            value={folderTitle}
            onChange={(e) => setFolderTitle(e.target.value)}
            placeholder="Nome da pasta no R2"
            className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            disabled={!eventId || !r2Enabled}
          />
          <button
            type="button"
            onClick={() => void createFolder()}
            disabled={!eventId || !folderTitle.trim() || creatingFolder || !r2Enabled}
            className="rounded-md border border-zinc-600 px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creatingFolder ? 'Criando...' : 'Criar pasta'}
          </button>
        </div>

        <select
          value={folderId}
          onChange={(e) => setFolderId(e.target.value)}
          disabled={!eventId || loadingFolders || !r2Enabled}
          className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
        >
          <option value="">
            {loadingFolders ? 'Carregando pastas...' : 'Selecione a pasta de upload'}
          </option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.title}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (folderId && r2Enabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!folderId || !r2Enabled) return
          enqueueFiles(Array.from(e.dataTransfer.files))
        }}
        className={`mt-5 rounded-xl border border-dashed p-6 text-center transition ${
          dragOver
            ? 'border-white bg-white/5'
            : 'border-zinc-700 bg-zinc-950/30'
        }`}
      >
        <p className="text-sm text-zinc-300">Arraste arquivos aqui</p>
        <p className="mt-1 text-xs text-zinc-500">
          {imagesOnly ? 'Somente imagens (JPG, PNG, WebP, etc.)' : 'ou selecione manualmente (imagens e videos)'}
        </p>
        <label className="mt-4 inline-flex cursor-pointer rounded-md bg-warm-600 px-4 py-2 text-xs font-semibold text-white hover:bg-warm-700">
          Selecionar arquivos
          <input
            type="file"
            multiple
            className="hidden"
            disabled={!folderId || !r2Enabled}
            accept={imagesOnly ? 'image/*' : 'image/*,video/*'}
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : []
              enqueueFiles(files)
              e.currentTarget.value = ''
            }}
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 text-xs text-zinc-400">
        Fila: {queueStats.total} arquivos · enviando {queueStats.uploading} · pendentes{' '}
        {queueStats.pending} · concluídos {queueStats.done} · erro {queueStats.error}
      </div>

      <ul className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
        {uploadQueue.map((item) => (
          <li key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-zinc-200">{item.file.name}</span>
              <span className="shrink-0 text-zinc-400">
                {item.status === 'uploading' && `${item.progress.toFixed(0)}%`}
                {item.status === 'done' && 'Concluído'}
                {item.status === 'pending' && 'Pendente'}
                {item.status === 'error' && 'Erro'}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded bg-zinc-800">
              <div
                className={`h-full rounded ${
                  item.status === 'error' ? 'bg-red-500' : 'bg-warm-600'
                }`}
                style={{ width: `${Math.max(2, item.progress)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-zinc-500">
              <span>
                {formatBytes(item.uploadedBytes)} / {formatBytes(item.totalBytes)}
              </span>
              <span>ETA: {formatDuration(item.etaSeconds)}</span>
            </div>
            {item.error && <p className="mt-2 text-[11px] text-red-300">{item.error}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
