import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import GalleryInfoCard from '@/components/cliente/GalleryInfoCard'
import PhotoMasonry from '@/components/cliente/PhotoMasonry'
import { SharePasswordForm } from '@/components/share/SharePasswordForm'
import SharePublicTopBar from '@/components/share/SharePublicTopBar'
import { getGalleryMediaFromFolderRef } from '@/lib/gallery-media'
import { isDriveConfigured } from '@/lib/google-drive'
import { isR2Configured } from '@/lib/r2'
import { getShareLinkForPublicView, isShareLinkExpired } from '@/lib/share-links'
import { verifyShareAccessCookie } from '@/lib/share-token'
import { SITE_NAME } from '@/lib/site-config'

type Props = { params: { slug: string } }

function clipDescription(text: string | null | undefined, max = 160): string {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  if (t.length <= max) return t || `Galeria de fotos — ${SITE_NAME}`
  return `${t.slice(0, max - 1).trim()}…`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug?.trim()
  if (!slug) return { robots: { index: false, follow: false } }

  const share = await getShareLinkForPublicView(slug)
  if (!share || isShareLinkExpired(share)) {
    return { title: 'Galeria', robots: { index: false, follow: false } }
  }

  const path = `/p/${slug}`
  const title = share.event.title
  const description = clipDescription(share.event.infoText)

  return {
    title,
    description,
    robots: { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title: `${title} — ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — ${SITE_NAME}`,
      description,
    },
  }
}

export default async function PublicSharePage({ params }: Props) {
  const slug = params.slug?.trim()
  if (!slug) notFound()

  const share = await getShareLinkForPublicView(slug)
  if (!share || isShareLinkExpired(share)) notFound()

  if (share.scope === 'FOLDER' && !share.folder) notFound()

  if (share.passwordHash) {
    const unlocked = await verifyShareAccessCookie(slug)
    if (!unlocked) {
      return <SharePasswordForm slug={slug} />
    }
  }

  const folders =
    share.scope === 'FOLDER' && share.folder
      ? [share.folder]
      : share.event.folders

  const foldersWithImages = await Promise.all(
    folders.map(async (folder: any) => ({
      folder,
      images: await getGalleryMediaFromFolderRef(folder.driveUrl, {
        kind: 'share-proxy',
        slug,
      }),
    }))
  )

  const hasGallerySource = isDriveConfigured() || isR2Configured()

  return (
    <>
      <SharePublicTopBar />
      <main className="min-h-screen pb-16 pt-2 md:px-4 bg-zinc-900" style={{ marginTop: '-40px', paddingTop: '50px' }}>
        <section className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-8 lg:px-6 xl:gap-10">
          <GalleryInfoCard
            title={share.event.title}
            infoText={share.event.infoText}
            eventId={share.event.id}
            showDriveHint={!hasGallerySource}
            shareSlug={slug}
          />

          <div className="min-w-0 space-y-14 lg:pt-2">
            {foldersWithImages.map(({ folder, images }: { folder: any, images: any }) => (
              <PhotoMasonry
                key={folder.id}
                images={images}
                folderTitle={folder.title}
                driveFolderUrl={folder.driveUrl}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
