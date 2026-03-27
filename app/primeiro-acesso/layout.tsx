import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Primeiro acesso',
  robots: { index: false, follow: false },
}

export default function PrimeiroAcessoLayout({ children }: { children: React.ReactNode }) {
  return children
}
