import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const SESSION_COOKIE = 'estudio_session'
const encoder = new TextEncoder()

type SessionPayload = {
  sub: string
  role: 'ADMIN' | 'CLIENT'
}

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET não configurado no ambiente.')
  }
  return encoder.encode(secret)
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE)
}

export async function readSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      sub: String(payload.sub),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
    }
  } catch {
    return null
  }
}

export async function requireUser(role?: 'ADMIN' | 'CLIENT') {
  const session = await readSession()
  if (!session) {
    redirect('/login')
  }

  if (role && session.role !== role) {
    redirect(session.role === 'ADMIN' ? '/admin' : '/cliente')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
  })

  if (!user) {
    clearSession()
    redirect('/login')
  }

  if (role === 'CLIENT' && user.mustChangePassword) {
    redirect('/primeiro-acesso')
  }

  return user
}

export async function loginWithIdentifier(identifier: string, password: string) {
  const normalized = identifier.trim().toLowerCase()
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: normalized }, { email: normalized }, { phone: normalized }],
    },
  })

  if (!user) return null

  const isValid = await verifyPassword(password, user.passwordHash)
  if (!isValid) return null

  await createSession({
    sub: user.id,
    role: user.role,
  })

  return user
}
