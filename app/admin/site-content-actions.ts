'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { AdminPortfolioItemRow } from '@/lib/site-content'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MAX_PORTFOLIO_CATEGORIES, MAX_PORTFOLIO_ITEMS, SITE_CONTENT_ID } from '@/lib/site-constants'
import { uniqueSlugs } from '@/lib/slugify'

function isHttpUrlOrPath(value: string) {
  const t = value.trim()
  if (!t) return true
  if (t.startsWith('/')) return true
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function isNonEmptyImageRef(value: string) {
  const t = value.trim()
  if (!t) return false
  if (t.startsWith('/')) return true
  try {
    new URL(t)
    return true
  } catch {
    return false
  }
}

function optionalHttpRef(s: string) {
  const t = s.trim()
  if (!t) return true
  return isHttpUrlOrPath(t)
}

const heroSchema = z.object({
  heroTitle: z.string().max(500),
  heroSubtitle: z.string().max(500),
  heroPosterUrl: z.string().max(2000).refine(isHttpUrlOrPath, 'Poster: URL ou caminho inválido.'),
  heroVideoUrl: z.string().max(2000).refine(isHttpUrlOrPath, 'Vídeo: URL ou caminho inválido.'),
})

const appendPortfolioImagesSchema = z.object({
  imageUrls: z
    .array(z.string().max(2000).refine(isNonEmptyImageRef, 'URL de imagem inválida.'))
    .min(1)
    .max(MAX_PORTFOLIO_ITEMS),
})

const deletePortfolioImageSchema = z.object({
  id: z.string().min(8).max(40),
})

const portfolioSchema = z.object({
  portfolioTitle: z.string().max(200),
  portfolioSubtitle: z.string().max(800),
  portfolioPageHeroTitle: z.string().max(200),
  portfolioPageHeroSubtitle: z.string().max(800),
  portfolioPageHeroBgUrl: z.string().max(2000).refine(isHttpUrlOrPath, 'Fundo da página portfólio: URL inválida.'),
  portfolioPageHeroChips: z.array(z.string().max(80)).max(12),
  categories: z
    .array(
      z.object({
        clientKey: z.string().min(1).max(90),
        title: z.string().min(1).max(120),
        description: z.string().max(600).optional(),
      })
    )
    .max(MAX_PORTFOLIO_CATEGORIES),
  items: z
    .array(
      z.object({
        imageUrl: z.string().max(2000).refine(isNonEmptyImageRef, 'URL de imagem inválida.'),
        altText: z.string().min(1).max(400),
        caption: z.string().max(200).optional(),
        description: z.string().max(4000).optional(),
        showOnHome: z.boolean(),
        categoryClientKey: z.string().max(90).optional(),
      })
    )
    .max(MAX_PORTFOLIO_ITEMS),
})

const testimonialItemSchema = z.object({
  id: z.string().max(80).optional(),
  name: z.string().min(1).max(120),
  quote: z.string().min(1).max(2000),
  imageUrl: z.string().max(2000).refine(optionalHttpRef, 'URL da foto inválida.'),
})

const testimonialsSchema = z.object({
  testimonialsTitle: z.string().max(200),
  testimonialsSubtitle: z.string().max(400),
  testimonials: z.array(testimonialItemSchema).max(20),
})

const contactSchema = z.object({
  contactHeading: z.string().max(300),
  contactBgImageUrl: z.string().max(2000).refine(isHttpUrlOrPath, 'URL de fundo inválida.'),
  contactShootTypes: z.array(z.string().max(80)).max(24),
})

const aboutSchema = z.object({
  aboutTitle: z.string().max(200),
  aboutImageUrl: z.string().max(2000).refine(isHttpUrlOrPath, 'URL da imagem inválida.'),
  aboutParagraphs: z.array(z.string().max(4000)).min(1).max(12),
})

const socialSchema = z.object({
  socialInstagram: z.string().max(500).refine(optionalHttpRef, 'URL do Instagram inválida.'),
  socialFacebook: z.string().max(500).refine(optionalHttpRef, 'URL do Facebook inválida.'),
  socialYoutube: z.string().max(500).refine(optionalHttpRef, 'URL do YouTube inválida.'),
})

const footerSchema = z.object({
  footerTagline: z.string().max(500),
  footerAddressLine: z.string().max(500),
})

const socialFooterSchema = z.object({
  socialInstagram: z.string().max(500).refine(optionalHttpRef, 'URL do Instagram inválida.'),
  socialFacebook: z.string().max(500).refine(optionalHttpRef, 'URL do Facebook inválida.'),
  socialYoutube: z.string().max(500).refine(optionalHttpRef, 'URL do YouTube inválida.'),
  footerTagline: z.string().max(500),
  footerAddressLine: z.string().max(500),
})

type ActionResult = { ok: true } | { ok: false; error: string }

async function ensureAdmin(): Promise<ActionResult | null> {
  try {
    await requireUser('ADMIN')
  } catch {
    return { ok: false, error: 'Não autorizado.' }
  }
  return null
}

export async function saveHeroSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = heroSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle,
      heroPosterUrl: d.heroPosterUrl.trim(),
      heroVideoUrl: d.heroVideoUrl.trim(),
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle:
        'Um recorte editorial do estúdio — famílias, gestantes e retratos guiados pela luz.',
    },
    update: {
      heroTitle: d.heroTitle,
      heroSubtitle: d.heroSubtitle,
      heroPosterUrl: d.heroPosterUrl.trim(),
      heroVideoUrl: d.heroVideoUrl.trim(),
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function savePortfolioSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = portfolioSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  const titles = d.categories.map((c) => c.title.trim())
  const slugs = uniqueSlugs(titles)

  await prisma.$transaction(async (tx) => {
    await tx.portfolioShowcaseItem.deleteMany({})
    await tx.portfolioCategory.deleteMany({})

    const keyToId = new Map<string, string>()
    for (let i = 0; i < d.categories.length; i++) {
      const row = d.categories[i]
      const desc = row.description?.trim() ? row.description.trim() : null
      const cat = await tx.portfolioCategory.create({
        data: { title: titles[i], slug: slugs[i], sortOrder: i, description: desc },
      })
      keyToId.set(row.clientKey, cat.id)
    }

    if (d.items.length > 0) {
      let homeSeq = 0
      await tx.portfolioShowcaseItem.createMany({
        data: d.items.map((item, galleryIndex) => {
          const ck = item.categoryClientKey?.trim() || ''
          const categoryId = ck ? keyToId.get(ck) ?? null : null
          const show = item.showOnHome
          const homeOrder = show ? homeSeq++ : 0
          return {
            showOnHome: show,
            homeSortOrder: homeOrder,
            gallerySortOrder: galleryIndex,
            imageUrl: item.imageUrl.trim(),
            altText: item.altText.trim(),
            caption: item.caption?.trim() ? item.caption.trim() : null,
            description: item.description?.trim() ? item.description.trim() : null,
            categoryId,
          }
        }),
      })
    }

    await tx.sitePublicContent.upsert({
      where: { id: SITE_CONTENT_ID },
      create: {
        id: SITE_CONTENT_ID,
        heroTitle: 'Capturando a essência através da luz.',
        heroSubtitle: 'Fotografia editorial e de família em Maringá',
        heroPosterUrl: '',
        heroVideoUrl: '',
        portfolioTitle: d.portfolioTitle,
        portfolioSubtitle: d.portfolioSubtitle,
        portfolioPageHeroTitle: d.portfolioPageHeroTitle,
        portfolioPageHeroSubtitle: d.portfolioPageHeroSubtitle,
        portfolioPageHeroBgUrl: d.portfolioPageHeroBgUrl.trim(),
        portfolioPageHeroChipsJson: d.portfolioPageHeroChips,
      },
      update: {
        portfolioTitle: d.portfolioTitle,
        portfolioSubtitle: d.portfolioSubtitle,
        portfolioPageHeroTitle: d.portfolioPageHeroTitle,
        portfolioPageHeroSubtitle: d.portfolioPageHeroSubtitle,
        portfolioPageHeroBgUrl: d.portfolioPageHeroBgUrl.trim(),
        portfolioPageHeroChipsJson: d.portfolioPageHeroChips,
      },
    })
  })

  revalidatePath('/')
  revalidatePath('/portfolio')
  revalidatePath('/admin/site')
  return { ok: true }
}

