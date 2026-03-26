'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { Instagram, Facebook, Youtube } from 'lucide-react'
import { getWhatsAppUrl } from '../utils/whatsapp'
import type { ContactPublicContent, FooterPublicContent, SocialPublicContent } from '@/lib/site-content'

const GOOGLE_MAPS =
  'https://www.google.com/maps/search/?api=1&query=Maringá,+Paraná,+Brasil'

type FooterProps = {
  social: SocialPublicContent
  footer: FooterPublicContent
  contact: ContactPublicContent
}

export default function Footer({ social, footer, contact }: FooterProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [shootType, setShootType] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const body = [
      `Olá! Vim pelo site — ${name || 'visitante'}.`,
      email ? `E-mail: ${email}` : '',
      shootType ? `Tipo de ensaio: ${shootType}` : '',
      message ? `Mensagem: ${message}` : '',
    ]
      .filter(Boolean)
      .join('\n')
    const url = getWhatsAppUrl(body)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const ig = social.instagram.trim()
  const fb = social.facebook.trim()
  const yt = social.youtube.trim()

  return (
    <footer id="contato" className="bg-brand-ink text-[#e8e8e6]">
      <div className="container-custom grid gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-20">
        <div className="lg:col-span-3">
          <p className="font-serif text-2xl text-[#f9f9f9]">Aline Fratoni</p>
          <p className="mt-3 whitespace-pre-line font-sans text-sm font-light text-[#e8e8e6]/75">
            {footer.tagline}
          </p>
          <nav className="mt-8 flex flex-col gap-3 font-sans text-sm" aria-label="Rodapé">
            <a href="/#trabalhos" className="transition-colors hover:text-brand-accent">
              Trabalhos
            </a>
            <Link href="/portfolio" className="transition-colors hover:text-brand-accent">
              Portfólio
            </Link>
            <a href="/#estudio" className="transition-colors hover:text-brand-accent">
              O Estúdio
            </a>
            <a href="/#investimento" className="transition-colors hover:text-brand-accent">
              Investimento
            </a>
            <a href="/#contato" className="transition-colors hover:text-brand-accent">
              Contato
            </a>
          </nav>
          <div className="mt-6 flex gap-4">
            {ig && (
              <a
                href={ig}
                className="text-[#e8e8e6]/70 transition-colors hover:text-brand-accent"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram size={22} strokeWidth={1.25} />
              </a>
            )}
            {fb && (
              <a
                href={fb}
                className="text-[#e8e8e6]/70 transition-colors hover:text-brand-accent"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={22} strokeWidth={1.25} />
              </a>
            )}
            {yt && (
              <a
                href={yt}
                className="text-[#e8e8e6]/70 transition-colors hover:text-brand-accent"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube size={22} strokeWidth={1.25} />
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-serif text-lg text-[#f9f9f9]/95">Estúdio</h3>
          <address className="mt-4 whitespace-pre-line font-sans text-sm font-light not-italic leading-relaxed text-[#e8e8e6]/78">
            {footer.addressLine}
          </address>
          <a
            href={GOOGLE_MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block font-sans text-sm text-brand-accent underline-offset-4 transition-colors hover:text-[#f9f9f9] hover:underline"
          >
            Abrir no Google Maps
          </a>
        </div>

        <div className="lg:col-span-6">
          <h3 className="font-serif text-2xl text-[#f9f9f9] sm:text-3xl">{contact.heading}</h3>
          <form onSubmit={submit} className="mt-8 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block font-sans text-xs uppercase tracking-wider text-[#e8e8e6]/55">
                Nome
                <input
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border-0 border-b border-[#e8e8e6]/30 bg-transparent py-2 font-sans text-sm text-[#f9f9f9] outline-none transition-colors placeholder:text-[#e8e8e6]/35 focus:border-brand-accent"
                  placeholder="Seu nome"
                  autoComplete="name"
                />
              </label>
              <label className="block font-sans text-xs uppercase tracking-wider text-[#e8e8e6]/55">
                E-mail
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border-0 border-b border-[#e8e8e6]/30 bg-transparent py-2 font-sans text-sm text-[#f9f9f9] outline-none transition-colors placeholder:text-[#e8e8e6]/35 focus:border-brand-accent"
                  placeholder="voce@email.com"
                  autoComplete="email"
                />
              </label>
            </div>
            {contact.shootTypes.length > 0 && (
              <label className="block font-sans text-xs uppercase tracking-wider text-[#e8e8e6]/55">
                Tipo de ensaio
                <select
                  value={shootType}
                  onChange={(e) => setShootType(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-[#e8e8e6]/25 bg-zinc-800 px-4 py-3 font-sans text-sm text-[#f9f9f9] outline-none focus:border-brand-accent"
                >
                  <option value="">Selecione</option>
                  {contact.shootTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block font-sans text-xs uppercase tracking-wider text-[#e8e8e6]/55">
              Mensagem
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="mt-2 w-full resize-none rounded-xl border border-[#e8e8e6]/20 bg-white/5 px-4 py-3 font-sans text-sm text-[#f9f9f9] outline-none transition-colors placeholder:text-[#e8e8e6]/35 focus:border-brand-accent"
                placeholder="Conte um pouco sobre o ensaio que imagina..."
              />
            </label>
            <button type="submit" className="btn-outline-light w-full sm:w-auto">
              Vamos criar algo eterno?
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom px-4 py-6 text-center font-sans text-xs text-[#e8e8e6]/55 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Aline Fratoni Fotografia. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
