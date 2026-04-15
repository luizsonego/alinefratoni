'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Dropzone } from './Dropzone'
import { SortableImageCard } from './SortableImageCard'
import { useUpload } from '@/hooks/use-upload'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Loader2, Rocket, Sparkles } from 'lucide-react'

interface UploadWorkspaceProps {
  eventId: string
  eventTitle: string
  r2Enabled: boolean
}

export function UploadWorkspace({ eventId, eventTitle, r2Enabled }: UploadWorkspaceProps) {
  const {
    queue,
    isUploading,
    autoFolderName,
    setAutoFolderName,
    addFiles,
    removeFile,
    setCover,
    reorder,
    startUpload
  } = useUpload(eventId, eventTitle)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      reorder(active.id, over.id)
    }
  }

  const successCount = queue.filter(i => i.status === 'success').length
  const totalCount = queue.length

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-warm-500 font-medium text-sm">
            <Sparkles className="h-4 w-4" />
            <span>Automação Ativa</span>
          </div>
          <h1 className="text-4xl font-serif font-bold text-zinc-50 tracking-tight">
            Upload do Projeto
          </h1>
          <p className="text-zinc-500">
            Arraste as fotos, organize a ordem e nós cuidamos do resto.
          </p>
        </div>

        <div className="flex flex-col gap-2 min-w-[300px]">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Nome da Pasta no R2
          </label>
          <div className="relative">
            <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              value={autoFolderName}
              onChange={(e) => setAutoFolderName(e.target.value)}
              placeholder="Gerando nome..."
              disabled={!r2Enabled}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 focus:ring-2 ring-warm-500/20 focus:border-warm-500/50 outline-none transition-all disabled:opacity-50"
            />
          </div>
          {!r2Enabled && (
            <p className="text-[10px] text-amber-400 font-medium">Cloudflare R2 não configurado.</p>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-950/40 border border-zinc-900 rounded-3xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
              Resumo da Fila
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500">Arquivos</span>
                 <span className="text-zinc-100 font-medium">{totalCount}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="text-zinc-500">Concluídos</span>
                 <span className="text-emerald-400 font-medium">{successCount}</span>
               </div>
               
               {totalCount > 0 && (
                 <div className="pt-4 mt-4 border-t border-zinc-900">
                   <button
                     onClick={startUpload}
                     disabled={isUploading || successCount === totalCount}
                     className="w-full py-3 px-4 bg-warm-600 hover:bg-warm-500 disabled:opacity-50 disabled:hover:bg-warm-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-warm-600/20"
                   >
                     {isUploading ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                     ) : (
                       <Rocket className="h-5 w-5" />
                     )}
                     {isUploading ? 'Enviando...' : 'Iniciar Upload'}
                   </button>
                 </div>
               )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          {r2Enabled ? (
            <Dropzone 
              onFilesSelected={addFiles} 
              disabled={isUploading}
              maxSizeMB={50}
            />
          ) : (
            <div className="p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-950/40 text-center">
              <p className="text-zinc-500">Configure as chaves do R2 para habilitar o upload de fotos.</p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <SortableContext
                items={queue.map(i => i.id)}
                strategy={rectSortingStrategy}
              >
                <AnimatePresence>
                  {queue.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      layout
                    >
                      <SortableImageCard
                        {...item}
                        name={item.file.name}
                        onDelete={() => removeFile(item.id)}
                        onSetCover={() => setCover(item.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </SortableContext>
            </div>
          </DndContext>
          
          {queue.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-zinc-900 rounded-3xl">
              <p className="text-zinc-600 text-sm">Sua galeria aparecerá aqui após o upload.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


