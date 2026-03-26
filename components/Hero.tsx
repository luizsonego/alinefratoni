'use client'

import { useId } from 'react'
import { motion } from 'framer-motion'
import type { HeroPublicContent } from '@/lib/site-content'

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.045, delayChildren: 0.08 },
  },
}

const letterVariants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

/** Fundo dinâmico e discreto: luminária difusa + véu cônico lento + grão editorial (não compete com o conteúdo). */
function HeroAmbientBackground() {
  const grainId = useId().replace(/:/g, '')

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
      aria-hidden
    >
      {/* Blobs orgânicos — opacidade baixa, blur alto */}
      <motion.div
        className="absolute -left-[18%] top-[8%] h-[min(62vh,520px)] w-[min(62vh,520px)] rounded-full bg-brand-accent/[0.09] blur-[clamp(72px,12vw,140px)]"
        animate={{
          x: [0, 36, -12, 0],
          y: [0, 28, 8, 0],
          scale: [1, 1.06, 0.98, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-[12%] top-[38%] h-[min(48vh,420px)] w-[min(48vh,420px)] rounded-full bg-brand-ink/[0.045] blur-[clamp(64px,10vw,120px)]"
        animate={{
          x: [0, -28, 14, 0],
          y: [0, 20, -16, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute bottom-[-8%] left-[28%] h-[min(38vh,340px)] w-[min(38vh,340px)] rounded-full bg-[#c9b896]/[0.11] blur-[clamp(56px,8vw,100px)]"
        animate={{
          x: [0, 22, -18, 0],
          y: [0, -14, 10, 0],
        }}
        transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />

      {/* Véu cônico girando muito devagar — sensação de “luz varrendo o estúdio” */}
      <motion.div
        className="absolute left-1/2 top-[42%] h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
        style={{
          background:
            'conic-gradient(from 200deg at 50% 50%, transparent 0deg, rgba(196,167,125,0.55) 45deg, transparent 95deg, rgba(26,26,26,0.12) 160deg, transparent 220deg, rgba(196,167,125,0.35) 290deg, transparent 360deg)',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 140, repeat: Infinity, ease: 'linear' }}
      />

      {/* Trama diagonal quase invisível — textura de papel premium */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(105deg, transparent 0px, transparent 48px, rgba(26,26,26,0.12) 48px, rgba(26,26,26,0.12) 49px)',
        }}
      />

      {/* Grão analógico (SVG) — respira levemente */}
      <svg
        className="absolute inset-0 h-full w-full mix-blend-multiply opacity-[0.055]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <filter id={`grain-${grainId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#grain-${grainId})`} />
      </svg>
      <motion.div
        className="pointer-events-none absolute inset-0 bg-brand-bg/0"
        animate={{ opacity: [1, 0.97, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 0%, rgba(249,249,249,0.4) 100%)',
        }}
      />

      {/* Vinheta suave nas bordas para “fechar” o quadro sem escurecer o centro */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: 'inset 0 0 80px rgba(249,249,249,0.85)',
        }}
      />
    </div>
  )
}

function ScrollChevron({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-1 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <motion.span
        className="block h-8 w-px bg-brand-ink/30"
        animate={{ scaleY: [1, 0.6, 1], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <span className="block h-2 w-2 rotate-45 border-b border-r border-brand-ink/40" aria-hidden />
    </motion.div>
  )
}

export default function Hero({ title, subtitle, posterUrl, videoUrl }: HeroPublicContent) {
  const words = title.split(' ')

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-brand-bg pt-24 sm:pt-28"
    >
      <HeroAmbientBackground />

      <div className="container-custom relative z-10 grid min-h-[calc(100vh-5rem)] items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24">
        <div className="flex min-w-0 flex-col justify-center text-left">
          <motion.h1
            className="max-w-full font-serif text-4xl leading-[1.12] text-brand-ink sm:text-5xl lg:text-6xl xl:text-7xl"
            variants={container}
            initial="hidden"
            animate="visible"
          >
            {words.map((word, wi) => (
              <span
                key={`${word}-${wi}`}
                className="mb-[0.08em] mr-[0.28em] inline-block whitespace-nowrap last:mr-0 sm:mb-0"
              >
                {Array.from(word).map((char, ci) => (
                  <motion.span
                    key={`${wi}-${ci}`}
                    className="inline-block"
                    variants={letterVariants}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-5 max-w-md font-sans text-sm font-light tracking-wide text-brand-ink/75 sm:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.55 }}
          >
            {subtitle}
          </motion.p>

          <div className="mt-10 hidden lg:block">
            <ScrollChevron />
          </div>
        </div>

        <motion.div
          className="relative z-10 mx-auto w-full max-w-md lg:max-w-none lg:justify-self-end"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative aspect-[3/4] max-h-[640px] overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.22)] will-change-transform sm:rounded-[1.25rem]"
          >
            <div className="absolute inset-0 bg-black/25" aria-hidden />
            <video
              className="h-full w-full scale-105 object-cover blur-[2px] sm:blur-[1.5px]"
              autoPlay
              muted
              loop
              playsInline
              poster={posterUrl}
            >
              <source src={videoUrl} />
            </video>
          </div>
          <div className="mt-8 flex justify-center lg:hidden">
            <ScrollChevron />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
