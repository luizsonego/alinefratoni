import LogoutButton from '@/components/LogoutButton'
import Link from 'next/link'

type Props = {
  eyebrow: string
  title: string
  subtitle?: string
}

export default function ClientAreaHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <header className="mb-10 flex flex-col gap-6 border-b border-zinc-800/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-zinc-500">{eyebrow}</p>
        <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white md:text-4xl">
          {title}
        </h1>
        {subtitle && <p className="mt-2 max-w-xl text-sm text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/cliente/conta"
          className="rounded-full border border-zinc-700/80 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-400 transition hover:border-zinc-500 hover:text-white"
        >
          Trocar senha
        </Link>
        <LogoutButton variant="minimal" />
      </div>
    </header>
  )
}
