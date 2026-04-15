'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ImageCard, ImageStatus } from './ImageCard'

interface SortableImageCardProps {
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

export function SortableImageCard(props: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.3 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ImageCard {...props} />
    </div>
  )
}
