'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { TestimonialsSectionContent } from '@/lib/site-content'

function CardsStrip({ items }: { items: TestimonialsSectionContent['items'] }) {
  return (
    <div className="flex w-max shrink-0 gap-6 pr-6">
      {items.map((t) => (
        <article
          key={t.id}
          className="flex w-[min(100vw-2rem,380px)] shrink-0 gap-5 rounded-2xl border border-black/[0.06] bg-white/90 p-5 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.2)] sm:w-[420px]"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-brand-ink/5">
            {t.imageUrl ? (
              <Image src={t.imageUrl} alt="" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-serif text-2xl text-brand-ink/25">
                “
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-serif text-4xl leading-none text-brand-accent/90">“</span>
            <p className="mt-1 font-sans text-sm font-light leading-relaxed text-brand-ink/80">{t.quote}</p>
            <p className="mt-3 font-sans text-xs font-medium uppercase tracking-wider text-brand-ink/55">
              {t.name}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function TestimonialsSection({ title, subtitle, items }: TestimonialsSectionContent) {
  if (items.length === 0) return null

  return (
    <motion.section
      className="section-padding overflow-hidden bg-brand-bg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-custom mb-10 px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl text-brand-ink sm:text-4xl">{title}</h2>
        <p className="mt-2 font-sans text-sm font-light text-brand-ink/65">{subtitle}</p>
      </div>

      <div className="relative">
        <div className="marquee-track">
          <CardsStrip items={items} />
          <CardsStrip items={items} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-brand-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-brand-bg to-transparent" />
      </div>

      <div className="mx-auto mt-8 flex justify-center gap-2">
        <span className="h-px w-8 bg-brand-ink/25" />
        <span className="h-px w-8 bg-brand-ink/10" />
      </div>
    </motion.section>
  )
}
