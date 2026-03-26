'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { AboutPublicContent } from '@/lib/site-content'

export default function StudioSection({ title, paragraphs, imageUrl }: AboutPublicContent) {
  return (
    <motion.section
      id="estudio"
      className="section-padding bg-brand-bg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-custom grid items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            className="relative aspect-[3/4] max-h-[640px] overflow-hidden shadow-[0_28px_70px_-28px_rgba(0,0,0,0.28)] will-change-transform"
            style={{
              borderRadius: '50% 50% 1.25rem 1.25rem / 42% 42% 1.25rem 1.25rem',
            }}
          >
            <Image
              src={imageUrl}
              alt="Retrato no estúdio"
              fill
              className="object-cover grayscale"
              sizes="(max-width: 980px) 90vw, 45vw"
              priority={false}
            />
          </div>
        </div>

        <div className="max-w-xl lg:max-w-none">
          <h2 className="font-serif text-3xl text-brand-ink sm:text-4xl lg:text-5xl">{title}</h2>
          <div className="mt-6 font-sans text-sm font-light leading-relaxed text-brand-ink/80 sm:text-base">
            {paragraphs.map((p, i) => (
              <p key={i} className={i > 0 ? 'mt-4' : ''}>
                {p}
              </p>
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <motion.svg
              viewBox="0 0 400 100"
              className="h-14 w-52 text-brand-ink sm:h-16 sm:w-60"
              aria-hidden
            >
              <motion.path
                d="M12 58c18-32 52-38 78-22 14 8 22 28 40 32 28 6 52-40 80-44 20-2 36 12 44 30 10 26-6 52-34 54-18 2-34-8-40-26M118 72c8-26 34-46 62-42 38 6 36 56-4 60-24 2-46-18-52-42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </motion.svg>
            <span className="sr-only">Assinatura Aline Fratoni</span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
