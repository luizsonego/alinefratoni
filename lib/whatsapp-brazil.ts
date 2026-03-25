/** Remove tudo que não for dígito. */
export function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}

/**
 * Formata entrada como celular BR: `11 98765-4321` ou fixo `11 3456-7890`.
 */
export function formatBrazilPhoneInput(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return d
  if (d.length <= 6) return `${d.slice(0, 2)} ${d.slice(2)}`
  if (d.length === 10) {
    return `${d.slice(0, 2)} ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return `${d.slice(0, 2)} ${d.slice(2, 7)}-${d.slice(7)}`
}

/**
 * Converte valor já salvo (vários formatos) para exibição no input mascarado.
 */
export function storedPhoneToDisplay(stored: string | null | undefined): string {
  if (!stored?.trim()) return ''
  let d = digitsOnly(stored)
  if (d.startsWith('55') && d.length > 11) {
    d = d.slice(2)
  }
  if (d.length > 11) d = d.slice(0, 11)
  return formatBrazilPhoneInput(d)
}

/**
 * Dígitos para `wa.me` (apenas números, com 55).
 */
export function brazilDisplayToWhatsAppDigits(displayOrDigits: string): string | null {
  const d = digitsOnly(displayOrDigits)
  if (d.startsWith('55')) {
    if (d.length >= 12 && d.length <= 13) return d
    return null
  }
  if (d.length === 10 || d.length === 11) {
    return `55${d}`
  }
  return null
}

export function buildShareWhatsAppMessage(opts: {
  clientName: string
  url: string
  passwordPlain?: string | null
}): string {
  const parts = opts.clientName.trim().split(/\s+/)
  const firstName = parts[0] && parts[0].length > 0 ? parts[0] : opts.clientName.trim()

  let text = `Olá, ${firstName}!\n\n`
  text += `Segue o link para você acessar as fotos do seu ensaio:\n${opts.url}\n\n`
  const pwd = opts.passwordPlain?.trim()
  if (pwd) {
    text += `Senha de acesso: ${pwd}\n\n`
  }
  text += `Qualquer dúvida, estamos à disposição!`
  return text
}
