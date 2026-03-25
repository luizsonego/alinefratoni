'use client'

import { Calendar, FolderOpen, Grid3X3, List, Share2, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { AdminProjectRow, AdminProjectStatus } from '@/lib/admin-projects'
import { adminProjectStatusLabels } from '@/lib/admin-projects'
import { Card } from '@/components/admin/ui/Card'
import { Dropdown, DropdownItem } from '@/components/admin/ui/Dropdown'
import { EmptyState } from '@/components/admin/ui/EmptyState'
import { Tooltip } from '@/components/admin/ui/Tooltip'

const statusStyle: Record<AdminProjectStatus, string> = {
  editing: 'bg-amber-500/15 text-amber-400 ring-amber-500/20',
  delivered: 'bg-sky-500/15 text-sky-300 ring-sky-500/20',
}

type ProjectsListProps = {
  projects: AdminProjectRow[]
}

export function ProjectsList({ projects }: ProjectsListProps) {
  const router = useRouter()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function deleteProject(projectId: string, title: string) {
    if (!window.confirm(`Excluir o projeto «${title}»? Pastas e vínculos serão removidos.`)) return
    setDeletingId(projectId)
    try {
      const res = await fetch(`/api/admin/events/${encodeURIComponent(projectId)}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        window.alert(data.error ?? 'Não foi possível excluir.')
        return
      }
      router.refresh()
    } finally {
      setDeletingId(null)
    }
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Nenhum projeto ainda"
        description="Crie um projeto, vincule a um cliente e envie fotos (R2) ou cadastre vídeos pelo Google Drive."
        action={
          <Link
            href="/admin/projetos/novo"
            className="rounded-xl bg-warm-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-warm-500"
          >
            Novo projeto
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {projects.length} projeto{projects.length !== 1 ? 's' : ''}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-zinc-800 bg-zinc-950/80 p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} padding="none" className="group overflow-hidden">
              <Link href={`/admin/projetos/${p.id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
                  <Image
                    src={p.coverUrl}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                    unoptimized={p.coverUrl.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <span
                    className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusStyle[p.status]}`}
                  >
                    {adminProjectStatusLabels[p.status]}
                  </span>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-serif text-lg font-semibold text-white drop-shadow">{p.title}</h3>
                    <p className="mt-1 text-sm text-zinc-300">{p.clientName}</p>
                  </div>
                </div>
              </Link>
              <div className="flex items-center justify-between gap-2 border-t border-zinc-800/80 px-4 py-3">
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span>
                    {p.folderCount} pasta{p.folderCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <ProjectQuickActions
                  projectId={p.id}
                  onDelete={() => deleteProject(p.id, p.title)}
                  deleting={deletingId === p.id}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wider text-zinc-500">
                  <th className="px-5 py-3 font-medium">Evento</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Pastas</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-800/80 transition hover:bg-zinc-900/40">
                    <td className="px-5 py-4">
                      <Link href={`/admin/projetos/${p.id}`} className="font-medium text-zinc-100 hover:text-warm-400">
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{p.clientName}</td>
                    <td className="px-5 py-4 text-zinc-500">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">{p.folderCount}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${statusStyle[p.status]}`}
                      >
                        {adminProjectStatusLabels[p.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ProjectQuickActions
                        projectId={p.id}
                        onDelete={() => deleteProject(p.id, p.title)}
                        deleting={deletingId === p.id}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

function ProjectQuickActions({
  projectId,
  onDelete,
  deleting,
}: {
  projectId: string
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <Tooltip label="Abrir galeria">
        <Link
          href={`/admin/projetos/${projectId}`}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <FolderOpen className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Tooltip label="Compartilhar">
        <Link
          href="/admin/compartilhamento"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Share2 className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Tooltip label="Upload">
        <Link
          href={`/admin/upload?eventId=${encodeURIComponent(projectId)}`}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Upload className="h-4 w-4" />
        </Link>
      </Tooltip>
      <Dropdown label="Mais">
        <div className="p-1">
          <DropdownItem
            danger
            onClick={() => {
              if (!deleting) onDelete()
            }}
          >
            <span className="inline-flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Excluindo…' : 'Excluir'}
            </span>
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  )
}
