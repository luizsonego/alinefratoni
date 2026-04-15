'use client'

import { useState, useCallback, useRef } from 'react'
import { generateFolderName, generatePrefixedFilename, extractDateFromImage } from '@/lib/upload-utils'

export type UploadItem = {
  id: string
  file: File
  previewUrl: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string | null
  isCover?: boolean
}

export function useUpload(eventId: string, projectTitle: string) {
  const [queue, setQueue] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [folderId, setFolderId] = useState<string | null>(null)
  const [autoFolderName, setAutoFolderName] = useState('')
  const [extraDate, setExtraDate] = useState<Date | null>(null)

  const addFiles = useCallback(async (files: File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file), // Memory leak risk if many, but fine for local admin
      status: 'pending',
      progress: 0,
    }))

    // If it's the first time adding files, try to extract date from the first one
    if (queue.length === 0 && files.length > 0) {
      const date = await extractDateFromImage(files[0])
      setExtraDate(date)
      setAutoFolderName(generateFolderName(projectTitle, date))
    }

    setQueue(prev => [...prev, ...newItems])
  }, [queue.length, projectTitle])

  const removeFile = useCallback((id: string) => {
    setQueue(prev => {
      const item = prev.find(i => i.id === id)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter(i => i.id !== id)
    })
  }, [])

  const setCover = useCallback((id: string) => {
    setQueue(prev => prev.map(item => ({
      ...item,
      isCover: item.id === id
    })))
  }, [])

  const reorder = useCallback((activeId: string, overId: string) => {
    setQueue(prev => {
      const oldIndex = prev.findIndex(item => item.id === activeId)
      const newIndex = prev.findIndex(item => item.id === overId)
      
      const newQueue = [...prev]
      const [movedItem] = newQueue.splice(oldIndex, 1)
      newQueue.splice(newIndex, 0, movedItem)
      
      return newQueue
    })
  }, [])

  const startUpload = async () => {
    if (isUploading || queue.length === 0) return
    setIsUploading(true)

    try {
      // 1. Create folder if not exists
      let currentFolderId = folderId
      if (!currentFolderId) {
        const res = await fetch('/api/admin/r2/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, title: autoFolderName }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Falha ao criar pasta')
        currentFolderId = data.folder.id
        setFolderId(currentFolderId)
      }

      // 2. Upload files in sequence or small batches
      for (let i = 0; i < queue.length; i++) {
        const item = queue[i]
        if (item.status === 'success') continue

        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'uploading' } : q))

        try {
          const prefixedName = generatePrefixedFilename(item.file.name, i)
          
          // Simplified upload for now - in a real app we'd use XHR or multipart
          // For the sake of the demo and the request, I'll use the existing R2 logic
          // but refactored to support the prefixed name.
          
          const uploadRes = await fetch('/api/admin/r2/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              folderId: currentFolderId,
              filename: prefixedName,
              contentType: item.file.type,
              expectImage: true,
            }),
          })
          
          const { signedUrl, contentType } = await uploadRes.json()
          
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open('PUT', signedUrl)
            xhr.setRequestHeader('Content-Type', contentType)
            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const progress = (e.loaded / e.total) * 100
                setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress } : q))
              }
            }
            xhr.onload = () => resolve()
            xhr.onerror = () => reject(new Error('Erro no upload'))
            xhr.send(item.file)
          })

          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'success', progress: 100 } : q))
          
          // If it's the cover, update the event cover
          if (item.isCover) {
             // Logic to update event cover would go here
             // await fetch(`/api/admin/projects/${eventId}/cover`, { ... })
          }

        } catch (err: any) {
          setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err.message } : q))
        }
      }
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return {
    queue,
    isUploading,
    autoFolderName,
    setAutoFolderName,
    addFiles,
    removeFile,
    setCover,
    reorder,
    startUpload
  }
}
