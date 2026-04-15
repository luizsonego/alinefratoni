'use client'

import { Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  maxSizeMB?: number
}

export function Dropzone({ onFilesSelected, disabled, maxSizeMB = 50 }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) setIsDragActive(true)
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    setError(null)
    
    const selectedFiles = Array.from(files)
    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isSmaller = file.size <= maxSizeMB * 1024 * 1024
      return isImage && isSmaller
    })

    if (validFiles.length < selectedFiles.length) {
      setError(`Alguns arquivos foram ignorados (limite de ${maxSizeMB}MB ou formato inválido).`)
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragActive ? 1.01 : 1,
          borderColor: isDragActive ? 'rgba(196, 167, 125, 0.8)' : 'rgba(39, 39, 42, 1)',
          backgroundColor: isDragActive ? 'rgba(196, 167, 125, 0.05)' : 'rgba(9, 9, 11, 0.4)'
        }}
        className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-12 transition-all duration-300 ease-out flex flex-col items-center justify-center text-center ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
        
        <div className="relative mb-6">
          <motion.div
            animate={{ y: isDragActive ? -10 : 0 }}
            className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl"
          >
            <Upload className={`h-8 w-8 transition-colors ${isDragActive ? 'text-warm-400' : 'text-zinc-500'}`} />
          </motion.div>
          {isDragActive && (
             <motion.div
               layoutId="pulse"
               className="absolute inset-0 rounded-2xl bg-warm-400/20 blur-xl"
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1.5, opacity: 1 }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
             />
          )}
        </div>

        <div>
          <h3 className="text-xl font-medium text-zinc-100 tracking-tight">
            Arraste suas fotos aqui
          </h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto">
            Ou clique para selecionar arquivos. Suporta JPG, PNG e WebP até {maxSizeMB}MB.
          </p>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between gap-4"
          >
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="text-red-300/50 hover:text-red-300 p-1">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
