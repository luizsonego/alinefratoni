'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { getWhatsAppUrl, WHATSAPP_MESSAGES } from '../utils/whatsapp'
import type { ContactPublicContent } from '@/lib/site-content'

export default function ContactSection({ heading, bgImageUrl, shootTypes }: ContactPublicContent) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    shootType: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <section id="contato" className="relative flex min-h-screen items-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{
          backgroundImage: `url("${bgImageUrl.replace(/"/g, '%22')}")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-warm-900/20 via-transparent to-warm-800/20" />
      </div>

      <div className="relative z-10 w-full">
        <div className="container-custom">
          <div className="grid min-h-screen items-center gap-12 py-20 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-white"
            >
              <h2 className="mb-6 font-serif text-4xl font-semibold leading-tight lg:text-5xl">{heading}</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-sm"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Nome *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-warm-500"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-warm-500"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="shootType" className="mb-2 block text-sm font-medium text-gray-700">
                    Tipo de Ensaio Desejado *
                  </label>
                  <select
                    id="shootType"
                    name="shootType"
                    value={formData.shootType}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-colors duration-300 focus:border-transparent focus:ring-2 focus:ring-warm-500"
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
                  className="relative inline-block w-full overflow-hidden rounded-lg bg-warm-600 py-4 text-center text-lg font-medium text-white shadow-lg transition-all duration-300 hover:bg-warm-700 hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Quero um orçamento</span>
                </motion.a>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">Entraremos em contato em até 24 horas</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
