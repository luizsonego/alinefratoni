import { prisma } from '@/lib/prisma'
import { MAX_PORTFOLIO_CATEGORIES, MAX_PORTFOLIO_ITEMS, SITE_CONTENT_ID } from '@/lib/site-constants'
import { normalizeLegacySiteAssetUrl } from '@/lib/site-asset-url'

export { MAX_PORTFOLIO_CATEGORIES, MAX_PORTFOLIO_ITEMS, SITE_CONTENT_ID }

export type HeroPublicContent = {
  title: string
  subtitle: string
  posterUrl: string
  videoUrl: string
}

export type PortfolioSectionContent = {
  title: string
  subtitle: string
}

export type PortfolioTileContent = {
  id: string
  src: string
  alt: string
  caption?: string
  description?: string
}

export type TestimonialCard = {
  id: string
  name: string
  quote: string
  imageUrl: string
}

export type TestimonialsSectionContent = {
  title: string
  subtitle: string
  items: TestimonialCard[]
}

export type ContactPublicContent = {
  heading: string
  bgImageUrl: string
  shootTypes: string[]
}

export type AboutPublicContent = {
  title: string
  paragraphs: string[]
  imageUrl: string
}

export type SocialPublicContent = {
  instagram: string
  facebook: string
  youtube: string
}

export type FooterPublicContent = {
  tagline: string
  addressLine: string
}

export type PortfolioPageHeroContent = {
  title: string
  subtitle: string
  backgroundImageUrl: string
  chips: string[]
}

export type PortfolioCategoryPublic = {
  id: string
  title: string
  slug: string
  description?: string
}

export type PortfolioPageItem = {
  id: string
  src: string
  alt: string
  caption?: string
  description?: string
  categorySlug: string | null
  categoryTitle: string | null
}

export const DEFAULT_HERO: HeroPublicContent = {
  title: 'Capturando a essência através da luz.',
  subtitle: 'Fotografia editorial e de família em Maringá',
  posterUrl:
    'https://cdn.alinefratoni.com.br/site/public/1775069730925-Aline_Jean_e_Davi_-_maes_2025-5.jpg',
  videoUrl: '/videos/8033527-uhd_3840_2160_24fps.mp4',
}

export const DEFAULT_PORTFOLIO_SECTION: PortfolioSectionContent = {
  title: 'Trabalhos selecionados',
  subtitle:
    'Um recorte editorial do estúdio — famílias, gestantes e retratos guiados pela luz.',
}

export const DEFAULT_PORTFOLIO_PAGE_HERO: PortfolioPageHeroContent = {
  title: 'Nosso portfólio',
  subtitle:
    'Cada ensaio conta uma história única. Explore a galeria e inspire-se para criar suas memórias.',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1759800805660-8bc4595568ec?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1600',
  chips: ['Ensaios femininos', 'Acompanhamentos', 'Datas temáticas', 'Família'],
}

const FALLBACK_PORTFOLIO_TILES: PortfolioTileContent[] = [
  {
    id: 'fb-1',
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=900',
    alt: 'Ensaio família em ambiente acolhedor',
  },
  {
    id: 'fb-2',
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900',
    alt: 'Casal em luz natural',
  },
  {
    id: 'fb-3',
    src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=900',
    alt: 'Retrato editorial',
    caption: 'Coleção Afeto — Família Silva',
  },
  {
    id: 'fb-4',
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900',
    alt: 'Newborn delicado',
  },
  {
    id: 'fb-5',
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=900',
    alt: 'Moda fine art',
  },
  {
    id: 'fb-6',
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900',
    alt: 'Gestante',
  },
  {
    id: 'fb-7',
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900',
    alt: 'Família ao ar livre',
  },
  {
    id: 'fb-8',
    src: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=900',
    alt: 'Detalhes orgânicos',
  },
]

const DEFAULT_TESTIMONIALS: TestimonialCard[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
    name: 'Mariana & Bruno',
    quote:
      'A Aline capturou exatamente o clima que vivíamos — suave, íntimo e cheio de significado. Voltaríamos a fazer o ensaio só para viver o dia com ela.',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    name: 'Família Nogueira',
    quote:
      'Nosso álbum virou o retrato mais honesto da nossa família. Luz impecável, paciência infinita com as crianças e um olhar que nos emocionou.',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=200&q=80',
    name: 'Juliana Ferreira',
    quote:
      'Direção delicada e estética atemporal. Cada frame parece uma página de revista, mas ainda cheira a casa, a nós, ao nosso tempo.',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    name: 'Camila Souza',
    quote:
      'Do briefing à entrega, tudo muito claro e acolhedor. Recomendo para quem busca fotografia com alma e acabamento impecável.',
  },
]

