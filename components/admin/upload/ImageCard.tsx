'use client'

import { Check, GripVertical, Info, Loader2, Trash2, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { CdnImage } from '@/components/CdnImage'

export type ImageStatus = 'pending' | 'uploading' | 'success' | 'error'

interface ImageCardProps {
  id: string
  name: string
  previewUrl: string
  status: ImageStatus
  progress: number
  isCover?: boolean
  error?: string | null
  onDelete: () => void
  onSetCover: () => void
}

export function ImageCard({
  name,
  previewUrl,
  status,
  progress,
  isCover,
  error,
  onDelete,
  onSetCover
}: ImageCardProps) {
  return (
    <div className={`relative group aspect-[4/5] rounded-2xl overflow-hidden border transition-all duration-500 ${
      isCover ? 'border-warm-500/50 ring-2 ring-warm-500/20' : 'border-zinc-800'
    } bg-zinc-900`}>
      {/* Background Preview */}
      <div className="absolute inset-0 z-0">
        <CdnImage
          src={previewUrl}
          alt={name}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${
            status === 'pending' || status === 'uploading' ? 'opacity-40 grayscale blur-[2px]' : 'opacity-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 p-4 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <button
            type="button"
            className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onSetCover(); }}
              className={`p-1.5 rounded-lg backdrop-blur-md border transition-all ${
                isCover 
                ? 'bg-warm-500 text-white border-warm-400' 
                : 'bg-black/40 border-white/10 text-white/60 hover:text-white'
              }`}
              title={isCover ? "Foto de Capa" : "Marcar como Capa"}
            >
              <Trophy className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 hover:bg-red-500/40 transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          {status === 'uploading' && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-warm-200">
                <span>Enviando...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-warm-500"
                />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-medium text-emerald-400">Pronto</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                  <Info className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-medium text-red-400">Erro</span>
              </div>
              {error && <p className="text-[10px] text-red-300/80 leading-tight">{error}</p>}
            </div>
          )}

          <p className="mt-2 text-[11px] font-medium text-white/90 truncate drop-shadow-md">
            {name}
          </p>
        </div>
      </div>

      {isCover && (
        <div className="absolute top-0 right-0 p-3 z-20 pointer-events-none">
           <span className="text-[10px] font-bold bg-warm-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
             Capa
           </span>
        </div>
      )}
    </div>
  )
}
