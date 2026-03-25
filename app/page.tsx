import Header from '../components/Header'
import Hero from '../components/Hero'
import IntroSection from '../components/IntroSection'
import ExperienceSection from '../components/ExperienceSection'
import TestimonialsSection from '../components/TestimonialsSection'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'
import SmoothScroll from '../components/SmoothScroll'

export default function Home() {
  return (
    <main className="min-h-screen">
      <SmoothScroll />
      <Header />
      <Hero />
      <IntroSection />
      <ExperienceSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
