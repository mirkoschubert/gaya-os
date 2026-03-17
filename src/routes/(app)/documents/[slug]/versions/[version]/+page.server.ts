import { error } from '@sveltejs/kit'
import { getDocumentBySlug, getDocumentVersion } from '$lib/server/services/documents'
import { isValidVersionLabel } from '$lib/domain/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  if (!isValidVersionLabel(params.version)) error(400, 'Invalid version label')

  const [document, version] = await Promise.all([
    getDocumentBySlug(params.slug),
    getDocumentVersion(params.slug, params.version)
  ])

  if (!document) error(404, 'Document not found')
  if (!version) error(404, 'Version not found')

  return {
    version,
    breadcrumbs: [
      { label: 'Documents', href: '/documents' },
      { label: document.title, href: `/documents/${params.slug}` },
      { label: `v${params.version}` }
    ]
  }
}
