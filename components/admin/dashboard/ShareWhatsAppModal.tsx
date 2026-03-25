'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/admin/ui/Modal'
import {
  brazilDisplayToWhatsAppDigits,
  buildShareWhatsAppMessage,
  formatBrazilPhoneInput,
  storedPhoneToDisplay,
} from '@/lib/whatsapp-brazil'

export type ShareWhatsAppModalProps = {
  open: boolean
  onClose: () => void
  clientName: string
  defaultPhone: string | null
  shareUrl: string
  linkHasPassword: boolean
  /** Senha conhecida (ex.: acabou de ser digitada ao criar o link). */
  initialPasswordForMessage: string | null
}

export function ShareWhatsAppModal({
  open,
  onClose,
  clientName,
  defaultPhone,
  shareUrl,
  linkHasPassword,
  initialPasswordForMessage,
}: ShareWhatsAppModalProps) {
  const [phoneDisplay, setPhoneDisplay] = useState('')
  const [manualPassword, setManualPassword] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPhoneDisplay(storedPhoneToDisplay(defaultPhone))
    setManualPassword('')
    setPhoneError(null)
  }, [open, defaultPhone])

  const effectivePassword =
    initialPasswordForMessage?.trim() || manualPassword.trim() || null

  const previewMessage = buildShareWhatsAppMessage({
    clientName,
    url: shareUrl,
    passwordPlain: effectivePassword,
  })

  function onPhoneChange(raw: string) {
    setPhoneDisplay(formatBrazilPhoneInput(raw))
    setPhoneError(null)
  }

  function openWhatsApp() {
    const wa = brazilDisplayToWhatsAppDigits(phoneDisplay)
    if (!wa) {
      setPhoneError('Digite um celular válido com DDD (ex.: 11 98765-4321). Usamos o código +55 do Brasil.')
      return
    }
    const text = buildShareWhatsAppMessage({
      clientName,
      url: shareUrl,
      passwordPlain: effectivePassword,
    })
    const href = `https://wa.me/${wa}?text=${encodeURIComponent(text)}`
    window.open(href, '_blank', 'noopener,noreferrer')
    onClose()
  }

  const hasRegisteredPhone = Boolean(defaultPhone?.trim())

  return (
    <Modal open={open} onClose={onClose} title="Enviar pelo WhatsApp" size="md">
      <div className="space-y-5">
        <p className="text-sm text-zinc-400">
          {hasRegisteredPhone ? (
            <>
              A conversa será aberta com o número cadastrado do cliente:{' '}
              <span className="font-medium text-zinc-200">{storedPhoneToDisplay(defaultPhone)}</span>
              . Você pode ajustar abaixo se precisar.
            </>
          ) : (
            <>
              Este cliente não tem telefone cadastrado. Informe o celular com DDD no formato{' '}
              <span className="font-mono text-zinc-300">11 98765-4321</span> (usamos automaticamente o código{' '}
              <span className="font-mono text-zinc-300">+55</span>).
            </>
          )}
        </p>

        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Telefone</label>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="11 98765-4321"
            value={phoneDisplay}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
          />
          {phoneError ? <p className="mt-2 text-sm text-red-400">{phoneError}</p> : null}
        </div>

        {linkHasPassword && !initialPasswordForMessage?.trim() ? (
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Senha do link (para incluir na mensagem)
            </label>
            <input
              type="text"
              value={manualPassword}
              onChange={(e) => setManualPassword(e.target.value)}
              placeholder="Digite a senha se quiser enviá-la junto"
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-warm-600/50 focus:outline-none focus:ring-1 focus:ring-warm-600/30"
            />
            <p className="mt-1.5 text-[11px] text-zinc-600">
              Por segurança não armazenamos a senha em texto; para links antigos, informe aqui se desejar repetir na
              mensagem.
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Prévia da mensagem</p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs leading-relaxed text-zinc-300">
            {previewMessage}
          </pre>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </Modal>
  )
}
