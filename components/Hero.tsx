'use client'

import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'

export default function Hero() {
  return (
    <section 
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1759800805660-8bc4595568ec?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170')"
        }}
      >
        {/* Enhanced overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70"></div>
        
        {/* Floating elements for modern effect */}
        <FloatingElements />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Text with enhanced contrast */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-white/10">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight text-white drop-shadow-2xl">
              Fotografia que revela a sua essência.
            </h1>
            
            <motion.p 
              className="text-lg sm:text-xl lg:text-2xl mb-8 text-white/90 drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ensaios em estúdio que contam a sua história.
            </motion.p>

            <motion.a 
              href="/portfolio"
              className="bg-warm-600 hover:bg-warm-700 text-white text-lg px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-2xl hover:shadow-warm-600/25 hover:scale-105 inline-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Conheça meu trabalho
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Enhanced scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center backdrop-blur-sm bg-white/10">
          <motion.div 
            className="w-1 h-3 bg-white rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.p 
          className="text-white/80 text-xs mt-2 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
        >
          Role para baixo
        </motion.p>
      </motion.div>
    </section>
  )
}
