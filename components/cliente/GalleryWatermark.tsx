/** Decoração de fundo no estilo “template” (linhas finas, baixo contraste). */
export default function GalleryWatermark() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-[0.12]"
    >
      <svg
        className="absolute -right-8 -top-4 h-48 w-[120%] text-white"
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 95 L80 40 L160 95 L240 40 L320 95 L400 40"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M0 105 L80 50 L160 105 L240 50 L320 105 L400 50"
          stroke="currentColor"
          strokeWidth="0.8"
          opacity="0.6"
        />
        <line x1="80" y1="40" x2="80" y2="115" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        <line x1="160" y1="95" x2="160" y2="115" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        <line x1="240" y1="40" x2="240" y2="115" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
        <line x1="320" y1="95" x2="320" y2="115" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>
    </div>
  )
}
