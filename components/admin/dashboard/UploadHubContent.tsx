'use client'

import { FolderKanban, Plus, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/admin/ui/Card'

export function UploadHubContent() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <Card padding="lg" className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-warm-500">
          <UploadCloud className="h-7 w-7" strokeWidth={1.25} />
        </div>
        <h2 className="font-serif text-xl font-semibold text-zinc-50">Upload por projeto</h2>
        <p className="mt-2 text-sm text-zinc-500">
          O envio de fotos (R2) e o cadastro do link de vídeos no Drive ficam vinculados a um projeto. Crie um novo
          projeto ou abra o upload a partir de um projeto existente.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/admin/projetos/novo"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-warm-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-warm-900/25 hover:bg-warm-500"
          >
            <Plus className="h-4 w-4" />
            Novo projeto
          </Link>
          <Link
            href="/admin/projetos"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900"
          >
            <FolderKanban className="h-4 w-4" />
            Lista de projetos
          </Link>
        </div>
        <p className="mt-6 text-xs text-zinc-600">
          Após criar um projeto, você será redirecionado automaticamente para esta página com o upload liberado.
        </p>
      </Card>
    </div>
  )
}
