// GET /api/admin/stats
// Endpoint consolidado de métricas do dashboard — retorna tudo em uma única requisição.
//
// Cache:
//  - Métricas de projetos/pipeline: cache em memória 5 min
//  - Métricas de clientes/CRM: cache em memória 10 min
//  - Infra R2: cache em memória 10 min (ListObjectsV2 caro)
//  - HTTP: stale-while-revalidate 300 s

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readSession } from '@/lib/auth'
import { isR2Configured } from '@/lib/r2'
import {
  S3Client,
  ListObjectsV2Command,
  HeadBucketCommand,
} from '@aws-sdk/client-s3'

// ─── Tipos exportados (compartilhados com o cliente via import de tipos) ──────

export interface DashboardStats {
  // Financeiro
  mrr: number
  mrrGrowthPct: number
  totalRevenue: number
  avgSessionValue: number

  // Clientes
  totalClients: number
  newClientsThisMonth: number
  returningClients: number
  retentionRate: number

  // CRM
  ltv: number
  cac: number
  ltvCacRatio: number
  loyaltyTiers: { nova: number; recorrente: number; vip: number }

  // Projetos
  totalProjects: number
  activeProjects: number
  deliveredThisMonth: number
  pipeline: { bruto: number; editando: number; selecao: number; entregue: number }

  // Série temporal (6 meses)
  monthlyRevenue: { mes: string; receita: number; projetos: number; clientes: number }[]

  // R2
  r2: {
    usedBytes: number
    quotaBytes: number
    totalFiles: number
    status: 'online' | 'degraded' | 'offline'
    latencyMs: number
  }
}

// ─── Cache em memória ─────────────────────────────────────────────────────────

interface CacheEntry<T> { data: T; expiresAt: number }
const MEM: Map<string, CacheEntry<unknown>> = new Map()

function memGet<T>(key: string): T | null {
  const e = MEM.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) { MEM.delete(key); return null }
  return e.data as T
}
function memSet<T>(key: string, data: T, ttlMs: number) {
  MEM.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// ─── Query: métricas de clientes e CRM ───────────────────────────────────────

type ClientMetrics = Pick<DashboardStats,
  'totalClients' | 'newClientsThisMonth' | 'returningClients' | 'retentionRate'
  | 'ltv' | 'cac' | 'ltvCacRatio' | 'loyaltyTiers'
>

async function fetchClientMetrics(): Promise<ClientMetrics> {
  const cached = memGet<ClientMetrics>('client-metrics')
  if (cached) return cached

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: {
      id: true,
      createdAt: true,
      acquisitionSource: true,
      clientEvents: { select: { sessionValue: true } },
    },
  })

  const totalClients = clients.length
  const newClientsThisMonth = clients.filter(c => c.createdAt >= startOfMonth).length
  const returningClients = clients.filter(c => c.clientEvents.length > 1).length
  const retentionRate = totalClients > 0 ? Math.round((returningClients / totalClients) * 100) : 0

  const totalRevenue = clients.reduce(
    (sum, c) => sum + c.clientEvents.reduce((s, e) => s + (e.sessionValue ?? 0), 0),
    0
  )
  const ltv = totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0

  // Loyalty tiers (regra igual a admin-clients.ts)
  const loyaltyTiers = { nova: 0, recorrente: 0, vip: 0 }
  for (const c of clients) {
    const n = c.clientEvents.length
    if (n >= 5) loyaltyTiers.vip++
    else if (n >= 2) loyaltyTiers.recorrente++
    else loyaltyTiers.nova++
  }

  // CAC: calculado apenas quando acquisitionSource estiver preenchido
  const clientsWithSource = clients.filter(c => c.acquisitionSource)
  const cac = clientsWithSource.length > 0
    ? Math.round(totalRevenue / clientsWithSource.length)
    : 0
  const ltvCacRatio = cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0

  const result: ClientMetrics = {
    totalClients, newClientsThisMonth, returningClients, retentionRate,
    ltv, cac, ltvCacRatio, loyaltyTiers,
  }
  memSet('client-metrics', result, 10 * 60_000)
  return result
}

// ─── Query: métricas de projetos e pipeline ──────────────────────────────────

type ProjectMetrics = Pick<DashboardStats,
  'totalProjects' | 'activeProjects' | 'deliveredThisMonth' | 'pipeline'
  | 'mrr' | 'mrrGrowthPct' | 'totalRevenue' | 'avgSessionValue' | 'monthlyRevenue'
>

