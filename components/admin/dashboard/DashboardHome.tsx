import {
  Activity,
  FolderOpen,
  HardDrive,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import {
  dashboardTotals,
  formatBytes,
  mockActivities,
  mockRecentUploads,
} from '@/lib/mock-data/admin-dashboard'
import { Card } from '@/components/admin/ui/Card'

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  hint: string
  icon: typeof FolderOpen
  accent: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-zinc-50">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{hint}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-400">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  )
}

const kindIcon = {
  upload: Sparkles,
  share: TrendingUp,
  client: Users,
  project: FolderOpen,
}

export function DashboardHome() {
  const used = formatBytes(dashboardTotals.storageUsedBytes)
  const quota = formatBytes(dashboardTotals.storageQuotaBytes)
  const pct = Math.round((dashboardTotals.storageUsedBytes / dashboardTotals.storageQuotaBytes) * 100)

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Projetos"
          value={String(dashboardTotals.totalProjects)}
          hint="Eventos ativos no período"
          icon={FolderOpen}
          accent="bg-warm-500"
        />
        <MetricCard
          label="Espaço utilizado"
          value={used}
          hint={`${pct}% de ${quota} (simulado)`}
          icon={HardDrive}
          accent="bg-amber-500"
        />
        <MetricCard
          label="Clientes ativos"
          value={String(dashboardTotals.activeClients)}
          hint="Com acesso às galerias"
          icon={Users}
          accent="bg-emerald-500"
        />
        <MetricCard
          label="Atividade"
          value="Alta"
          hint="Últimos 7 dias"
          icon={Activity}
          accent="bg-sky-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3" padding="lg">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-semibold text-zinc-100">Atividade recente</h2>
              <p className="text-sm text-zinc-500">Timeline de uploads, compartilhamentos e seleções</p>
            </div>
            <Link
              href="/admin/projetos"
              className="text-sm font-medium text-warm-400 hover:text-warm-300"
            >
              Ver projetos
            </Link>
          </div>
          <ul className="mt-8 space-y-0">
            {mockActivities.map((item, i) => {
              const Icon = kindIcon[item.kind]
              return (
                <li key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
                  {i < mockActivities.length - 1 ? (
                    <span className="absolute left-[15px] top-8 h-[calc(100%-0.5rem)] w-px bg-zinc-800" />
                  ) : null}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-medium text-zinc-200">{item.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-500">{item.description}</p>
                    <p className="mt-2 text-xs text-zinc-600">{item.time}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-2" padding="lg">
          <h2 className="font-serif text-lg font-semibold text-zinc-100">Uploads recentes</h2>
          <p className="text-sm text-zinc-500">Status simulado de fila de envio</p>
          <ul className="mt-6 space-y-3">
            {mockRecentUploads.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3"
              >
                <div
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800"
                  style={
                    u.previewUrl
                      ? { backgroundImage: `url(${u.previewUrl})`, backgroundSize: 'cover' }
                      : undefined
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">{u.name}</p>
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        u.status === 'done'
                          ? 'w-full bg-emerald-500'
                          : u.status === 'processing'
                            ? 'w-2/3 bg-amber-500'
                            : 'w-1/3 bg-warm-500'
                      }`}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-600">
                    {u.status === 'done' && 'Concluído'}
                    {u.status === 'processing' && 'Processando'}
                    {u.status === 'uploading' && 'Enviando'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/upload"
            className="mt-6 flex w-full items-center justify-center rounded-xl border border-zinc-700 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            Ir para upload
          </Link>
        </Card>
      </div>
    </div>
  )
}
