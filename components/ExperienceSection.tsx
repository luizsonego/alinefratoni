'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Home, Lightbulb } from 'lucide-react'

const experiences = [
  {
    icon: MessageCircle,
    title: 'Atendimento Personalizado',
    description: 'Cada cliente é única. Por isso, ofereço um atendimento personalizado, onde conversamos sobre seus desejos, expectativas e como posso ajudar você a se sentir confiante durante o ensaio.'
  },
  {
    icon: Home,
    title: 'Ambiente Acolhedor',
    description: 'Meu estúdio foi pensado para ser um espaço acolhedor e confortável, onde você se sentirá à vontade para ser você mesma. Um ambiente que transmite tranquilidade e elegância.'
  },
  {
    icon: Lightbulb,
    title: 'Direção Criativa',
    description: 'Com anos de experiência, sei como guiar você para encontrar suas melhores poses e expressões. Minha direção criativa fará com que você se sinta natural e confiante diante das câmeras.'
  }
]

export default function ExperienceSection() {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl lg:text-4xl font-semibold text-gray-900 mb-4">
            Mais que a sessão de fotos, experiência.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {experiences.map((experience, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <motion.div 
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 h-full"
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-100 rounded-full mb-6 group-hover:bg-warm-200 group-hover:scale-110 transition-all duration-300">
                  <experience.icon className="w-8 h-8 text-warm-600 group-hover:text-warm-700 transition-colors duration-300" />
                </div>
                
                <h3 className="font-serif text-xl font-semibold text-gray-900 mb-4 group-hover:text-warm-700 transition-colors duration-300">
                  {experience.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {experience.description}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <a 
            href="#portfolio" 
            className="text-warm-600 hover:text-warm-700 font-medium text-lg transition-colors duration-300"
          >
            Explore todo o portfólio →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
