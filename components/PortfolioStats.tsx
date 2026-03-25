'use client'

import { motion } from 'framer-motion'
import { Camera, Users, Heart, Star } from 'lucide-react'

const stats = [
  {
    icon: Camera,
    value: '500+',
    label: 'Fotos Realizadas',
    color: 'text-warm-600'
  },
  {
    icon: Users,
    value: '200+',
    label: 'Clientes Satisfeitas',
    color: 'text-warm-600'
  },
  {
    icon: Heart,
    value: '100%',
    label: 'Satisfação',
    color: 'text-warm-600'
  },
  {
    icon: Star,
    value: '5.0',
    label: 'Avaliação Média',
    color: 'text-warm-600'
  }
]

export default function PortfolioStats() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
            Números que Falam
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Resultados que comprovam a qualidade e dedicação do nosso trabalho
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-100 rounded-full mb-4 group-hover:bg-warm-200 transition-colors duration-300">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
                className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2"
              >
                {stat.value}
              </motion.div>
              
              <p className="text-gray-600 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
