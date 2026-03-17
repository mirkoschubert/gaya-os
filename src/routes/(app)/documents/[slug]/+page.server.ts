import { error } from '@sveltejs/kit'
import { getDocumentBySlug } from '$lib/server/services/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const document = await getDocumentBySlug(params.slug)
  if (!document) error(404, 'Document not found')
  if (!document.activeContent) error(404, 'No active version for this document')
  return {
    document,
    breadcrumbs: [
      { label: 'Documents', href: '/documents' },
      { label: document.title }
    ]
  }
}
