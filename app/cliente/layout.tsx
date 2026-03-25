export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] font-sans text-white antialiased selection:bg-white/15">
      {children}
    </div>
  )
}
