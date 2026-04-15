import exifr from 'exifr'

export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export async function extractDateFromImage(file: File): Promise<Date | null> {
  try {
    const data = await exifr.parse(file, ['DateTimeOriginal', 'CreateDate'])
    const date = data?.DateTimeOriginal || data?.CreateDate
    return date ? new Date(date) : null
  } catch (e) {
    console.error('Failed to extract EXIF data', e)
    return null
  }
}

export function generateFolderName(title: string, date: Date | null) {
  const d = date || new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const slug = slugify(title) || 'projeto'
  return `${year}-${month}-${slug}`
}

/**
 * Generates the prefixed filename to maintain order.
 * Example: index=0 -> 0001_original.jpg
 */
export function generatePrefixedFilename(filename: string, index: number) {
  const prefix = String(index + 1).padStart(4, '0')
  // Remove existing numeric prefixes if any to avoid stacking
  const cleanName = filename.replace(/^\d+_/, '')
  return `${prefix}_${cleanName}`
}