const DEFAULT_CONTACT_SHOOT_TYPES = ['Ensaio Feminino', 'Acompanhamento', 'Data Temática', 'Família', 'Outro']

const FALLBACK_PORTFOLIO_PAGE_ITEMS: PortfolioPageItem[] = [
  {
    id: 'demo-1',
    src: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=900&q=80',
    alt: 'Ensaio feminino',
    caption: 'Ensaio feminino',
    description: 'Um ensaio que capturou a essência e beleza natural.',
    categorySlug: 'feminino',
    categoryTitle: 'Feminino',
  },
  {
    id: 'demo-2',
    src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
    alt: 'Acompanhamento',
    caption: 'Família Silva',
    description: 'Registros do crescimento e momentos especiais da família.',
    categorySlug: 'acompanhamento',
    categoryTitle: 'Acompanhamento',
  },
  {
    id: 'demo-3',
    src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80',
    alt: 'Data temática',
    caption: 'Natal',
    description: 'Ensaio temático com toda a magia da época.',
    categorySlug: 'tematico',
    categoryTitle: 'Temático',
  },
  {
    id: 'demo-4',
    src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80',
    alt: 'Ensaio feminino',
    caption: 'Maria',
    description: 'Beleza e elegância em cada clique.',
    categorySlug: 'feminino',
    categoryTitle: 'Feminino',
  },
  {
    id: 'demo-5',
    src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    alt: 'Família',
    caption: 'Família Santos',
    description: 'Momentos únicos de uma família unida.',
    categorySlug: 'familia',
    categoryTitle: 'Família',
  },
  {
    id: 'demo-6',
    src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
    alt: 'Aniversário',
    caption: 'Data temática',
    description: 'Celebração de mais um ano de vida.',
    categorySlug: 'tematico',
    categoryTitle: 'Temático',
  },
]

const FALLBACK_PORTFOLIO_CATEGORIES: PortfolioCategoryPublic[] = [
  { id: 'demo-c1', title: 'Feminino', slug: 'feminino' },
  { id: 'demo-c2', title: 'Acompanhamento', slug: 'acompanhamento' },
  { id: 'demo-c3', title: 'Temático', slug: 'tematico' },
  { id: 'demo-c4', title: 'Família', slug: 'familia' },
]

function parseStringArrayJson(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean)
}

function parseTestimonialsJson(v: unknown): TestimonialCard[] {
  if (!Array.isArray(v)) return []
  const out: TestimonialCard[] = []
  v.forEach((item, i) => {
    if (!item || typeof item !== 'object') return
    const o = item as Record<string, unknown>
    const name = typeof o.name === 'string' ? o.name.trim() : ''
    const quote = typeof o.quote === 'string' ? o.quote.trim() : ''
    const imageUrl = typeof o.imageUrl === 'string' ? o.imageUrl.trim() : ''
    const id = typeof o.id === 'string' ? o.id : `t-${i}`
    if (!name || !quote) return
    out.push({ id, name, quote, imageUrl })
  })
  return out
}

function parseParagraphsJson(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string').map((s) => s.trim()).filter(Boolean)
}

function rowToTile(item: {
  id: string
  imageUrl: string
  altText: string
  caption: string | null
  description: string | null
}): PortfolioTileContent {
  return {
    id: item.id,
    src: normalizeLegacySiteAssetUrl(item.imageUrl),
    alt: item.altText,
    caption: item.caption ?? undefined,
    description: item.description ?? undefined,
  }
}

function rowToPageItem(item: {
  id: string
  imageUrl: string
  altText: string
  caption: string | null
  description: string | null
  category: { title: string; slug: string } | null
}): PortfolioPageItem {
  return {
    id: item.id,
    src: normalizeLegacySiteAssetUrl(item.imageUrl),
    alt: item.altText,
    caption: item.caption ?? undefined,
    description: item.description ?? undefined,
    categorySlug: item.category?.slug ?? null,
    categoryTitle: item.category?.title ?? null,
  }
}

export type ResolvedSiteContent = {
  hero: HeroPublicContent
  portfolioSection: PortfolioSectionContent
  portfolioHomeItems: PortfolioTileContent[]
  testimonials: TestimonialsSectionContent
  contact: ContactPublicContent
  about: AboutPublicContent
  social: SocialPublicContent
  footer: FooterPublicContent
}

export type AdminPortfolioCategoryRow = { clientKey: string; title: string; description: string }

