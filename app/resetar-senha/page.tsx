import { Suspense } from 'react'
import ResetarSenhaClient from './ResetarSenhaClient'

function ResetarSenhaFallback() {
  return (
    <main className="min-h-screen bg-black bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(80,80,80,0.12),transparent)] text-white antialiased">
      <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-12">
        <div className="w-full animate-pulse rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 shadow-2xl shadow-black/50 backdrop-blur-md">
          <div className="h-3 w-24 rounded bg-zinc-700/60" />
          <div className="mt-3 h-6 w-40 rounded bg-zinc-700/60" />
          <div className="mt-6 space-y-4">
            <div className="h-16 rounded-xl bg-zinc-800/50" />
            <div className="h-16 rounded-xl bg-zinc-800/50" />
            <div className="h-12 rounded-xl bg-zinc-700/40" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResetarSenhaPage() {
  return (
    <Suspense fallback={<ResetarSenhaFallback />}>
      <ResetarSenhaClient />
    </Suspense>
  )
}
