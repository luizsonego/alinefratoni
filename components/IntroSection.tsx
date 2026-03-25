'use client'

import { motion } from 'framer-motion'
import { Award, Star, Heart } from 'lucide-react'

const categories = [
  {
    id: 1,
    title: 'Ensaios Femininos',
    image: 'https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=765'
  },
  {
    id: 2,
    title: 'Acompanhamento',
    image: 'https://plus.unsplash.com/premium_photo-1661277731403-f5f8f237ae2e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170'
  },
  {
    id: 3,
    title: 'Datas Temáticas',
    image: 'https://images.unsplash.com/photo-1606916693216-69bd7e1cf2fa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169'
  },
  {
    id: 4,
    title: 'Família',
    image: 'https://plus.unsplash.com/premium_photo-1661281211518-7bc99840fe64?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170s'
  }
]

export default function IntroSection() {
  return (
    <section id="sobre" className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Profile and Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-gray-900 mb-6">
              Intuição e Confiança
            </h2>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src="https://ik.imagekit.io/500milhas/alinefoto_wKOHM6fRlR.jpg"
                  alt="Aline Fratoni"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis 
                  nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Categories Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ 
                    y: -8,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 text-center group-hover:text-warm-600 transition-colors duration-300">
                      {category.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex justify-center space-x-6 pt-4">
              <div className="flex items-center space-x-2 text-warm-600">
                <Award size={20} />
                <span className="text-sm font-medium">Prêmios</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-600">
                <Star size={20} />
                <span className="text-sm font-medium">5 Estrelas</span>
              </div>
              <div className="flex items-center space-x-2 text-warm-600">
                <Heart size={20} />
                <span className="text-sm font-medium">+500 Clientes</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
