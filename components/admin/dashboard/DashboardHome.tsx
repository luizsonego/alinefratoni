'use client'

import useSWR from 'swr'
import Link from 'next/link'
import {
  Activity,
  Cloud,
  FolderOpen,
  HardDrive,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Card } from '@/components/admin/ui/Card'
import type { DashboardStats } from '@/app/api/admin/stats/route'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}

function fmtK(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Falha ao carregar métricas')
  return r.json()
})

// ─── Sub-components ────────────────────────────────────────────────────────────

/** Card de KPI com glow de cor, badge de tendência e ícone */
function KPICard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  trendUp,
  trendLabel,
}: {
  label: string
  value: string
  hint: string
  icon: typeof FolderOpen
  accent: string        // cor Tailwind, ex: 'bg-warm-500'
  trendUp?: boolean
  trendLabel?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20 blur-2xl ${accent}`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
          <p className="mt-2 font-serif text-2xl font-semibold text-zinc-50 truncate">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{hint}</p>
          {trendLabel !== undefined && (
            <div className="mt-2 flex items-center gap-1.5">
              {trendUp ? (
                <TrendingUp className="h-3 w-3 text-emerald-400" strokeWidth={2} />
              ) : (
                <TrendingDown className="h-3 w-3 text-rose-400" strokeWidth={2} />
              )}
              <span className={`text-xs font-semibold ${trendUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 text-zinc-400">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
      </div>
    </Card>
  )
}

/** Gauge de armazenamento R2 com barra de progresso */
function StorageGauge({ r2 }: { r2: DashboardStats['r2'] }) {
  const pct = Math.round((r2.usedBytes / r2.quotaBytes) * 100)
  const statusColor =
    r2.status === 'online' ? 'text-emerald-400' :
    r2.status === 'degraded' ? 'text-amber-400' : 'text-rose-400'
  const statusLabel =
    r2.status === 'online' ? 'Online' :
    r2.status === 'degraded' ? 'Degradado' : 'Offline'

  return (
    <div className="space-y-4">
      {/* barra de uso */}
      <div>
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
          <span>{fmtBytes(r2.usedBytes)} usados</span>
          <span>{pct}% de {fmtBytes(r2.quotaBytes)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-warm-500 to-amber-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* estatísticas */}
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-800 bg-zinc-800">
        {[
          { label: 'Usado', val: fmtBytes(r2.usedBytes) },
          { label: 'Arquivos', val: fmtK(r2.totalFiles) },
          { label: 'R2 API', val: statusLabel },
        ].map(({ label, val }) => (
          <div key={label} className="bg-zinc-900/80 px-3 py-2.5 text-center">
            <p className={`text-sm font-semibold ${label === 'R2 API' ? statusColor : 'text-zinc-100'}`}>{val}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-zinc-600">{label}</p>
          </div>
        ))}
      </div>

      {/* status badge */}
      <div className="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
        <span className={`h-1.5 w-1.5 rounded-full ${r2.status === 'online' ? 'bg-emerald-400' : r2.status === 'degraded' ? 'bg-amber-400' : 'bg-rose-400'} animate-pulse`} />
        <span>Cloudflare R2 · <strong className={statusColor}>{statusLabel}</strong></span>
        <span className="ml-auto tabular-nums">{r2.latencyMs}ms</span>
      </div>
    </div>
  )
}

/** Cards de métricas CRM */
function CRMPanel({ stats }: { stats: DashboardStats }) {
  const items = [
    {
      emoji: '💎', label: 'LTV Médio', value: fmtBRL(stats.ltv),
      sub: 'Receita total ÷ clientes', color: 'text-warm-400',
    },
    {
      emoji: '🎯', label: 'CAC', value: stats.cac > 0 ? fmtBRL(stats.cac) : '—',
      sub: stats.cac > 0 ? 'Custo de aquisição' : 'Configure origem dos leads', color: 'text-sky-400',
    },
    {
      emoji: '🔁', label: 'Taxa de Retenção', value: `${stats.retentionRate}%`,
      sub: `${stats.returningClients} de ${stats.totalClients} retornaram`, color: 'text-emerald-400',
    },
    {
      emoji: '📈', label: 'ROI LTV/CAC', value: stats.ltvCacRatio > 0 ? `${stats.ltvCacRatio}×` : '—',
      sub: 'Retorno por R$1 investido', color: 'text-violet-400',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map(it => (
        <div key={it.label} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3">
          <div className="text-lg mb-1">{it.emoji}</div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{it.label}</p>
          <p className={`mt-1 font-serif text-xl font-semibold ${it.color}`}>{it.value}</p>
          <p className="mt-0.5 text-[10px] text-zinc-600 leading-tight">{it.sub}</p>
        </div>
      ))}
    </div>
  )
}

