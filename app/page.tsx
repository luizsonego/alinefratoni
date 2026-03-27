import Header from '../components/Header'
import Hero from '../components/Hero'
import HomePortfolio from '../components/HomePortfolio'
import StudioSection from '../components/StudioSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ProcessSection from '../components/ProcessSection'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'
import { getResolvedSiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

const LOCAL_BUSINESS_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Aline Fratoni Fotografia',
  description:
    'Fotografia editorial e de família em Maringá — ensaios fine art, gestante, newborn e família.',
  url: typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' ? process.env.NEXT_PUBLIC_SITE_URL : undefined,
  telephone: '+55-44-9142-4790',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Maringá',
    addressRegion: 'PR',
    addressCountry: 'BR',
  },
  areaServed: {
    '@type': 'City',
    name: 'Maringá',
  },
  priceRange: '$$',
}

export default async function Home() {
  const site = await getResolvedSiteContent()
  const jsonLd = {
    ...LOCAL_BUSINESS_JSON_LD,
    image: site.hero.posterUrl,
    url: LOCAL_BUSINESS_JSON_LD.url ?? 'https://alinefratoni.com.br',
    description: site.about.paragraphs,
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-brand-bg">
        <SmoothScroll />
        <Header />
        <Hero {...site.hero} />
        <HomePortfolio portfolioSection={site.portfolioSection} items={site.portfolioHomeItems} />
        <StudioSection {...site.about} />
        <TestimonialsSection {...site.testimonials} />
        <ProcessSection />
        <Footer social={site.social} footer={site.footer} contact={site.contact} />
      </main>
    </>
  )
}
