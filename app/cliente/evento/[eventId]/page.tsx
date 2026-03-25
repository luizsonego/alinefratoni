import { notFound } from 'next/navigation'
import GalleryInfoCard from '@/components/cliente/GalleryInfoCard'
import GalleryTopBar from '@/components/cliente/GalleryTopBar'
import PhotoMasonry from '@/components/cliente/PhotoMasonry'
import { requireUser } from '@/lib/auth'
import { getGalleryMediaFromFolderRef } from '@/lib/gallery-media'
import { prisma } from '@/lib/prisma'
import { isDriveConfigured } from '@/lib/google-drive'
import { isR2Configured } from '@/lib/r2'

export default async function EventoPage({
  params,
}: {
  params: { eventId: string }
}) {
  const client = await requireUser('CLIENT')

  const event = await prisma.event.findFirst({
    where: {
      id: params.eventId,
      clientId: client.id,
    },
    include: {
      folders: true,
    },
  })

  if (!event) notFound()

  const foldersWithImages = await Promise.all(
    event.folders.map(async (folder: { id: string; title: string; driveUrl: string }) => ({
      folder,
      images: await getGalleryMediaFromFolderRef(folder.driveUrl, {
        kind: 'client-proxy',
        eventId: params.eventId,
      }),
    }))
  )

  const hasGallerySource = isDriveConfigured() || isR2Configured()

  return (
    <>
      <GalleryTopBar />
      <main className="min-h-screen pb-16 pt-2 md:px-4">
        <section className="mx-auto grid w-full max-w-[1600px] gap-6 px-4 lg:grid-cols-[minmax(280px,380px)_1fr] lg:gap-8 lg:px-6 xl:gap-10">
          <GalleryInfoCard
            title={event.title}
            infoText={event.infoText}
            eventId={event.id}
            showDriveHint={!hasGallerySource}
          />

          <div className="min-w-0 space-y-14 lg:pt-2">
            {foldersWithImages.map(({ folder, images }) => (
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
