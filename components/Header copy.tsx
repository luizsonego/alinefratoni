'use client'

import { useState, useEffect } from 'react'
import { Instagram, Facebook, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
console.log(pathname)
  // Função para verificar se um link está ativo
  const isActiveLink = (href: string) => {
    if (href === '/' && pathname === '/') return true
    if (href === '/portfolio' && pathname === '/portfolio') return true
    if (href.startsWith('/#') && pathname === '/') return true
    return false
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
      // Fechar menu mobile ao rolar
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobileMenuOpen])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 backdrop-blur-sm shadow-lg' 
          : 'bg-white/10 backdrop-blur-md border-b border-white/20'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className={`font-serif text-2xl font-semibold transition-colors duration-300 ${
              isScrolled ? 'text-gray-900' : 'text-white'
            }`}>
              Aline Fratoni
            </h1>
            <p className={`text-sm font-sans transition-colors duration-300 ${
              isScrolled ? 'text-gray-600' : 'text-white/80'
            }`}>
              Fotografia
            </p>
          </div>

          {/* Navigation Menu Desktop */}
          <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
            <a 
              href="/" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Home
            </a>
            <a 
              href="/#sobre" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/#sobre')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Sobre
            </a>
            <a 
              href="/portfolio" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/portfolio')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Portfólio
            </a>
            <a 
              href="/#acompanhamentos" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/#acompanhamentos')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Acompanhamentos
            </a>
            <a 
              href="/#blog" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/#blog')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Blog
            </a>
            <a 
              href="/#contato" 
              className={`font-medium border-b-2 pb-1 transition-colors duration-300 ${
                isActiveLink('/#contato')
                  ? (isScrolled ? 'text-warm-600 border-warm-600' : 'text-white border-white')
                  : (isScrolled ? 'text-gray-700 hover:text-warm-600 border-transparent' : 'text-white/80 hover:text-white border-transparent')
              }`}
            >
              Contato
            </a>
          </nav>

          {/* CTA Button and Social Icons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <a 
              href={getWhatsAppUrl(WHATSAPP_MESSAGES.ORCAMENTO)}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                isScrolled 
                  ? 'bg-warm-600 hover:bg-warm-700 text-white' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30'
              }`}
            >
              Solicitar Orçamento
            </a>
            
            <div className="flex items-center space-x-2">
              <a 
                href="#" 
                className={`transition-colors duration-300 ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-warm-600' 
                    : 'text-white/80 hover:text-white'
                }`}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className={`transition-colors duration-300 ${
                  isScrolled 
                    ? 'text-gray-600 hover:text-warm-600' 
                    : 'text-white/80 hover:text-white'
                }`}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled 
                ? 'text-gray-700 hover:bg-gray-100' 
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              <a 
                href="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Home
              </a>
              <a 
                href="/#sobre" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/#sobre')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Sobre
              </a>
              <a 
                href="/portfolio" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/portfolio')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Portfólio
              </a>
              <a 
                href="/#acompanhamentos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/#acompanhamentos')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Acompanhamentos
              </a>
              <a 
                href="/#blog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/#blog')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Blog
              </a>
              <a 
                href="/#contato" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`font-medium border-b-2 pb-2 transition-colors duration-300 ${
                  isActiveLink('/#contato')
                    ? 'text-warm-600 border-warm-600' 
                    : 'text-gray-700 hover:text-warm-600 border-transparent'
                }`}
              >
                Contato
              </a>
              
              {/* Mobile CTA */}
              <div className="pt-4 border-t border-gray-200">
                <a 
                  href={getWhatsAppUrl(WHATSAPP_MESSAGES.ORCAMENTO)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full bg-warm-600 hover:bg-warm-700 text-white text-center py-3 rounded-lg font-medium transition-colors duration-300 mb-4"
                >
                  Solicitar Orçamento
                </a>
                
                <div className="flex items-center justify-center space-x-4">
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-warm-600 transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <Instagram size={24} />
                  </a>
                  <a 
                    href="#" 
                    className="text-gray-600 hover:text-warm-600 transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <Facebook size={24} />
                  </a>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
