'use client'

import { motion } from 'framer-motion'
import type { PortfolioPageHeroContent } from '@/lib/site-content'

export default function PortfolioHero({
  title,
  subtitle,
  backgroundImageUrl,
  chips,
}: PortfolioPageHeroContent) {
  return (
    <section className="relative flex min-h-[56vh] items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImageUrl.replace(/'/g, '%27')}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/45" />
      </div>

      <div className="relative z-10 px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="mx-auto max-w-4xl"
        >
          <h1 className="mb-5 font-serif text-4xl font-semibold leading-tight text-[#f9f9f9] sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <motion.p
            className="mx-auto max-w-2xl text-base text-[#f9f9f9]/88 sm:text-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12 }}
          >
            {subtitle}
          </motion.p>
          {chips.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22 }}
            >
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-white/18 px-4 py-2 text-xs font-medium text-white backdrop-blur-sm sm:text-sm"
                >
                  {chip}
                </span>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
