import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default function GalleryTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-zinc-800/40 bg-black/70 px-4 py-3 backdrop-blur-md md:px-8">
      <Link
        href="/cliente"
        className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-300"
      >
        ← Eventos
      </Link>
      <div className="flex items-center gap-4">
        <span className="hidden text-[11px] uppercase tracking-[0.2em] text-zinc-600 sm:inline">
          Galeria
        </span>
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
