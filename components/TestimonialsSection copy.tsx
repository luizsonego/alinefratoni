'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    title: 'Um dia inesquecível. Me senti poderosa.',
    quote: '- Joice Leitte',
    description: `Gostamos muito do trabalho da Aline, atenciosa, profissional ,uma querida
O estúdio é grande e tem diversos ambientes .
A experiência foi boa`
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    title: 'Registros que guardo com carinho.',
    quote: '- Rebeca Silva',
    description: 'As fotos capturaram momentos únicos da nossa família. Recomendo de coração!'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    title: 'Profissionalismo e sensibilidade.',
    quote: '- Maria Santos',
    description: 'Aline tem um olhar único para capturar a essência de cada pessoa. Adorei o resultado!'
  }
]

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

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
            Histórias de quem viveu para o seu Ensaios.
          </h2>
          <p className="text-lg text-gray-600">
            Leia o blog para se inspirar.
          </p>
        </motion.div>

        <div className="relative">
          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <motion.div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="order-2 lg:order-1 group"
                    >
                      <div className="relative overflow-hidden rounded-lg shadow-lg">
                        <img 
                          src={testimonial.image}
                          alt={testimonial.quote}
                          className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6 }}
                      viewport={{ once: true }}
                      className="order-1 lg:order-2 space-y-6"
                    >
                      <h3 className="font-serif text-2xl lg:text-3xl font-semibold text-gray-900">
                        {testimonial.title}
                      </h3>
                      
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {testimonial.description}
                      </p>
                      
                      <p className="text-warm-600 font-medium text-lg">
                        {testimonial.quote}
                      </p>
                    </motion.div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            <button 
              onClick={prevTestimonial}
              className="flex items-center justify-center w-12 h-12 bg-warm-100 hover:bg-warm-200 rounded-full transition-colors duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-warm-600" />
            </button>

            {/* Dots indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    index === currentIndex ? 'bg-warm-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={nextTestimonial}
              className="flex items-center justify-center w-12 h-12 bg-warm-100 hover:bg-warm-200 rounded-full transition-colors duration-300"
            >
              <ChevronRight className="w-6 h-6 text-warm-600" />
            </button>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          {/* <button className="btn-primary">
            Leia o Blog
          </button> */}
        </motion.div>
      </div>
    </section>
  )
}
