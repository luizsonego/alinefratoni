'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PortfolioImage } from '@/components/PortfolioImage'
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PortfolioSectionContent, PortfolioTileContent } from '@/lib/site-content'

type PortfolioItem = PortfolioTileContent

type HomePortfolioProps = {
  portfolioSection: PortfolioSectionContent
  items: PortfolioTileContent[]
}

const ASPECTS = ['3/4', '4/5', '5/6', '4/3', '1/1', '5/4', '2/3', '16/10', '3/5', '5/7', '9/16'] as const

function strHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function layoutForItem(item: PortfolioItem, index: number) {
  const h = strHash(`${item.id}|${item.src}|${index}`)
  const h2 = strHash(`${item.src}|${item.id}`)
  const aspect = ASPECTS[h % ASPECTS.length]
  const staggerPx = (h >>> 5) % 56
  /** Amplitudes maiores: scrollYProgress é sempre 0→1 */
  const parallaxOuter = 32 + ((h2 >>> 3) % 44)
  const parallaxInner = 22 + ((h2 >>> 9) % 36)
  const innerDirection = h2 % 2 === 0 ? 1 : -1

  return { aspect, staggerPx, parallaxOuter, parallaxInner, innerDirection }
}

function MasonryImageTile({
  scrollYProgress,
  item,
  index,
  onOpen,
}: {
  scrollYProgress: MotionValue<number>
  item: PortfolioItem
  index: number
  onOpen: () => void
}) {
  const { aspect, staggerPx, parallaxOuter, parallaxInner, innerDirection } = layoutForItem(item, index)

  const yCard = useTransform(scrollYProgress, [0, 1], [parallaxOuter, -parallaxOuter])
  const yImg = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxInner * innerDirection, -parallaxInner * innerDirection]
  )

  return (
    <div className="masonry-item" style={{ marginTop: staggerPx }}>
      <motion.div style={{ y: yCard }} className="will-change-transform">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.45, delay: (index % 5) * 0.04 }}
        >
          <div className="overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={onOpen}
              className="group relative block w-full text-left outline-none ring-brand-accent/40 focus-visible:ring-2"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
                <motion.div className="absolute inset-[-16%] will-change-transform" style={{ y: yImg }}>
                  <PortfolioImage
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.03]"
                    loading={index < 3 ? 'eager' : 'lazy'}
                  />
                </motion.div>
                {item.caption && (
                  <div className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 py-8">
                    <p className="font-serif text-lg text-white drop-shadow md:text-xl">{item.caption}</p>
                  </div>
                )}
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function HomePortfolio({ portfolioSection, items }: HomePortfolioProps) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [cursor, setCursor] = useState({ x: 0, y: 0, active: false })
  const areaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start 1.92', 'end 0.08'],
  })

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!areaRef.current) return
    const r = areaRef.current.getBoundingClientRect()
    setCursor((c) => ({ ...c, x: e.clientX - r.left, y: e.clientY - r.top }))
  }, [])

  const goPrev = useCallback(() => {
    setLightbox((i) => {
      if (i === null || items.length === 0) return i
      return (i - 1 + items.length) % items.length
    })
  }, [items.length])

  const goNext = useCallback(() => {
    setLightbox((i) => {
      if (i === null || items.length === 0) return i
      return (i + 1) % items.length
    })
  }, [items.length])

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, goPrev, goNext])

  if (items.length === 0) {
    return (
      <motion.section
        id="trabalhos"
        className="section-padding bg-brand-bg"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <p className="font-serif text-2xl text-brand-ink sm:text-3xl">{portfolioSection.title}</p>
          <p className="mt-2 max-w-2xl font-sans text-sm text-brand-ink/65">{portfolioSection.subtitle}</p>
          <p className="mt-10 font-sans text-sm text-brand-ink/45">
            Nenhuma imagem marcada para a página inicial. Edite em Admin → Site público → Portfólio e marque
            &quot;Mostrar na home&quot;.
          </p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      id="trabalhos"
      className="section-padding bg-brand-bg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <p className="font-serif text-2xl text-brand-ink sm:text-3xl">{portfolioSection.title}</p>
        <p className="mt-2 max-w-2xl font-sans text-sm text-brand-ink/65">{portfolioSection.subtitle}</p>
      </div>

      <div
        ref={areaRef}
        className="relative mt-12 cursor-none px-2 sm:px-4 lg:px-8"
        onMouseEnter={() => setCursor((c) => ({ ...c, active: true }))}
        onMouseLeave={() => setCursor((c) => ({ ...c, active: false }))}
        onMouseMove={onMove}
      >
        <motion.div
          className="pointer-events-none absolute z-20 hidden h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/55 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-sm md:flex"
          style={{ left: cursor.x, top: cursor.y }}
          animate={{ scale: cursor.active ? 1 : 0.65, opacity: cursor.active ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        >
          View
        </motion.div>

        <div ref={gridRef} className="container-custom masonry-grid">
          {items.map((item, index) => (
            <MasonryImageTile
              key={`${item.id}-${index}`}
              scrollYProgress={scrollYProgress}
              item={item}
              index={index}
              onOpen={() => setLightbox(index)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Galeria"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-zoom-out"
              onClick={() => setLightbox(null)}
              aria-label="Fechar galeria"
            />
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:left-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 md:right-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  aria-label="Próxima"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <motion.div
              key={items[lightbox].id}
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative z-[105] flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-xl bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={items[lightbox].src}
                alt={items[lightbox].alt}
                className="max-h-[min(72vh,820px)] w-auto max-w-full object-contain"
              />
              <div className="border-t border-white/10 px-4 py-3 text-left">
                {items[lightbox].caption && (
                  <p className="font-serif text-lg text-white">{items[lightbox].caption}</p>
                )}
                {items[lightbox].description && (
                  <p className="mt-1 font-sans text-sm text-white/75">{items[lightbox].description}</p>
                )}
                <p className="mt-2 font-sans text-xs text-white/40">
                  {lightbox + 1} / {items.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
