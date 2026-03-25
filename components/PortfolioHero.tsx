'use client'

import { motion } from 'framer-motion'

export default function PortfolioHero() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1759800805660-8bc4595568ec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170')"
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray/50 to-black-100/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-gray-50 mb-6">
            Nosso Portfólio
          </h1>
          
          <motion.p 
            className="text-lg sm:text-xl text-gray-50 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Cada ensaio conta uma história única. Explore nossa galeria e se inspire 
            para criar suas próprias memórias inesquecíveis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 text-sm text-gray-500"
          >
            <span className="bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">
              Ensaios Femininos
            </span>
            <span className="bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">
              Acompanhamentos
            </span>
            <span className="bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">
              Datas Temáticas
            </span>
            <span className="bg-white/80 px-4 py-2 rounded-full backdrop-blur-sm">
              Família
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-warm-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-warm-300/20 rounded-full blur-2xl"></div>
    </section>
  )
}
