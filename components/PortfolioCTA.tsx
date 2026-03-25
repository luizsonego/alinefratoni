'use client'

import { motion } from 'framer-motion'
import { Camera, ArrowRight } from 'lucide-react'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'

export default function PortfolioCTA() {
  return (
    <section className="section-padding bg-gradient-to-br from-warm-50 to-warm-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-warm-200/20 to-warm-300/20"></div>
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-warm-600 rounded-full mb-8">
            <Camera className="w-10 h-10 text-white" />
          </div>

          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-gray-900 mb-6">
            Pronta para Criar Suas Próprias Memórias?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Agende seu ensaio fotográfico e descubra como é se sentir confiante e 
            bela diante das câmeras. Vamos criar juntas uma experiência única e inesquecível.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href={getWhatsAppUrl(WHATSAPP_MESSAGES.AGENDAR)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-warm-600 hover:bg-warm-700 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>Agendar Ensaio</span>
              <ArrowRight size={20} />
            </motion.a>

            <motion.a
              href={getWhatsAppUrl(WHATSAPP_MESSAGES.FALAR)}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-warm-600 text-warm-600 hover:bg-warm-600 hover:text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Falar no WhatsApp</span>
              <ArrowRight size={20} />
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-gray-500"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warm-600 rounded-full"></div>
              <span>Atendimento Personalizado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warm-600 rounded-full"></div>
              <span>Ambiente Acolhedor</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warm-600 rounded-full"></div>
              <span>Direção Criativa</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-warm-200/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 bg-warm-300/20 rounded-full blur-xl"></div>
    </section>
  )
}
