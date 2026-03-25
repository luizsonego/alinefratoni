import Image from 'next/image'
import Link from 'next/link'

type Props = {
  href: string
  title: string
  coverUrl: string | null
  folderCount: number
}

export default function EventGridCard({ href, title, coverUrl, folderCount }: Props) {
  const folderLabel =
    folderCount === 1 ? '1 pasta de fotos' : `${folderCount} pastas de fotos`

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 shadow-xl shadow-black/30 transition duration-300 hover:border-zinc-600/80 hover:shadow-2xl"
    >
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-zinc-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-black text-sm text-zinc-600">
            Sem capa
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h2 className="text-balance font-sans text-xl font-semibold tracking-tight text-white md:text-2xl">
            {title}
          </h2>
          <p className="mt-1.5 text-[13px] text-zinc-400">{folderLabel}</p>
        </div>
      </div>
    </Link>
  )
}