export type AdminPortfolioItemRow = {
  id: string
  key: string
  imageUrl: string
  altText: string
  caption: string
  description: string
  showOnHome: boolean
  categoryClientKey: string
}

export type FullSiteEditorState = ResolvedSiteContent & {
  portfolioPageHero: PortfolioPageHeroContent
  portfolioCategories: AdminPortfolioCategoryRow[]
  portfolioItemsAdmin: AdminPortfolioItemRow[]
}

export async function getResolvedSiteContent(): Promise<ResolvedSiteContent> {
  type SiteRow = Awaited<ReturnType<typeof prisma.sitePublicContent.findUnique>>
  type HomeRow = Awaited<ReturnType<typeof prisma.portfolioShowcaseItem.findMany>>

  let row: SiteRow = null
  let homeRows: HomeRow = []
  let totalCount = 0

  try {
    ;[row, homeRows, totalCount] = await Promise.all([
      prisma.sitePublicContent.findUnique({ where: { id: SITE_CONTENT_ID } }),
      prisma.portfolioShowcaseItem.findMany({
        where: { showOnHome: true },
        orderBy: { homeSortOrder: 'asc' },
      }),
      prisma.portfolioShowcaseItem.count(),
    ])
  } catch (err) {
    console.error(
      '[getResolvedSiteContent] Falha ao aceder à base de dados — a servir conteúdo por omissão.',
      err
    )
  }

  const hero: HeroPublicContent = row
    ? {
      title: (row.heroTitle ?? '').trim() || DEFAULT_HERO.title,
      subtitle: (row.heroSubtitle ?? '').trim() || DEFAULT_HERO.subtitle,
      posterUrl: normalizeLegacySiteAssetUrl(
        (row.heroPosterUrl ?? '').trim() || DEFAULT_HERO.posterUrl
      ),
      videoUrl: (row.heroVideoUrl ?? '').trim() || DEFAULT_HERO.videoUrl,
    }
    : DEFAULT_HERO

  const portfolioSection: PortfolioSectionContent = row
    ? {
      title: (row.portfolioTitle ?? '').trim() || DEFAULT_PORTFOLIO_SECTION.title,
      subtitle: (row.portfolioSubtitle ?? '').trim() || DEFAULT_PORTFOLIO_SECTION.subtitle,
    }
    : DEFAULT_PORTFOLIO_SECTION

  let portfolioHomeItems: PortfolioTileContent[]
  if (totalCount === 0) {
    portfolioHomeItems = FALLBACK_PORTFOLIO_TILES
  } else if (homeRows.length === 0) {
    portfolioHomeItems = []
  } else {
    portfolioHomeItems = homeRows.map(rowToTile)
  }

  const testimonialsJson = row?.testimonialsJson
  const testimonialItems =
    parseTestimonialsJson(testimonialsJson).length > 0
      ? parseTestimonialsJson(testimonialsJson)
      : DEFAULT_TESTIMONIALS

  const testimonials: TestimonialsSectionContent = {
    title: row?.testimonialsTitle?.trim() || 'O que dizem por aqui',
    subtitle: row?.testimonialsSubtitle?.trim() || 'Histórias reais, em tom de editorial.',
    items: testimonialItems,
  }

  const shootTypes = parseStringArrayJson(row?.contactShootTypesJson)
  const contact: ContactPublicContent = {
    heading:
      row?.contactHeading?.trim() || 'Vamos criar memórias inesquecíveis juntas?',
    bgImageUrl:
      row?.contactBgImageUrl?.trim() || 'https://ik.imagekit.io/500milhas/alinefoto_wKOHM6fRlR.jpg',
    shootTypes: shootTypes.length > 0 ? shootTypes : DEFAULT_CONTACT_SHOOT_TYPES,
  }

  const paragraphs = parseParagraphsJson(row?.aboutParagraphsJson)
  const about: AboutPublicContent = {
    title: row?.aboutTitle?.trim() || 'O Estúdio',
    imageUrl:
      row?.aboutImageUrl?.trim() || 'https://ik.imagekit.io/500milhas/alinefoto_wKOHM6fRlR.jpg',
    paragraphs:
      paragraphs.length > 0
        ? paragraphs
        : [
          'O estúdio foi pensado como um refúgio silencioso: luz natural, tons neutros e tempo para que cada detalhe respire. Trabalho com fotografia editorial e de família em Maringá, sempre com direção gentil para que você se sinta vista — não dirigida.',
          'Cada sessão é construída em etapas, do briefing à entrega, com calma e intenção. O resultado são imagens atemporais, cheias de afeto e identidade.',
        ],
  }

  const social: SocialPublicContent = {
    instagram: row?.socialInstagram?.trim() || 'https://www.instagram.com/alinefratonifotografia/',
    facebook: row?.socialFacebook?.trim() || '',
    youtube: row?.socialYoutube?.trim() || '',
  }

  const footer: FooterPublicContent = {
    tagline:
      row?.footerTagline?.trim() ||
      'Fotografia editorial e de família em Maringá — ensaios fine art com luz natural.',
    addressLine: row?.footerAddressLine?.trim() || 'Maringá — Paraná, Brasil\nAtendimento sob consulta',
  }

  return {
    hero,
    portfolioSection,
    portfolioHomeItems,
    testimonials,
    contact,
    about,
    social,
    footer,
  }
}

