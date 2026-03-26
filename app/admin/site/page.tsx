import { requireUser } from '@/lib/auth'
import { isR2Configured } from '@/lib/r2'
import { getFullSiteEditorState } from '@/lib/site-content'
import { SiteContentEditor } from '@/components/admin/SiteContentEditor'

export default async function AdminSitePage() {
  await requireUser('ADMIN')
  const initial = await getFullSiteEditorState()

  return <SiteContentEditor initial={initial} r2Configured={isR2Configured()} />
}
