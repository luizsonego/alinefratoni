'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'
import alinefoto from 'https://ik.imagekit.io/500milhas/alinefoto_wKOHM6fRlR.jpg'

const shootTypes = [
  'Ensaio Feminino',
  'Acompanhamento',
  'Data Temática',
  'Família',
  'Outro'
]

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shootType: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  return (
    <section 
      id="contato"
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{
          // backgroundImage: `url(${alinefoto})`
          backgroundImage: `url("https://ik.imagekit.io/500milhas/alinefoto_wKOHM6fRlR.jpg")`,
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-warm-900/20 via-transparent to-warm-800/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
            {/* Left Side - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="font-serif text-4xl lg:text-5xl font-semibold mb-6 leading-tight">
                Vamos criar memórias inesquecíveis juntas?
              </h2>
            </motion.div>

            {/* Right Side - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent transition-colors duration-300"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent transition-colors duration-300"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="shootType" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Ensaio Desejado *
                  </label>
                  <select
                    id="shootType"
                    name="shootType"
                    value={formData.shootType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warm-500 focus:border-transparent transition-colors duration-300"
                  >
                    <option value="">Selecione uma opção</option>
                    {shootTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <motion.a
                  href={getWhatsAppUrl(WHATSAPP_MESSAGES.ORCAMENTO)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-warm-600 hover:bg-warm-700 text-white text-lg py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden group inline-block text-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Quero um orçamento</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </motion.a>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Entraremos em contato em até 24 horas
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
