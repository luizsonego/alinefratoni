'use client'

import { Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom">
        <div className="py-12">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="https://ik.imagekit.io/500milhas/imagemaf?updatedAt=1760552972181"
                alt="Aline Fratoni Fotografia"
                className="h-12 w-auto"
              />
              
              {/* Código anterior comentado
              <h3 className="font-serif text-2xl font-semibold text-white">
                Aline Fratoni
              </h3>
              <p className="text-sm text-gray-400 font-sans">Fotografia</p>
              */}
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap justify-center md:justify-start space-x-6">
              <a 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Home
              </a>
              <a 
                href="/#sobre" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Sobre
              </a>
              <a 
                href="/portfolio" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Portfólio
              </a>
              <a 
                href="/#blog" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Blog
              </a>
              <a 
                href="/#contato" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Contato
              </a>
              <a 
                href="/#privacy" 
                className="text-gray-300 hover:text-white transition-colors duration-300"
              >
                Política de Privacidade
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end items-center space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2023 Aline Fratoni Fotografia. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
