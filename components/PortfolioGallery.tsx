'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Heart, Share2, Download } from 'lucide-react'
import PortfolioFilters from './PortfolioFilters'

interface PortfolioItem {
  id: number
  src: string
  alt: string
  category: string
  title: string
  description: string
  width: number
  height: number
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Ensaio Feminino - Ana',
    category: 'feminino',
    title: 'Ensaio Feminino - Ana',
    description: 'Um ensaio que capturou a essência e beleza natural da Ana.',
    width: 400,
    height: 600
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Acompanhamento - Família Silva',
    category: 'acompanhamento',
    title: 'Acompanhamento - Família Silva',
    description: 'Registros do crescimento e momentos especiais da família.',
    width: 400,
    height: 500
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Data Temática - Natal',
    category: 'tematico',
    title: 'Data Temática - Natal',
    description: 'Ensaio temático de Natal com toda a magia da época.',
    width: 400,
    height: 400
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Ensaio Feminino - Maria',
    category: 'feminino',
    title: 'Ensaio Feminino - Maria',
    description: 'Beleza e elegância em cada clique.',
    width: 400,
    height: 550
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Família - Santos',
    category: 'familia',
    title: 'Família - Santos',
    description: 'Momentos únicos de uma família unida.',
    width: 400,
    height: 450
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Data Temática - Aniversário',
    category: 'tematico',
    title: 'Data Temática - Aniversário',
    description: 'Celebração de mais um ano de vida.',
    width: 400,
    height: 500
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Ensaio Feminino - Carla',
    category: 'feminino',
    title: 'Ensaio Feminino - Carla',
    description: 'Empoderamento e beleza em cada pose.',
    width: 400,
    height: 600
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    alt: 'Acompanhamento - Bebê João',
    category: 'acompanhamento',
    title: 'Acompanhamento - Bebê João',
    description: 'Primeiros meses de vida registrados com carinho.',
    width: 400,
    height: 450
  }
]

export default function PortfolioGallery() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)

  const filteredItems = activeFilter === 'all' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === activeFilter)

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  return (
    <>
      <PortfolioFilters 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
      />
      
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-lg bg-white">
                    <div className="aspect-[4/5] relative">
                      <img
                        src={item.src}
                        alt={item.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Overlay content */}
                      <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white">
                          <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                          <p className="text-sm text-white/90">{item.description}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                          <Heart size={16} className="text-white" />
                        </button>
                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                          <Share2 size={16} className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-gray-500 text-lg">Nenhum item encontrado para esta categoria.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedItem.src}
                  alt={selectedItem.alt}
                  className="w-full h-auto max-h-[70vh] object-cover"
                />
                
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="font-serif text-2xl font-semibold text-gray-900 mb-2">
                  {selectedItem.title}
                </h3>
                <p className="text-gray-600 mb-4">{selectedItem.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-warm-100 text-warm-700 rounded-lg hover:bg-warm-200 transition-colors">
                      <Heart size={16} />
                      <span>Favoritar</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 size={16} />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                  
                  <button className="flex items-center space-x-2 px-6 py-2 bg-warm-600 text-white rounded-lg hover:bg-warm-700 transition-colors">
                    <Download size={16} />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