export async function getPortfolioPageData(): Promise<{
  hero: PortfolioPageHeroContent
  categories: PortfolioCategoryPublic[]
  items: PortfolioPageItem[]
}> {
  type SiteRow = Awaited<ReturnType<typeof prisma.sitePublicContent.findUnique>>
  type CatRows = Awaited<ReturnType<typeof prisma.portfolioCategory.findMany>>
  type ItemRows = Awaited<ReturnType<typeof prisma.portfolioShowcaseItem.findMany<{ include: { category: true } }>>>

  let row: SiteRow = null
  let categories: CatRows = []
  let items: ItemRows = []

  try {
    ;[row, categories, items] = await Promise.all([
      prisma.sitePublicContent.findUnique({ where: { id: SITE_CONTENT_ID } }),
      prisma.portfolioCategory.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.portfolioShowcaseItem.findMany({
        orderBy: { gallerySortOrder: 'asc' },
        include: { category: true },
      }),
    ])
  } catch (err) {
    console.error(
      '[getPortfolioPageData] Falha ao aceder à base de dados — a servir portfólio de demonstração.',
      err
    )
  }

  const chips = parseStringArrayJson(row?.portfolioPageHeroChipsJson)
  const hero: PortfolioPageHeroContent = {
    title: row?.portfolioPageHeroTitle?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.title,
    subtitle: row?.portfolioPageHeroSubtitle?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.subtitle,
    backgroundImageUrl:
      row?.portfolioPageHeroBgUrl?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.backgroundImageUrl,
    chips: chips.length > 0 ? chips : DEFAULT_PORTFOLIO_PAGE_HERO.chips,
  }

  if (items.length === 0) {
    return {
      hero,
      categories: FALLBACK_PORTFOLIO_CATEGORIES,
      items: FALLBACK_PORTFOLIO_PAGE_ITEMS,
    }
  }

  const catPublic: PortfolioCategoryPublic[] = categories.map((c: any) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description?.trim() || undefined,
  }))

  return {
    hero,
    categories: catPublic,
    items: items.map(rowToPageItem),
  }
}

export async function getFullSiteEditorState(): Promise<FullSiteEditorState> {
  const base = await getResolvedSiteContent()
  const row = await prisma.sitePublicContent.findUnique({ where: { id: SITE_CONTENT_ID } })
  const categories = await prisma.portfolioCategory.findMany({ orderBy: { sortOrder: 'asc' } })
  const allItems = await prisma.portfolioShowcaseItem.findMany({
    orderBy: { gallerySortOrder: 'asc' },
    include: { category: true },
  })

  const chips = parseStringArrayJson(row?.portfolioPageHeroChipsJson)
  const portfolioPageHero: PortfolioPageHeroContent = {
    title: row?.portfolioPageHeroTitle?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.title,
    subtitle: row?.portfolioPageHeroSubtitle?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.subtitle,
    backgroundImageUrl:
      row?.portfolioPageHeroBgUrl?.trim() || DEFAULT_PORTFOLIO_PAGE_HERO.backgroundImageUrl,
    chips: chips.length > 0 ? chips : DEFAULT_PORTFOLIO_PAGE_HERO.chips,
  }

  const portfolioCategories: AdminPortfolioCategoryRow[] = categories.map((c) => ({
    clientKey: c.id,
    title: c.title,
    description: c.description ?? '',
  }))

  const portfolioItemsAdmin: AdminPortfolioItemRow[] = allItems.map((item) => ({
    id: item.id,
    key: item.id,
    imageUrl: normalizeLegacySiteAssetUrl(item.imageUrl),
    altText: item.altText,
    caption: item.caption ?? '',
    description: item.description ?? '',
    showOnHome: item.showOnHome,
    categoryClientKey: item.categoryId ? item.category!.id : '',
  }))

  return {
    ...base,
    portfolioPageHero,
    portfolioCategories,
    portfolioItemsAdmin,
  }
}
