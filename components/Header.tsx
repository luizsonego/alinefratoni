'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'

const NAV = [
  { href: '/#trabalhos', label: 'Trabalhos' },
  { href: '/portfolio', label: 'Portfólio' },
  { href: '/#estudio', label: 'O Estúdio' },
  { href: '/#investimento', label: 'Investimento' },
  { href: '/#contato', label: 'Contato' },
] as const

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow] duration-300 ${
        scrolled
          ? 'border-b border-black/5 bg-[#F9F9F9]/85 shadow-sm backdrop-blur-[10px]'
          : 'border-b border-transparent bg-[#F9F9F9]/70 backdrop-blur-[10px]'
      }`}
    >
      <div className="container-custom flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-xl tracking-tight text-brand-ink sm:text-2xl">
          Aline Fratoni
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex"
          aria-label="Principal"
        >
          {NAV.map((item) => {
            const active =
              (pathname === '/' && item.href.startsWith('/#') && item.label === 'Trabalhos') ||
              (item.href === '/portfolio' && pathname === '/portfolio')
            const isRoute = item.href.startsWith('/') && !item.href.startsWith('/#')
            const className = `nav-link ${active ? 'nav-link-active' : ''}`
            return isRoute ? (
              <Link key={item.href} href={item.href} className={className}>
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} className={className}>
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={getWhatsAppUrl(WHATSAPP_MESSAGES.AGENDAR)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-dark hidden sm:inline-flex"
          >
            Agende sua Sessão
          </a>
          <button
            type="button"
            className="rounded-lg p-2 text-brand-ink lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-black/5 bg-[#F9F9F9]/95 px-4 py-6 backdrop-blur-md lg:hidden">
          <nav className="flex flex-col gap-4" aria-label="Mobile">
            {NAV.map((item) => {
              const isRoute = item.href.startsWith('/') && !item.href.startsWith('/#')
              const className = 'text-sm font-medium text-brand-ink'
              const close = () => setOpen(false)
              return isRoute ? (
                <Link key={item.href} href={item.href} className={className} onClick={close}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className={className} onClick={close}>
                  {item.label}
                </a>
              )
            })}
            <a
              href={getWhatsAppUrl(WHATSAPP_MESSAGES.AGENDAR)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-dark mt-2 w-full"
            >
              Agende sua Sessão
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
