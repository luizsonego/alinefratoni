'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react'
import type {
  AdminPortfolioCategoryRow,
  AdminPortfolioItemRow,
  FullSiteEditorState,
  TestimonialCard,
} from '@/lib/site-content'
import { MAX_PORTFOLIO_ITEMS } from '@/lib/site-constants'
import {
  appendUploadedPortfolioImagesAction,
  deletePortfolioImageAction,
  saveAboutSiteAction,
  saveContactSiteAction,
  saveHeroSiteAction,
  savePortfolioSiteAction,
  saveSocialFooterSiteAction,
  saveTestimonialsSiteAction,
} from '@/app/admin/site-content-actions'
import { Card } from '@/components/admin/ui/Card'

type TabId = 'hero' | 'portfolio' | 'testimonials' | 'contact' | 'about' | 'social'

const TABS: { id: TabId; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'testimonials', label: 'Depoimentos' },
  { id: 'contact', label: 'Contato' },
  { id: 'about', label: 'Sobre' },
  { id: 'social', label: 'Redes sociais' },
]

async function putToPresignedUrl(signedUrl: string, file: File, contentType: string) {
  let res: Response
  try {
    res = await fetch(signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': contentType },
    })
  } catch (e) {
    const details = e instanceof Error ? e.message : String(e)
    throw new Error(`Falha no PUT para o R2 (provável CORS/preflight). Detalhes: ${details}`)
  }
  if (!res.ok) {
    let details = ''
    try {
      details = (await res.text())?.slice(0, 300) ?? ''
    } catch {
      // ignore
    }
    throw new Error(`Upload falhou no PUT para o R2 (${res.status}). ${details}`.trim())
  }
}

/** Fotos do site pelo servidor — evita bloqueio de CORS no PUT direto para o R2. */
async function uploadSiteImageThroughApp(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/site/upload', {
    method: 'POST',
    body: fd,
    credentials: 'same-origin',
  })
  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    publicUrl?: string | null
    imageRef?: string
  }
  if (!res.ok) {
    throw new Error(data.error ?? `Upload falhou (${res.status}).`)
  }
  const url = (data.imageRef ?? data.publicUrl)?.trim()
  if (!url) {
    throw new Error('O servidor não devolveu o endereço da imagem após o upload.')
  }
  return url
}

/** Vídeos / casos que ainda usam URL assinada direto no R2 (pode exigir CORS no bucket). */
async function uploadBlobToR2Presigned(file: File, kind: 'image' | 'video'): Promise<string> {
  const contentType = file.type || (kind === 'video' ? 'video/mp4' : 'image/jpeg')
  const res = await fetch('/api/admin/site/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    signedUrl?: string
    publicUrl?: string
  }
  if (!res.ok) throw new Error(data.error ?? 'Falha ao preparar upload.')
  if (!data.signedUrl) throw new Error('Resposta inválida do servidor.')
  await putToPresignedUrl(data.signedUrl, file, contentType)
  const url = data.publicUrl?.trim()
  if (!url) {
    throw new Error(
      'Defina R2_PUBLIC_BASE_URL para obter o link público automaticamente após o upload.'
    )
  }
  return url
}

const BATCH_UPLOAD_WORKERS = 3

type StagedImage = { id: string; file: File; previewUrl: string }

const IMAGE_FILENAME = /\.(jpe?g|png|gif|webp|avif|heic|heif|bmp)$/i

function looksLikeImageFile(f: File) {
  return Boolean(f.type.startsWith('image/') || IMAGE_FILENAME.test(f.name))
}

function Flash({ error, ok }: { error: string | null; ok: string | null }) {
  return (
    <>
      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>
      )}
      {ok && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100">
          {ok}
        </p>
      )}
    </>
  )
}

