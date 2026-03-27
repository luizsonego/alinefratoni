import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redefinir senha',
  robots: { index: false, follow: false },
}

export default function ResetarSenhaLayout({ children }: { children: React.ReactNode }) {
  return children
}