/** Pipeline de produção */
function PipelinePanel({ pipeline }: { pipeline: DashboardStats['pipeline'] }) {
  const stages = [
    { key: 'bruto',    label: 'Bruto',    color: 'text-violet-400', bar: 'bg-violet-500' },
    { key: 'editando', label: 'Editando', color: 'text-sky-400',    bar: 'bg-sky-500' },
    { key: 'selecao',  label: 'Seleção',  color: 'text-amber-400',  bar: 'bg-amber-500' },
    { key: 'entregue', label: 'Entregue', color: 'text-emerald-400',bar: 'bg-emerald-500' },
  ] as const

  const total = (pipeline.bruto + pipeline.editando + pipeline.selecao + pipeline.entregue) || 1

  return (
    <div className="grid grid-cols-4 gap-3">
      {stages.map(s => {
        const count = pipeline[s.key]
        const pct = Math.round((count / total) * 100)
        return (
          <div key={s.key} className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-center">
            <p className={`font-serif text-2xl font-semibold ${s.color}`}>{count}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">{s.label}</p>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-zinc-800">
              <div className={`h-full rounded-full ${s.bar} opacity-80`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Loyalty tier chips */
function LoyaltyTiers({ tiers }: { tiers: DashboardStats['loyaltyTiers'] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-800/60">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Fidelidade:</span>
      {[
        { label: `VIP (${tiers.vip})`,              dot: 'bg-emerald-400' },
        { label: `Recorrente (${tiers.recorrente})`, dot: 'bg-sky-400' },
        { label: `Nova (${tiers.nova})`,             dot: 'bg-warm-400' },
      ].map(({ label, dot }) => (
        <span key={label} className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-0.5 text-[11px] text-zinc-400">
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          {label}
        </span>
      ))}
    </div>
  )
}

/** Skeleton loader para KPI card */
function KPISkeleton() {
  return (
    <Card>
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-zinc-800" />
        <div className="h-7 w-32 rounded bg-zinc-800" />
        <div className="h-2.5 w-20 rounded bg-zinc-800" />
      </div>
    </Card>
  )
}

// ─── Dashboard Principal ───────────────────────────────────────────────────────

export function DashboardHome() {
  const { data: stats, error, isLoading, mutate } = useSWR<DashboardStats>(
    '/api/admin/stats',
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 min
      revalidateOnFocus: false,
    }
  )

  const isError = !!error

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-zinc-50">Central de Operações</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isLoading ? 'Carregando métricas…' : isError ? 'Erro ao carregar dados.' : 'Métricas atualizadas em tempo real.'}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} strokeWidth={2} />
          Atualizar
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : isError ? (
          <Card className="col-span-full">
            <p className="text-sm text-rose-400">Não foi possível carregar as métricas. <button className="underline" onClick={() => mutate()}>Tentar novamente</button></p>
          </Card>
        ) : stats ? (
          <>
            <KPICard
              label="Receita do Mês" value={fmtBRL(stats.mrr)}
              hint="vs. mês anterior" icon={Activity} accent="bg-warm-500"
              trendUp={stats.mrrGrowthPct >= 0}
              trendLabel={`${stats.mrrGrowthPct >= 0 ? '+' : ''}${stats.mrrGrowthPct}%`}
            />
            <KPICard
              label="Projetos Ativos" value={String(stats.activeProjects)}
              hint={`${stats.totalProjects} no total`} icon={FolderOpen} accent="bg-sky-500"
            />
            <KPICard
              label="Total de Clientes" value={String(stats.totalClients)}
              hint={`+${stats.newClientsThisMonth} novos este mês`} icon={Users} accent="bg-emerald-500"
              trendUp trendLabel={`+${stats.newClientsThisMonth}`}
            />
            <KPICard
              label="Armazenamento R2" value={fmtBytes(stats.r2.usedBytes)}
              hint={`${fmtK(stats.r2.totalFiles)} arquivos · ${Math.round(stats.r2.usedBytes / stats.r2.quotaBytes * 100)}% usado`}
              icon={HardDrive} accent="bg-violet-500"
            />
          </>
        ) : null}
      </div>

      {/* ── Pipeline ── */}
      {stats && (
        <Card padding="md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-serif text-base font-semibold text-zinc-100">Pipeline de Projetos</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Projetos ativos por fase de produção</p>
            </div>
            <Link href="/admin/projetos" className="text-xs font-medium text-warm-400 hover:text-warm-300">
              Ver todos →
            </Link>
          </div>
          <PipelinePanel pipeline={stats.pipeline} />
        </Card>
      )}

      {/* ── Bento: CRM + R2 + Atividade ── */}
      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* CRM */}
          <Card padding="md">
            <h2 className="font-serif text-base font-semibold text-zinc-100 mb-1">Métricas CRM</h2>
            <p className="text-xs text-zinc-500 mb-4">LTV · CAC · Retenção · Fidelidade</p>
            <CRMPanel stats={stats} />
            <LoyaltyTiers tiers={stats.loyaltyTiers} />
          </Card>

          {/* R2 Infraestrutura */}
          <Card padding="md">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-serif text-base font-semibold text-zinc-100">Infraestrutura R2</h2>
              <Cloud className="h-4 w-4 text-zinc-600" strokeWidth={1.5} />
            </div>
            <p className="text-xs text-zinc-500 mb-4">Cloudflare · bucket principal</p>
            <StorageGauge r2={stats.r2} />
          </Card>
        </div>
      )}

      {/* ── Receita Mensal (série) ── */}
      {stats && stats.monthlyRevenue.length > 0 && (
        <Card padding="md">
          <h2 className="font-serif text-base font-semibold text-zinc-100 mb-1">Receita Mensal</h2>
          <p className="text-xs text-zinc-500 mb-4">Evolução dos últimos 6 meses</p>
          <div className="flex items-end gap-2 h-28">
            {(() => {
              const maxR = Math.max(...stats.monthlyRevenue.map(m => m.receita), 1)
              return stats.monthlyRevenue.map(m => (
                <div key={m.mes} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-zinc-600 tabular-nums">
                    {m.receita > 0 ? `R$${Math.round(m.receita / 1000)}k` : '—'}
                  </span>
                  <div className="w-full overflow-hidden rounded-t-sm bg-zinc-800" style={{ height: 72 }}>
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-warm-700 to-warm-400 transition-all duration-700"
                      style={{ height: `${Math.round((m.receita / maxR) * 100)}%`, marginTop: 'auto' }}
                    />
                  </div>
                  <span className="text-[10px] font-medium capitalize text-zinc-500">{m.mes}</span>
                </div>
              ))
            })()}
          </div>
        </Card>
      )}

    </div>
  )
}