export function SiteContentEditor({
  initial,
  r2Configured,
}: {
  initial: FullSiteEditorState
  r2Configured: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>('hero')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Hero
  const [heroTitle, setHeroTitle] = useState(initial.hero.title)
  const [heroSubtitle, setHeroSubtitle] = useState(initial.hero.subtitle)
  const [heroPosterUrl, setHeroPosterUrl] = useState(initial.hero.posterUrl)
  const [heroVideoUrl, setHeroVideoUrl] = useState(initial.hero.videoUrl)
  const [upPoster, setUpPoster] = useState(false)
  const [upVideo, setUpVideo] = useState(false)

  // Portfolio
  const [portfolioTitle, setPortfolioTitle] = useState(initial.portfolioSection.title)
  const [portfolioSubtitle, setPortfolioSubtitle] = useState(initial.portfolioSection.subtitle)
  const [pHeroTitle, setPHeroTitle] = useState(initial.portfolioPageHero.title)
  const [pHeroSubtitle, setPHeroSubtitle] = useState(initial.portfolioPageHero.subtitle)
  const [pHeroBg, setPHeroBg] = useState(initial.portfolioPageHero.backgroundImageUrl)
  const [pHeroChips, setPHeroChips] = useState<string[]>(initial.portfolioPageHero.chips)
  const [chipDraft, setChipDraft] = useState('')
  const [categories, setCategories] = useState<AdminPortfolioCategoryRow[]>(() =>
    initial.portfolioCategories.length
      ? [...initial.portfolioCategories]
      : [{ clientKey: crypto.randomUUID(), title: 'Geral', description: '' }]
  )
  const [pItems, setPItems] = useState<(AdminPortfolioItemRow & { rowKey: string })[]>(() =>
    initial.portfolioItemsAdmin.map((i) => ({ ...i, rowKey: i.key }))
  )

  const [stagedImages, setStagedImages] = useState<StagedImage[]>([])
  const [batchUploading, setBatchUploading] = useState(false)
  const [batchUploadProgress, setBatchUploadProgress] = useState({ done: 0, total: 0 })
  const [dropActive, setDropActive] = useState(false)

  // Testimonials
  const [tTitle, setTTitle] = useState(initial.testimonials.title)
  const [tSub, setTSub] = useState(initial.testimonials.subtitle)
  const [tItems, setTItems] = useState<TestimonialCard[]>(initial.testimonials.items)

  // Contact
  const [cHead, setCHead] = useState(initial.contact.heading)
  const [cBg, setCBg] = useState(initial.contact.bgImageUrl)
  const [cShootLines, setCShootLines] = useState(initial.contact.shootTypes.join('\n'))

  // About
  const [aTitle, setATitle] = useState(initial.about.title)
  const [aImg, setAImg] = useState(initial.about.imageUrl)
  const [aParas, setAParas] = useState(initial.about.paragraphs.join('\n\n'))

  // Social + footer
  const [ig, setIg] = useState(initial.social.instagram)
  const [fb, setFb] = useState(initial.social.facebook)
  const [yt, setYt] = useState(initial.social.youtube)
  const [fTag, setFTag] = useState(initial.footer.tagline)
  const [fAddr, setFAddr] = useState(initial.footer.addressLine)

  const posterInputId = useMemo(() => `p-${Math.random().toString(36).slice(2)}`, [])
  const videoInputId = useMemo(() => `v-${Math.random().toString(36).slice(2)}`, [])
  const portfolioBatchInputId = useMemo(() => `pf-batch-${Math.random().toString(36).slice(2)}`, [])

  function flashOk(msg: string) {
    setOk(msg)
    setError(null)
    router.refresh()
    setTimeout(() => setOk(null), 4000)
  }

  async function uploadR2(file: File, kind: 'image' | 'video', onUrl: (u: string) => void) {
    const url =
      kind === 'image' ? await uploadSiteImageThroughApp(file) : await uploadBlobToR2Presigned(file, kind)
    onUrl(url)
  }

  const clearStagedImages = useCallback(() => {
    setStagedImages((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.previewUrl))
      return []
    })
  }, [])

  const addFilesToStaging = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter(looksLikeImageFile)
      if (!incoming.length) {
        setError('Nenhuma imagem reconhecida (use JPG, PNG, WebP, HEIC etc.).')
        return
      }
      const room = MAX_PORTFOLIO_ITEMS - pItems.length - stagedImages.length
      if (room <= 0) {
        setError(`Limite de ${MAX_PORTFOLIO_ITEMS} imagens no portfólio.`)
        return
      }
      const take = incoming.slice(0, room)
      if (incoming.length > take.length) {
        setError(`Foram adicionadas ${take.length} de ${incoming.length} (limite do álbum).`)
      } else {
        setError(null)
      }
      setStagedImages((prev) => [
        ...prev,
        ...take.map((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ])
    },
    [pItems.length, stagedImages.length]
  )

  const removeStagedImage = useCallback((id: string) => {
    setStagedImages((prev) => {
      const s = prev.find((x) => x.id === id)
      if (s) URL.revokeObjectURL(s.previewUrl)
      return prev.filter((x) => x.id !== id)
    })
  }, [])

  const confirmStagedUpload = useCallback(async () => {
    if (stagedImages.length === 0) return
    setError(null)
    setOk(null)
    setBatchUploading(true)
    const files = stagedImages.map((s) => s.file)
    const n = files.length
    setBatchUploadProgress({ done: 0, total: n })
    const urls: string[] = []
    try {
      for (let i = 0; i < n; i += BATCH_UPLOAD_WORKERS) {
        const chunk = files.slice(i, i + BATCH_UPLOAD_WORKERS)
        const part = await Promise.all(chunk.map((f) => uploadSiteImageThroughApp(f)))
        urls.push(...part)
        setBatchUploadProgress({ done: urls.length, total: n })
      }

      const result = await appendUploadedPortfolioImagesAction({ imageUrls: urls })
      if (!result.ok) throw new Error(result.error)

      const newRows = result.items.map((item) => ({ ...item, rowKey: item.key }))
      setPItems((prev) => [...prev, ...newRows])
      clearStagedImages()
      setOk(
        `${urls.length} foto(s) enviadas e salvas. Ajuste título, subtítulo e destaque em cada card — depois use «Salvar portfólio» para categorias e textos da seção.`
      )
      router.refresh()
      setTimeout(() => setOk(null), 6000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no envio em lote.')
    } finally {
      setBatchUploading(false)
      setBatchUploadProgress({ done: 0, total: 0 })
    }
  }, [stagedImages, clearStagedImages, router])

  async function removePortfolioItem(item: AdminPortfolioItemRow & { rowKey: string }) {
    if (item.id && item.id !== 'new') {
      setBusy(true)
      const r = await deletePortfolioImageAction({ id: item.id })
      setBusy(false)
      if (!r.ok) {
        setError(r.error)
        return
      }
    }
    setPItems((prev) => prev.filter((i) => i.rowKey !== item.rowKey))
  }

  async function saveHero() {
    setBusy(true)
    setError(null)
    const r = await saveHeroSiteAction({
      heroTitle,
      heroSubtitle,
      heroPosterUrl,
      heroVideoUrl,
    })
    setBusy(false)
    if (r.ok) flashOk('Hero salvo.')
    else setError(r.error)
  }

  async function savePortfolio() {
    setBusy(true)
    setError(null)
    const r = await savePortfolioSiteAction({
      portfolioTitle,
      portfolioSubtitle,
      portfolioPageHeroTitle: pHeroTitle,
      portfolioPageHeroSubtitle: pHeroSubtitle,
      portfolioPageHeroBgUrl: pHeroBg,
      portfolioPageHeroChips: pHeroChips,
      categories: categories.map((c) => ({
        clientKey: c.clientKey,
        title: c.title.trim(),
        description: c.description.trim() || undefined,
      })),
      items: pItems.map((i) => ({
        imageUrl: i.imageUrl,
        altText: i.altText,
        caption: i.caption || undefined,
        description: i.description || undefined,
        showOnHome: i.showOnHome,
        categoryClientKey: i.categoryClientKey.trim() || undefined,
      })),
    })
    setBusy(false)
    if (r.ok) flashOk('Portfólio salvo.')
    else setError(r.error)
  }

  async function saveTestimonials() {
    setBusy(true)
    setError(null)
    const r = await saveTestimonialsSiteAction({
      testimonialsTitle: tTitle,
      testimonialsSubtitle: tSub,
      testimonials: tItems.map((x) => ({
        id: x.id,
        name: x.name,
        quote: x.quote,
        imageUrl: x.imageUrl,
      })),
    })
    setBusy(false)
    if (r.ok) flashOk('Depoimentos salvos.')
    else setError(r.error)
  }

  async function saveContact() {
    setBusy(true)
    setError(null)
    const types = cShootLines
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
    const r = await saveContactSiteAction({
      contactHeading: cHead,
      contactBgImageUrl: cBg,
      contactShootTypes: types,
    })
    setBusy(false)
    if (r.ok) flashOk('Contato salvo.')
    else setError(r.error)
  }

  async function saveAbout() {
    setBusy(true)
    setError(null)
    const paras = aParas
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const r = await saveAboutSiteAction({
      aboutTitle: aTitle,
      aboutImageUrl: aImg,
      aboutParagraphs: paras.length ? paras : [''],
    })
    setBusy(false)
    if (r.ok) flashOk('Sobre salvo.')
    else setError(r.error)
  }

  async function saveSocialFooter() {
    setBusy(true)
    setError(null)
    const r = await saveSocialFooterSiteAction({
      socialInstagram: ig,
      socialFacebook: fb,
      socialYoutube: yt,
      footerTagline: fTag,
      footerAddressLine: fAddr,
    })
    setBusy(false)
    if (r.ok) flashOk('Redes e rodapé salvos.')
    else setError(r.error)
  }

  function addCategory() {
    setCategories((c) => [...c, { clientKey: crypto.randomUUID(), title: 'Nova categoria', description: '' }])
  }

  function removeCategory(key: string) {
    setCategories((c) => c.filter((x) => x.clientKey !== key))
    setPItems((items) =>
      items.map((i) => (i.categoryClientKey === key ? { ...i, categoryClientKey: '' } : i))
    )
  }

  function addPortfolioItem() {
    if (pItems.length >= MAX_PORTFOLIO_ITEMS) return
    setPItems((items) => [
      ...items,
      {
        id: 'new',
        key: crypto.randomUUID(),
        rowKey: crypto.randomUUID(),
        imageUrl: '',
        altText: '',
        caption: '',
        description: '',
        showOnHome: false,
        categoryClientKey: categories[0]?.clientKey ?? '',
      },
    ])
  }

  function movePItem(rowKey: string, dir: -1 | 1) {
    setPItems((prev) => {
      const idx = prev.findIndex((i) => i.rowKey === rowKey)
      const n = idx + dir
      if (idx < 0 || n < 0 || n >= prev.length) return prev
      const copy = [...prev]
      const [x] = copy.splice(idx, 1)
      copy.splice(n, 0, x)
      return copy
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {!r2Configured && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          R2 não configurado: use URLs manuais (ImageKit, etc.) ou configure o bucket para upload direto.
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id)
              setError(null)
              setOk(null)
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Flash error={error} ok={ok} />

      {tab === 'hero' && (
        <Card padding="lg" className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-zinc-100">Hero (home)</h2>
          <input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            placeholder="Título"
          />
          <input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            placeholder="Subtítulo"
          />
          <input
            value={heroPosterUrl}
            onChange={(e) => setHeroPosterUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            placeholder="URL poster"
          />
          <div className="flex flex-wrap gap-2">
            <input
              id={posterInputId}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={!r2Configured || upPoster}
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                if (!f) return
                setUpPoster(true)
                void uploadR2(f, 'image', setHeroPosterUrl).catch((err) => setError(String(err.message)))
                  .finally(() => setUpPoster(false))
              }}
            />
            <label
              htmlFor={posterInputId}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-xs ${!r2Configured ? 'opacity-50' : ''}`}
            >
              {upPoster ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Poster → R2
            </label>
          </div>
          <input
            value={heroVideoUrl}
            onChange={(e) => setHeroVideoUrl(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            placeholder="URL vídeo"
          />
          <input
            id={videoInputId}
            type="file"
            accept="video/*"
            className="hidden"
            disabled={!r2Configured || upVideo}
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (!f) return
              setUpVideo(true)
              void uploadR2(f, 'video', setHeroVideoUrl).catch((err) => setError(String(err.message)))
                .finally(() => setUpVideo(false))
            }}
          />
          <label
            htmlFor={videoInputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-600 px-3 py-2 text-xs ${!r2Configured ? 'opacity-50' : ''}`}
          >
            {upVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Vídeo → R2
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveHero()}
            className="rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Salvar hero
          </button>
        </Card>
      )}

      {tab === 'portfolio' && (
        <div className="space-y-6">
          <Card padding="lg" className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-zinc-100">Seção na home (títulos)</h2>
            <input
              value={portfolioTitle}
              onChange={(e) => setPortfolioTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Título"
            />
            <textarea
              value={portfolioSubtitle}
              onChange={(e) => setPortfolioSubtitle(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="Subtítulo"
            />
          </Card>

          <Card padding="lg" className="space-y-3">
            <h2 className="font-serif text-lg font-semibold text-zinc-100">Topo da página /portfolio</h2>
            <input
              value={pHeroTitle}
              onChange={(e) => setPHeroTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <textarea
              value={pHeroSubtitle}
              onChange={(e) => setPHeroSubtitle(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
            <input
              value={pHeroBg}
              onChange={(e) => setPHeroBg(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
              placeholder="URL imagem de fundo"
            />
            <div className="flex flex-wrap gap-2">
              {pHeroChips.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200"
                >
                  {c}
                  <button
                    type="button"
                    className="text-zinc-500 hover:text-white"
                    onClick={() => setPHeroChips((x) => x.filter((y) => y !== c))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={chipDraft}
                onChange={(e) => setChipDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const v = chipDraft.trim()
                    if (v) {
                      setPHeroChips((x) => [...x, v])
                      setChipDraft('')
                    }
                  }
                }}
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="Chip + Enter"
              />
            </div>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-serif text-lg font-semibold text-zinc-100">Categorias</h2>
              <button
                type="button"
                onClick={addCategory}
                className="text-xs font-medium text-warm-400 hover:text-warm-300"
              >
                + Categoria
              </button>
            </div>
            <ul className="space-y-3">
              {categories.map((c) => (
                <li key={c.clientKey} className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={c.title}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((x) => (x.clientKey === c.clientKey ? { ...x, title: e.target.value } : x))
                        )
                      }
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                      placeholder="Nome da categoria"
                    />
                    <button
                      type="button"
                      onClick={() => removeCategory(c.clientKey)}
                      className="shrink-0 rounded-lg border border-red-900/50 p-2 text-red-300"
                      aria-label="Remover categoria"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={c.description}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((x) =>
                          x.clientKey === c.clientKey ? { ...x, description: e.target.value } : x
                        )
                      )
                    }
                    rows={2}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-300"
                    placeholder="Descrição opcional (aparece ao filtrar por esta categoria em /portfolio)"
                  />
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="lg" className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg font-semibold text-zinc-100">
                  Galeria · {pItems.length}/{MAX_PORTFOLIO_ITEMS}
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-zinc-500">
                  Arraste ou escolha arquivos: o servidor envia ao R2 e grava o endereço no banco ao confirmar. Sem CDN,
                  as fotos abrem por <span className="font-mono text-zinc-400">/api/site/asset</span> no seu domínio;
                  com <span className="font-mono text-zinc-400">R2_PUBLIC_BASE_URL</span> o link aponta direto para o
                  bucket. Edite <span className="text-zinc-300">título</span> e <span className="text-zinc-300">subtítulo</span>{' '}
                  nos cards. Limite: <span className="font-mono text-zinc-400">PORTFOLIO_MAX_ITEMS</span> (padrão 100).
                </p>
              </div>
              <div className="shrink-0 text-right">
                <button
                  type="button"
                  onClick={addPortfolioItem}
                  disabled={pItems.length >= MAX_PORTFOLIO_ITEMS}
                  className="rounded-lg border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                >
                  + Foto já hospedada (link)
                </button>
                <p className="mt-1.5 max-w-[14rem] text-[10px] leading-snug text-zinc-500">
                  Cria um card para colar a URL de uma imagem que já está na internet (ex.: ImageKit), sem enviar pelo R2.
                </p>
              </div>
            </div>

            <div
              role="presentation"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (r2Configured && !batchUploading && pItems.length < MAX_PORTFOLIO_ITEMS) setDropActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDropActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDropActive(false)
                if (!r2Configured || batchUploading || pItems.length >= MAX_PORTFOLIO_ITEMS) return
                addFilesToStaging(e.dataTransfer.files)
              }}
              className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition sm:px-8 sm:py-10 ${
                dropActive && r2Configured ? 'border-warm-500 bg-warm-500/10' : 'border-zinc-600 bg-zinc-950/50'
              } ${!r2Configured || batchUploading ? 'pointer-events-none opacity-45' : ''}`}
            >
              <ImagePlus className="mx-auto h-10 w-10 text-zinc-500" aria-hidden />
              <p className="mt-3 text-sm font-medium text-zinc-200">Arraste fotos até aqui</p>
              <p className="mt-1 text-xs text-zinc-500">
                JPG, PNG, WebP · envio pelo servidor (sem PUT direto do navegador no bucket)
              </p>
              <label
                htmlFor={portfolioBatchInputId}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-warm-500"
              >
                <Upload className="h-4 w-4" />
                Escolher imagens
              </label>
              <input
                id={portfolioBatchInputId}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={!r2Configured || batchUploading || pItems.length >= MAX_PORTFOLIO_ITEMS}
                onChange={(e) => {
                  const list = e.target.files
                  e.target.value = ''
                  if (list?.length) addFilesToStaging(list)
                }}
              />
              {!r2Configured && (
                <p className="mt-4 text-xs text-amber-200/90">
                  Configure R2 (endpoint, chaves e bucket no .env) para usar arrastar e soltar. A URL pública do bucket é
                  opcional: sem ela, as imagens são servidas pelo próprio site.
                </p>
              )}
            </div>

            {stagedImages.length > 0 && (
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/40 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-zinc-200">
                    Fila para envio: {stagedImages.length} foto(s)
                  </p>
                  <button
                    type="button"
                    onClick={clearStagedImages}
                    disabled={batchUploading}
                    className="text-xs text-zinc-500 hover:text-zinc-300 disabled:opacity-40"
                  >
                    Limpar fila
                  </button>
                </div>
                <div className="flex max-h-40 flex-wrap gap-3 overflow-y-auto">
                  {stagedImages.map((s) => (
                    <div
                      key={s.id}
                      className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-zinc-700 bg-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.previewUrl} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeStagedImage(s.id)}
                        disabled={batchUploading}
                        className="absolute inset-0 flex items-center justify-center bg-black/65 text-[11px] font-medium text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-0"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={batchUploading || !r2Configured}
                  onClick={() => void confirmStagedUpload()}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"
                >
                  {batchUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando e gravando…
                    </>
                  ) : (
                    <>Confirmar envio · {stagedImages.length} foto(s)</>
                  )}
                </button>
              </div>
            )}

            {batchUploading && batchUploadProgress.total > 0 && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Upload para o CDN…</span>
                  <span>
                    {batchUploadProgress.done}/{batchUploadProgress.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-warm-500 transition-all duration-300"
                    style={{
                      width: `${Math.max(5, (batchUploadProgress.done / batchUploadProgress.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="max-h-[min(72vh,900px)] space-y-3 overflow-y-auto pr-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Detalhes de cada foto (miniatura + título e subtítulo)
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                {pItems.map((item, idx) => {
                  const showMeta = item.imageUrl.trim().length > 0
                  return (
                    <div
                      key={item.rowKey}
                      className={`rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 sm:flex sm:gap-4 ${
                        item.showOnHome ? 'ring-1 ring-warm-500/35' : ''
                      }`}
                    >
                      <div className="relative mx-auto mb-3 h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 sm:mb-0">
                        {showMeta ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center px-2 text-center text-[10px] leading-tight text-zinc-600">
                            Sem prévia
                          </div>
                        )}
                        {item.showOnHome ? (
                          <span className="absolute left-1 top-1 rounded bg-warm-600 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
                            Home
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-zinc-500">#{idx + 1}</span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
                              onClick={() => movePItem(item.rowKey, -1)}
                              disabled={idx === 0}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="rounded border border-zinc-700 px-2 py-0.5 text-[11px] text-zinc-300 hover:bg-zinc-800 disabled:opacity-30"
                              onClick={() => movePItem(item.rowKey, 1)}
                              disabled={idx === pItems.length - 1}
                            >
                              ↓
                            </button>
                            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-zinc-300">
                              <input
                                type="checkbox"
                                checked={item.showOnHome}
                                onChange={(e) =>
                                  setPItems((prev) =>
                                    prev.map((i) =>
                                      i.rowKey === item.rowKey ? { ...i, showOnHome: e.target.checked } : i
                                    )
                                  )
                                }
                              />
                              Destaque home
                            </label>
                            <button
                              type="button"
                              onClick={() => void removePortfolioItem(item)}
                              disabled={busy}
                              className="rounded p-1 text-red-400 hover:bg-red-950/50 disabled:opacity-40"
                              aria-label="Remover foto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          URL da imagem
                          <input
                            value={item.imageUrl}
                            onChange={(e) =>
                              setPItems((prev) =>
                                prev.map((i) =>
                                  i.rowKey === item.rowKey ? { ...i, imageUrl: e.target.value } : i
                                )
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-100"
                            placeholder="https://…"
                          />
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`img-replace-${item.rowKey}`}
                            disabled={!r2Configured}
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              e.target.value = ''
                              if (!f) return
                              void uploadR2(f, 'image', (u) =>
                                setPItems((prev) =>
                                  prev.map((i) => (i.rowKey === item.rowKey ? { ...i, imageUrl: u } : i))
                                )
                              ).catch((err) => setError(String(err.message)))
                            }}
                          />
                          <label
                            htmlFor={`img-replace-${item.rowKey}`}
                            className={`cursor-pointer text-[11px] text-warm-400 hover:text-warm-300 ${!r2Configured ? 'pointer-events-none opacity-40' : ''}`}
                          >
                            Substituir arquivo (R2)
                          </label>
                        </div>

                        {showMeta ? (
                          <>
                            <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              Título (legenda no card)
                              <input
                                value={item.caption}
                                onChange={(e) =>
                                  setPItems((prev) =>
                                    prev.map((i) =>
                                      i.rowKey === item.rowKey ? { ...i, caption: e.target.value } : i
                                    )
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                              />
                            </label>
                            <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              Subtítulo (descrição · portfólio / lightbox)
                              <textarea
                                value={item.description}
                                onChange={(e) =>
                                  setPItems((prev) =>
                                    prev.map((i) =>
                                      i.rowKey === item.rowKey ? { ...i, description: e.target.value } : i
                                    )
                                  )
                                }
                                rows={2}
                                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
                              />
                            </label>
                            <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                              Texto alternativo
                              <input
                                value={item.altText}
                                onChange={(e) =>
                                  setPItems((prev) =>
                                    prev.map((i) =>
                                      i.rowKey === item.rowKey ? { ...i, altText: e.target.value } : i
                                    )
                                  )
                                }
                                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-200"
                              />
                            </label>
                          </>
                        ) : (
                          <p className="text-[11px] text-zinc-500">
                            Preencha a URL (ou envie por lote) para liberar título e subtítulo neste card.
                          </p>
                        )}

                        <label className="block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                          Categoria
                          <select
                            value={item.categoryClientKey}
                            onChange={(e) =>
                              setPItems((prev) =>
                                prev.map((i) =>
                                  i.rowKey === item.rowKey
                                    ? { ...i, categoryClientKey: e.target.value }
                                    : i
                                )
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                          >
                            <option value="">Sem categoria</option>
                            {categories.map((c) => (
                              <option key={c.clientKey} value={c.clientKey}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() => void savePortfolio()}
              className="rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Salvar portfólio (categorias, textos da seção e detalhes das fotos)
            </button>
          </Card>
        </div>
      )}

      {tab === 'testimonials' && (
        <Card padding="lg" className="space-y-4">
          <input
            value={tTitle}
            onChange={(e) => setTTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <input
            value={tSub}
            onChange={(e) => setTSub(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          {tItems.map((t, i) => (
            <div key={t.id} className="rounded-lg border border-zinc-800 p-3 space-y-2">
              <input
                value={t.name}
                onChange={(e) =>
                  setTItems((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
                placeholder="Nome"
              />
              <textarea
                value={t.quote}
                onChange={(e) =>
                  setTItems((prev) => prev.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)))
                }
                rows={3}
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
              />
              <input
                value={t.imageUrl}
                onChange={(e) =>
                  setTItems((prev) => prev.map((x, j) => (j === i ? { ...x, imageUrl: e.target.value } : x)))
                }
                className="w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm"
                placeholder="URL foto"
              />
              <button
                type="button"
                className="text-xs text-red-400"
                onClick={() => setTItems((prev) => prev.filter((_, j) => j !== i))}
              >
                Remover
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-sm text-warm-400"
            onClick={() =>
              setTItems((p) => [...p, { id: crypto.randomUUID(), name: '', quote: '', imageUrl: '' }])
            }
          >
            + Depoimento
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveTestimonials()}
            className="block rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Salvar depoimentos
          </button>
        </Card>
      )}

      {tab === 'contact' && (
        <Card padding="lg" className="space-y-4">
          <p className="text-xs text-zinc-500">
            Título e tipos de ensaio alimentam o rodapé da home (formulário). A imagem de fundo pode ser usada em
            outras versões da página.
          </p>
          <textarea
            value={cHead}
            onChange={(e) => setCHead(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Título / chamada"
          />
          <input
            value={cBg}
            onChange={(e) => setCBg(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="URL imagem de fundo (referência)"
          />
          <label className="block text-xs text-zinc-500">
            Tipos de ensaio (um por linha)
            <textarea
              value={cShootLines}
              onChange={(e) => setCShootLines(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveContact()}
            className="rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Salvar contato
          </button>
        </Card>
      )}

      {tab === 'about' && (
        <Card padding="lg" className="space-y-4">
          <input
            value={aTitle}
            onChange={(e) => setATitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          />
          <input
            value={aImg}
            onChange={(e) => setAImg(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="URL imagem"
          />
          <label className="text-xs text-zinc-500">
            Parágrafos (separe com linha em branco)
            <textarea
              value={aParas}
              onChange={(e) => setAParas(e.target.value)}
              rows={8}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveAbout()}
            className="rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Salvar sobre
          </button>
        </Card>
      )}

      {tab === 'social' && (
        <Card padding="lg" className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-zinc-100">Redes sociais e rodapé</h2>
          <p className="text-xs text-zinc-500">
            Links exibidos no rodapé. Tagline e endereço alimentam a coluna institucional.
          </p>
          <input
            value={ig}
            onChange={(e) => setIg(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Instagram URL"
          />
          <input
            value={fb}
            onChange={(e) => setFb(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Facebook URL (opcional)"
          />
          <input
            value={yt}
            onChange={(e) => setYt(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="YouTube URL (opcional)"
          />
          <textarea
            value={fTag}
            onChange={(e) => setFTag(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Tagline rodapé"
          />
          <textarea
            value={fAddr}
            onChange={(e) => setFAddr(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            placeholder="Endereço (use Enter para quebra)"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void saveSocialFooter()}
            className="rounded-xl bg-warm-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Salvar redes e rodapé
          </button>
        </Card>
      )}
    </div>
  )
}
