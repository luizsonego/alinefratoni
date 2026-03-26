'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PortfolioImage } from '@/components/PortfolioImage'
import { motion, AnimatePresence, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { PortfolioCategoryPublic, PortfolioPageItem } from '@/lib/site-content'

const ASPECTS = ['3/4', '4/5', '5/6', '4/3', '1/1', '5/4', '2/3', '16/10', '3/5', '5/7', '9/16'] as const

function strHash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function layoutForItem(item: PortfolioPageItem, index: number) {
  const h = strHash(`${item.id}|${item.src}|${index}`)
  const h2 = strHash(`${item.src}|${item.id}`)
  const aspect = ASPECTS[h % ASPECTS.length]
  const staggerPx = (h >>> 5) % 56
  const parallaxOuter = 32 + ((h2 >>> 3) % 44)
  const parallaxInner = 22 + ((h2 >>> 9) % 36)
  const innerDirection = h2 % 2 === 0 ? 1 : -1
  return { aspect, staggerPx, parallaxOuter, parallaxInner, innerDirection }
}

function MasonryTile({
  scrollYProgress,
  item,
  index,
  onOpen,
}: {
  scrollYProgress: MotionValue<number>
  item: PortfolioPageItem
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
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, delay: (index % 5) * 0.03 }}
        >
          <div className="overflow-hidden rounded-2xl">
            <button
              type="button"
              onClick={onOpen}
              className="group relative block w-full text-left outline-none ring-brand-accent/40 focus-visible:ring-2"
            >
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: aspect }}>
                <motion.div className="absolute inset-[-14%] will-change-transform" style={{ y: yImg }}>
                  <PortfolioImage
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading={index < 4 ? 'eager' : 'lazy'}
                  />
                </motion.div>
                {(item.caption || item.categoryTitle) && (
                  <div className="absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-6">
                    {item.categoryTitle && (
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
                        {item.categoryTitle}
                      </p>
                    )}
                    {item.caption && (
                      <p className="mt-1 font-serif text-base text-white drop-shadow md:text-lg">{item.caption}</p>
                    )}
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

type Props = {
  categories: PortfolioCategoryPublic[]
  items: PortfolioPageItem[]
}

export default function PublicPortfolioGallery({ categories, items }: Props) {
  const [filterSlug, setFilterSlug] = useState<string | 'all'>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ['start 0.92', 'end 0.08'],
  })

  const filteredItems = useMemo(() => {
    if (filterSlug === 'all') return items
    return items.filter((i) => i.categorySlug === filterSlug)
  }, [items, filterSlug])

  const activeCategory = useMemo(
    () => (filterSlug === 'all' ? null : categories.find((c) => c.slug === filterSlug)),
    [categories, filterSlug]
  )

  const goPrev = useCallback(() => {
    setLightbox((i) => {
      if (i === null || filteredItems.length === 0) return i
      return (i - 1 + filteredItems.length) % filteredItems.length
    })
  }, [filteredItems.length])

  const goNext = useCallback(() => {
    setLightbox((i) => {
      if (i === null || filteredItems.length === 0) return i
      return (i + 1) % filteredItems.length
    })
  }, [filteredItems.length])

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

  useEffect(() => {
    setLightbox(null)
  }, [filterSlug])

  const openIndex = (displayIndex: number) => {
    setLightbox(displayIndex)
  }

  const current = lightbox !== null ? filteredItems[lightbox] : null

  return (
    <>
      <section className="section-padding bg-brand-bg">
        <div className="container-custom px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-ink/45">Galeria</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterSlug('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${filterSlug === 'all'
                  ? 'bg-brand-ink text-brand-bg'
                  : 'bg-brand-ink/5 text-brand-ink/80 hover:bg-brand-ink/10'
                }`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterSlug(c.slug)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${filterSlug === c.slug
                    ? 'bg-brand-ink text-brand-bg'
                    : 'bg-brand-ink/5 text-brand-ink/80 hover:bg-brand-ink/10'
                  }`}
              >
                {c.title}
              </button>
            ))}
          </div>
          {activeCategory?.description ? (
            <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-brand-ink/70">
              {activeCategory.description}
            </p>
          ) : null}
        </div>

        <div ref={gridRef} className="container-custom masonry-grid mt-10 px-2 sm:px-4 lg:px-8">
          {filteredItems.map((item, index) => (
            <MasonryTile
              key={item.id}
              scrollYProgress={scrollYProgress}
              item={item}
              index={index}
              onOpen={() => openIndex(index)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="mt-12 text-center font-sans text-sm text-brand-ink/50">Nenhuma imagem nesta categoria.</p>
        )}
      </section>

      <AnimatePresence>
        {current && lightbox !== null && (
          <motion.div
            role="dialog"
            aria-modal
            aria-label="Galeria em tela cheia"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-[110] rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setLightbox(null)
              }}
              aria-label="Fechar"
            >
              <X className="h-6 w-6" />
            </button>

            {filteredItems.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:left-6"
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
                  className="absolute right-2 top-1/2 z-[110] -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20 md:right-6"
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
              key={current.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="relative z-[105] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative min-h-0 flex-1 overflow-y-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.src}
                  alt={current.alt}
                  className="mx-auto max-h-[min(72vh,820px)] w-auto max-w-full object-contain"
                />
              </div>
              <div className="border-t border-white/10 px-5 py-4 text-left">
                {current.categoryTitle && (
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                    {current.categoryTitle}
                  </p>
                )}
                {current.caption && (
                  <h2 className="mt-1 font-serif text-xl text-white sm:text-2xl">{current.caption}</h2>
                )}
                {current.description && (
                  <p className="mt-2 font-sans text-sm leading-relaxed text-white/75">{current.description}</p>
                )}
                <p className="mt-3 font-sans text-xs text-white/40">
                  {lightbox + 1} / {filteredItems.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
