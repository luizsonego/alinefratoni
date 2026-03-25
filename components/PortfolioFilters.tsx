'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const categories = [
  { id: 'all', name: 'Todos', count: 24 },
  { id: 'feminino', name: 'Ensaios Femininos', count: 8 },
  { id: 'acompanhamento', name: 'Acompanhamentos', count: 6 },
  { id: 'tematico', name: 'Datas Temáticas', count: 5 },
  { id: 'familia', name: 'Família', count: 5 }
]

interface PortfolioFiltersProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export default function PortfolioFilters({ activeFilter, onFilterChange }: PortfolioFiltersProps) {
  return (
    <section className="section-padding bg-white border-b border-gray-100">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-2xl lg:text-3xl font-semibold text-gray-900 mb-4">
            Filtre por Categoria
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Encontre exatamente o tipo de ensaio que você está procurando
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                activeFilter === category.id
                  ? 'bg-warm-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-warm-100 hover:text-warm-700'
              }`}
            >
              {category.name}
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                activeFilter === category.id
                  ? 'bg-white/20'
                  : 'bg-gray-200'
              }`}>
                {category.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