export type AppendPortfolioImagesResult =
  | { ok: true; items: AdminPortfolioItemRow[] }
  | { ok: false; error: string }

/** Cria registros no banco após upload no R2 (URLs públicas). Mantém categorias e demais dados intactos. */
export async function appendUploadedPortfolioImagesAction(
  raw: unknown
): Promise<AppendPortfolioImagesResult> {
  const deny = await ensureAdmin()
  if (deny && !deny.ok) return { ok: false, error: deny.error }

  const parsed = appendPortfolioImagesSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const urls = parsed.data.imageUrls.map((u) => u.trim())
  const current = await prisma.portfolioShowcaseItem.count()
  if (current + urls.length > MAX_PORTFOLIO_ITEMS) {
    const free = MAX_PORTFOLIO_ITEMS - current
    return {
      ok: false,
      error:
        free <= 0
          ? `Limite de ${MAX_PORTFOLIO_ITEMS} imagens atingido. Remova fotos ou aumente PORTFOLIO_MAX_ITEMS.`
          : `Só há espaço para mais ${free} foto(s) (limite ${MAX_PORTFOLIO_ITEMS}).`,
    }
  }

  const agg = await prisma.portfolioShowcaseItem.aggregate({ _max: { gallerySortOrder: true } })
  const base = (agg._max.gallerySortOrder ?? -1) + 1

  const created = await prisma.$transaction(
    urls.map((imageUrl, i) =>
      prisma.portfolioShowcaseItem.create({
        data: {
          imageUrl,
          altText: 'Foto do portfólio',
          caption: null,
          description: null,
          showOnHome: false,
          homeSortOrder: 0,
          gallerySortOrder: base + i,
          categoryId: null,
        },
      })
    )
  )

  const items: AdminPortfolioItemRow[] = created.map((row) => ({
    id: row.id,
    key: row.id,
    imageUrl: row.imageUrl,
    altText: row.altText,
    caption: row.caption ?? '',
    description: row.description ?? '',
    showOnHome: row.showOnHome,
    categoryClientKey: row.categoryId ?? '',
  }))

  revalidatePath('/')
  revalidatePath('/portfolio')
  revalidatePath('/admin/site')
  return { ok: true, items }
}

