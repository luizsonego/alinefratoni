import PortfolioHero from '../../components/PortfolioHero'
import PortfolioGallery from '../../components/PortfolioGallery'
import PortfolioStats from '../../components/PortfolioStats'
import PortfolioCTA from '../../components/PortfolioCTA'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Portfólio - Aline Fratoni Fotografia',
  description: 'Explore nosso portfólio de ensaios fotográficos. Ensaios femininos, acompanhamentos, datas temáticas e muito mais.',
}

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <PortfolioHero />
      <PortfolioGallery />
      <PortfolioStats />
      <PortfolioCTA />
      <Footer />
    </main>
  )
}
