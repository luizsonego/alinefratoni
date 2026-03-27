import type { Metadata } from 'next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PortfolioHero from '../../components/PortfolioHero'
import PublicPortfolioGallery from '../../components/PublicPortfolioGallery'
import PortfolioStats from '../../components/PortfolioStats'
import PortfolioCTA from '../../components/PortfolioCTA'
import { getPortfolioPageData, getResolvedSiteContent } from '@/lib/site-content'
import { SITE_NAME } from '@/lib/site-config'

export const dynamic = 'force-dynamic'

const portfolioDesc =
  'Explore o portfólio de ensaios fotográficos — família, gestante, editorial e mais.'

export const metadata: Metadata = {
  title: 'Portfólio',
  description: portfolioDesc,
  alternates: { canonical: '/portfolio' },
  openGraph: {
    type: 'website',
    url: '/portfolio',
    title: `Portfólio — ${SITE_NAME}`,
    description: portfolioDesc,
  },
  twitter: {
    card: 'summary_large_image',
    title: `Portfólio — ${SITE_NAME}`,
    description: portfolioDesc,
  },
}

export default async function PortfolioPage() {
  const [page, site] = await Promise.all([getPortfolioPageData(), getResolvedSiteContent()])

  return (
    <main className="min-h-screen bg-brand-bg">
      <Header />
      <PortfolioHero {...page.hero} />
      <PublicPortfolioGallery categories={page.categories} items={page.items} />
      <PortfolioStats />
      <PortfolioCTA />
      <Footer social={site.social} footer={site.footer} contact={site.contact} />
    </main>
  )
}
