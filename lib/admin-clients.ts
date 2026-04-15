import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── CRM Types ────────────────────────────────────────────────────────────────

export type ClientLoyaltyTier = 'nova' | 'recorrente' | 'vip'

export type AdminClientRow = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
  createdAt: string
  projectCount: number
  /** Soma de Event.sessionValue para todos os projetos do cliente (R$). */
  ltv: number
  lastEventDate: string | null
  /** lastEventDate + 90 dias; null se não tem histórico. */
  nextContactDate: string | null
  loyaltyTier: ClientLoyaltyTier
  /** Últimos 3 projetos para exibição no card */
  recentProjects: { id: string; title: string; coverUrl: string | null }[]
}

function deriveLoyaltyTier(projectCount: number): ClientLoyaltyTier {
  if (projectCount >= 5) return 'vip'
  if (projectCount >= 2) return 'recorrente'
  return 'nova'
}

const NEXT_CONTACT_DAYS = 90

export async function listAdminClients(): Promise<AdminClientRow[]> {
  const rows = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      createdAt: true,
      clientEvents: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          coverUrl: true,
          createdAt: true,
          sessionValue: true,
        },
      },
    },
  })

  return rows.map((u) => {
    const events = u.clientEvents
    const ltv = events.reduce((sum, e) => sum + (e.sessionValue ?? 0), 0)
    const lastEvent = events[0] ?? null
    const lastEventDate = lastEvent ? lastEvent.createdAt.toISOString() : null
    const nextContactDate = lastEvent
      ? new Date(lastEvent.createdAt.getTime() + NEXT_CONTACT_DAYS * 86400000).toISOString()
      : null

    return {
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      createdAt: u.createdAt.toISOString(),
      projectCount: events.length,
      ltv,
      lastEventDate,
      nextContactDate,
      loyaltyTier: deriveLoyaltyTier(events.length),
      recentProjects: events.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        coverUrl: e.coverUrl,
      })),
    }
  })
}

// ── Mantém export de ClientListItem para retrocompatibilidade ─────────────────
export type ClientListItem = {
  id: string
  name: string
  username: string | null
  email: string | null
  phone: string | null
  createdAt: string
  clientEvents: { id: string; title: string }[]
}

const emptyToUndef = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : v)
const onlyDigits = (value: string) => value.replace(/\D/g, '')

export function getDefaultClientPasswordFromPhone(phone: string) {
  const digits = onlyDigits(phone)
  return digits.slice(-5)
}

export const createClientSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  username: z
    .string()
    .trim()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres.')
    .transform((s) => s.toLowerCase()),
  email: z.preprocess(
    emptyToUndef,
    z.union([z.literal(''), z.string().trim().toLowerCase().email('E-mail inválido.')]).optional()
  ),
  phone: z.preprocess(
    emptyToUndef,
    z.string().trim().min(8, 'Telefone deve ter pelo menos 8 caracteres.')
  ),
})

export type CreateClientInput = z.infer<typeof createClientSchema>

export async function createClientUser(
  input: CreateClientInput
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const email = input.email?.trim() ? input.email.trim().toLowerCase() : null
  const phone = input.phone.trim()
  const defaultPassword = getDefaultClientPasswordFromPhone(phone)
  if (defaultPassword.length < 5) {
    return { ok: false, error: 'Telefone inválido para gerar a senha padrão.' }
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        username: input.username.trim().toLowerCase(),
        email,
        phone,
        passwordHash: await hashPassword(defaultPassword),
        mustChangePassword: true,
        role: 'CLIENT',
      },
      select: { id: true },
    })
    return { ok: true, id: user.id }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const fields = e.meta?.target
      const f = Array.isArray(fields) ? fields.join(', ') : 'campo único'
      if (String(f).includes('username')) {
        return { ok: false, error: 'Este nome de usuário já está em uso.' }
      }
      if (String(f).includes('email')) {
        return { ok: false, error: 'Este e-mail já está cadastrado.' }
      }
      if (String(f).includes('phone')) {
        return { ok: false, error: 'Este telefone já está cadastrado.' }
      }
      return { ok: false, error: 'Já existe um cadastro com estes dados.' }
    }
    throw e
  }
}

export function parseCreateClientBody(body: unknown) {
  return createClientSchema.safeParse(body)
}

export const updateClientSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  username: z
    .string()
    .trim()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres.')
    .transform((s) => s.toLowerCase()),
  email: z.union([z.literal(''), z.string().trim().toLowerCase().email('E-mail inválido.')]),
  phone: z.union([
    z.literal(''),
    z.string().trim().min(8, 'Telefone deve ter pelo menos 8 caracteres.'),
  ]),
  password: z.union([z.literal(''), z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres.')]).optional(),
})

export type UpdateClientInput = z.infer<typeof updateClientSchema>

export async function updateClientUser(
  clientId: string,
  input: UpdateClientInput
): Promise<{ ok: true } | { ok: false; error: string }> {
  const existing = await prisma.user.findFirst({
    where: { id: clientId, role: 'CLIENT' },
    select: { id: true },
  })
  if (!existing) {
    return { ok: false, error: 'Cliente não encontrado.' }
  }

  const email = input.email === '' ? null : input.email.trim().toLowerCase()
  const phone = input.phone === '' ? null : input.phone.trim().toLowerCase()

  const data: {
    name: string
    username: string
    email: string | null
    phone: string | null
    passwordHash?: string
  } = {
    name: input.name.trim(),
    username: input.username.trim().toLowerCase(),
    email,
    phone,
  }

  if (input.password && input.password.length > 0) {
    data.passwordHash = await hashPassword(input.password)
  }

  try {
    await prisma.user.update({
      where: { id: clientId },
      data,
    })
    return { ok: true }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'Usuário, e-mail ou telefone já em uso por outro cadastro.' }
    }
    throw e
  }
}
