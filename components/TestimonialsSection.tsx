'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'Jessica Doe',
    title: 'Manager',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'John Doe',
    title: 'Director',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'David Doe',
    title: 'CEO',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'Sarah Doe',
    title: 'Designer',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'Michael Doe',
    title: 'Developer',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    name: 'Emma Doe',
    title: 'Marketing',
    company: 'Company',
    quote: 'Praesent volutpat diam iaculis, fringilla orci vitae, hendrerit odio. Aenean venenatis, mauris et suscipit venenatis, augue lectus gravida dui, eget commodo mauris ex non risus. Vestibulum ultricies congue leo, quis pulvinar mi porttitor et.'
  }
]

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-wider">
            TESTIMONIALS
          </h2>
          <p className="text-lg text-gray-600">
            See what people say about our company.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg shadow-lg p-8 relative hover:shadow-xl transition-shadow duration-300"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 left-6 text-6xl font-bold text-orange-400 leading-none">
                "
              </div>

              {/* Profile Image */}
              <div className="flex justify-center mb-6 mt-4">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6 text-left">
                {testimonial.quote}
              </p>

              {/* Name and Title */}
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-lg mb-1">
                  {testimonial.name}
                </h4>
                <p className="text-gray-500 text-sm">
                  {testimonial.title}, <span className="text-orange-500 font-medium">{testimonial.company}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
