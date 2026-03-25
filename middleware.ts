import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

const encoder = new TextEncoder()

function getSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) return null
  return encoder.encode(secret)
}

async function getSessionFromRequest(req: NextRequest) {
  const token = req.cookies.get('estudio_session')?.value
  const secret = getSecret()
  if (!token || !secret) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      sub: String(payload.sub),
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'CLIENT',
    }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = await getSessionFromRequest(req)

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/cliente', req.url))
    }
  }

  if (pathname.startsWith('/cliente')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  if (pathname.startsWith('/primeiro-acesso')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (session.role !== 'CLIENT') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*', '/primeiro-acesso'],
}
