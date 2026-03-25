'use client'

import { useState, useEffect } from 'react'
import { Instagram, Facebook, Menu, X } from 'lucide-react'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
    <>
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-sm shadow-lg' 
        : 'bg-white/10 backdrop-blur-md border-b border-white/20'
    }`}>
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="https://ik.imagekit.io/500milhas/imagemaf?updatedAt=1760552972181"
              alt="Aline Fratoni Fotografia"
              className="h-12 w-auto"
            />
          </div>

          {/* Navigation Menu Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            <a 
              href="/" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Home
            </a>
            <a 
              href="/#sobre" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Sobre
            </a>
            <a 
              href="/portfolio" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Portfólio
            </a>
            <a 
              href="/#acompanhamentos" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Acompanhamentos
            </a>
            <a 
              href="/#blog" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
              }`}
            >
              Blog
            </a>
            <a 
              href="/#contato" 
              className={`font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-700 hover:text-warm-600' : 'text-white/80 hover:text-white'
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
                href="https://www.instagram.com/alinefratonifotografia/" 
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
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
              >
                Home
              </a>
              <a 
                href="/#sobre" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
              >
                Sobre
              </a>
              <a 
                href="/portfolio" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
              >
                Portfólio
              </a>
              <a 
                href="/#acompanhamentos" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
              >
                Acompanhamentos
              </a>
              <a 
                href="/#blog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
              >
                Blog
              </a>
              <a 
                href="/#contato" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-gray-700 hover:text-warm-600 transition-colors duration-300"
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

    </>

  )
}
