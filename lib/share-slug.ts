import { randomBytes } from 'crypto'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/** Slug curto para URL pública (apenas [a-z0-9]). */
export function generateShareSlug(length = 10): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length]
  }
  return out
}