async function fetchProjectMetrics(): Promise<ProjectMetrics> {
  const cached = memGet<ProjectMetrics>('project-metrics')
  if (cached) return cached

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const events = await prisma.event.findMany({
    select: {
      id: true,
      clientId: true,
      shootDate: true,
      deliveredAt: true,
      sessionValue: true,
      _count: { select: { folders: true } },
    },
  })

  const pipeline = { bruto: 0, editando: 0, selecao: 0, entregue: 0 }
  let mrr = 0
  let lastMonthRevenue = 0
  let deliveredThisMonth = 0
  const totalRevenue = events.reduce((s, e) => s + (e.sessionValue ?? 0), 0)
  const deliveredCount = events.filter(e => e.deliveredAt).length
  const avgSessionValue = deliveredCount > 0 ? Math.round(totalRevenue / deliveredCount) : 0

  for (const e of events) {
    const val = e.sessionValue ?? 0
    if (e.deliveredAt) {
      pipeline.entregue++
      if (e.deliveredAt >= startOfMonth) { mrr += val; deliveredThisMonth++ }
      if (e.deliveredAt >= startOfLastMonth && e.deliveredAt <= endOfLastMonth) {
        lastMonthRevenue += val
      }
    } else if (e._count.folders > 0) {
      pipeline.selecao++
    } else if (e.shootDate) {
      const daysSince = (Date.now() - e.shootDate.getTime()) / 86_400_000
      if (daysSince > 15) pipeline.editando++
      else pipeline.editando++
    } else {
      pipeline.bruto++
    }
  }

  const mrrGrowthPct = lastMonthRevenue > 0
    ? Math.round(((mrr - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
    : 0

  // Série temporal: últimos 6 meses
  const monthlyRevenue: ProjectMetrics['monthlyRevenue'] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
    const monthEvents = events.filter(e => e.deliveredAt && e.deliveredAt >= start && e.deliveredAt <= end)
    const uniqueClients = new Set(monthEvents.map(e => e.clientId)).size
    monthlyRevenue.push({
      mes: start.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      receita: Math.round(monthEvents.reduce((s, e) => s + (e.sessionValue ?? 0), 0)),
      projetos: monthEvents.length,
      clientes: uniqueClients,
    })
  }

  const result: ProjectMetrics = {
    totalProjects: events.length,
    activeProjects: events.filter(e => !e.deliveredAt).length,
    deliveredThisMonth, pipeline, mrr, mrrGrowthPct, totalRevenue,
    avgSessionValue, monthlyRevenue,
  }
  memSet('project-metrics', result, 5 * 60_000)
  return result
}

// ─── R2 infra stats ───────────────────────────────────────────────────────────

async function fetchR2Stats(): Promise<DashboardStats['r2']> {
  const cached = memGet<DashboardStats['r2']>('r2-stats')
  if (cached) return cached

  const quotaBytes = Number(process.env.R2_QUOTA_BYTES ?? 107_374_182_400)
  const fallback: DashboardStats['r2'] = {
    usedBytes: 0, quotaBytes, totalFiles: 0, status: 'offline', latencyMs: 0,
  }

  if (!isR2Configured()) return fallback

  try {
    const s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
    const bucket = process.env.R2_BUCKET!

    // Health check com medição de latência
    const t0 = Date.now()
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
    const latencyMs = Date.now() - t0

    // Paginação completa acumulando size + count
    let usedBytes = 0
    let totalFiles = 0
    let token: string | undefined

    do {
      const res = await s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          ContinuationToken: token,
          MaxKeys: 1000,
        })
      )
      for (const obj of res.Contents ?? []) {
        if (obj.Key?.endsWith('.keep')) continue
        totalFiles++
        usedBytes += obj.Size ?? 0
      }
      token = res.IsTruncated ? res.NextContinuationToken : undefined
    } while (token)

    const result: DashboardStats['r2'] = {
      usedBytes, totalFiles, quotaBytes,
      status: latencyMs < 800 ? 'online' : 'degraded',
      latencyMs,
    }
    memSet('r2-stats', result, 10 * 60_000)
    return result
  } catch {
    return fallback
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export const revalidate = 300

export async function GET() {
  const session = await readSession()
  if (session?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [clientMetrics, projectMetrics, r2] = await Promise.all([
    fetchClientMetrics(),
    fetchProjectMetrics(),
    fetchR2Stats(),
  ])

  const stats: DashboardStats = { ...clientMetrics, ...projectMetrics, r2 }

  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'private, max-age=300, stale-while-revalidate=60' },
  })
}
