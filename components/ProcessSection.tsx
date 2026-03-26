'use client'

import { motion } from 'framer-motion'
import { ClipboardList, Video, Package } from 'lucide-react'

const STEPS = [
  {
    n: '1',
    title: 'Briefing',
    Icon: ClipboardList,
    text: 'Conversamos sobre expectativas, referências visuais, figurino e o ritmo ideal para o seu dia. O roteiro nasce da sua história.',
  },
  {
    n: '2',
    title: 'A Sessão',
    Icon: Video,
    text: 'No estúdio, o tempo desacelera. Luz, música e direção leve para você relaxar enquanto captamos gestos espontâneos e retratos icônicos.',
  },
  {
    n: '3',
    title: 'Entrega',
    Icon: Package,
    text: 'Seleção curada, tratamento fiel à pele e entrega em galeria privativa. Você recebe arquivos prontos para decorar e guardar para sempre.',
  },
]

export default function ProcessSection() {
  return (
    <motion.section
      id="investimento"
      className="section-padding bg-[#f3f2ef]"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl text-brand-ink sm:text-4xl">Investimento & processo</h2>
          <p className="mt-3 font-sans text-sm font-light text-brand-ink/70 sm:text-base">
            Transparência em cada etapa — do primeiro contato à entrega final.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group rounded-2xl border border-black/[0.06] bg-white/80 p-8 shadow-[0_8px_30px_-18px_rgba(0,0,0,0.18)] transition-shadow duration-300 hover:shadow-[0_14px_40px_-20px_rgba(0,0,0,0.22)]"
            >
              <step.Icon
                className="h-7 w-7 text-brand-ink/70 transition-colors group-hover:text-brand-accent"
                strokeWidth={1.25}
              />
              <h3 className="mt-5 font-serif text-xl text-brand-ink">
                {step.n}. {step.title}
              </h3>
              <p className="mt-3 font-sans text-sm font-light leading-relaxed text-brand-ink/72">{step.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