export async function deletePortfolioImageAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = deletePortfolioImageSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: 'Identificador da imagem inválido.' }
  }

  try {
    await prisma.portfolioShowcaseItem.delete({ where: { id: parsed.data.id } })
  } catch {
    return { ok: false, error: 'Imagem não encontrada ou já removida.' }
  }

  revalidatePath('/')
  revalidatePath('/portfolio')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveTestimonialsSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = testimonialsSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  const json = d.testimonials.map((t, i) => ({
    id: t.id?.trim() || `t-${i}`,
    name: t.name.trim(),
    quote: t.quote.trim(),
    imageUrl: t.imageUrl.trim(),
  }))

  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      testimonialsTitle: d.testimonialsTitle,
      testimonialsSubtitle: d.testimonialsSubtitle,
      testimonialsJson: json,
    },
    update: {
      testimonialsTitle: d.testimonialsTitle,
      testimonialsSubtitle: d.testimonialsSubtitle,
      testimonialsJson: json,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveContactSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = contactSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      contactHeading: d.contactHeading,
      contactBgImageUrl: d.contactBgImageUrl.trim(),
      contactShootTypesJson: d.contactShootTypes,
    },
    update: {
      contactHeading: d.contactHeading,
      contactBgImageUrl: d.contactBgImageUrl.trim(),
      contactShootTypesJson: d.contactShootTypes,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveAboutSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = aboutSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      aboutTitle: d.aboutTitle,
      aboutImageUrl: d.aboutImageUrl.trim(),
      aboutParagraphsJson: d.aboutParagraphs,
    },
    update: {
      aboutTitle: d.aboutTitle,
      aboutImageUrl: d.aboutImageUrl.trim(),
      aboutParagraphsJson: d.aboutParagraphs,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveSocialSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = socialSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      socialInstagram: d.socialInstagram.trim(),
      socialFacebook: d.socialFacebook.trim(),
      socialYoutube: d.socialYoutube.trim(),
    },
    update: {
      socialInstagram: d.socialInstagram.trim(),
      socialFacebook: d.socialFacebook.trim(),
      socialYoutube: d.socialYoutube.trim(),
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveFooterSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = footerSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      footerTagline: d.footerTagline,
      footerAddressLine: d.footerAddressLine,
    },
    update: {
      footerTagline: d.footerTagline,
      footerAddressLine: d.footerAddressLine,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}

export async function saveSocialFooterSiteAction(raw: unknown): Promise<ActionResult> {
  const deny = await ensureAdmin()
  if (deny) return deny

  const parsed = socialFooterSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' }
  }

  const d = parsed.data
  await prisma.sitePublicContent.upsert({
    where: { id: SITE_CONTENT_ID },
    create: {
      id: SITE_CONTENT_ID,
      heroTitle: 'Capturando a essência através da luz.',
      heroSubtitle: 'Fotografia editorial e de família em Maringá',
      heroPosterUrl: '',
      heroVideoUrl: '',
      portfolioTitle: 'Trabalhos selecionados',
      portfolioSubtitle: '',
      socialInstagram: d.socialInstagram.trim(),
      socialFacebook: d.socialFacebook.trim(),
      socialYoutube: d.socialYoutube.trim(),
      footerTagline: d.footerTagline,
      footerAddressLine: d.footerAddressLine,
    },
    update: {
      socialInstagram: d.socialInstagram.trim(),
      socialFacebook: d.socialFacebook.trim(),
      socialYoutube: d.socialYoutube.trim(),
      footerTagline: d.footerTagline,
      footerAddressLine: d.footerAddressLine,
    },
  })

  revalidatePath('/')
  revalidatePath('/admin/site')
  return { ok: true }
}
