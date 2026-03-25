import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const encoder = new TextEncoder()

function getJwtSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET não configurado no ambiente.')
  }
  return encoder.encode(secret)
}

function shareCookieName(slug: string) {
  return `estudio_share_${slug}`
}

function jwtExpSeconds(linkExpiresAt: Date | null): number {
  const now = Math.floor(Date.now() / 1000)
  const maxSession = now + 60 * 60 * 24 * 7 // 7 dias máx. na sessão do link
  if (!linkExpiresAt) {
    return maxSession
  }
  const linkEnd = Math.floor(linkExpiresAt.getTime() / 1000)
  return Math.min(maxSession, linkEnd)
}

export async function createShareAccessJwt(slug: string, linkExpiresAt: Date | null) {
  const exp = jwtExpSeconds(linkExpiresAt)
  const token = await new SignJWT({ typ: 'share', slug })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(getJwtSecret())
  return { token, exp }
}

export async function setShareAccessCookie(slug: string, linkExpiresAt: Date | null) {
  const { token, exp } = await createShareAccessJwt(slug, linkExpiresAt)
  const maxAge = Math.max(0, exp - Math.floor(Date.now() / 1000))
  cookies().set(shareCookieName(slug), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}

export async function verifyShareAccessCookie(slug: string): Promise<boolean> {
  const raw = cookies().get(shareCookieName(slug))?.value
  if (!raw) return false
  try {
    const { payload } = await jwtVerify(raw, getJwtSecret())
    return payload.typ === 'share' && String(payload.slug) === slug
  } catch {
    return false
  }
}

export function clearShareAccessCookie(slug: string) {
  cookies().delete(shareCookieName(slug))
}
