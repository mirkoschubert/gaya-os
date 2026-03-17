import { error } from '@sveltejs/kit'
import { getDocumentBySlug, listDocumentVersions } from '$lib/server/services/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const document = await getDocumentBySlug(params.slug)
  if (!document) error(404, 'Document not found')

  const versions = await listDocumentVersions(document.id)
  return {
    document,
    versions,
    breadcrumbs: [
      { label: 'Documents', href: '/documents' },
      { label: document.title, href: `/documents/${params.slug}` },
      { label: 'History' }
    ]
  }
}
