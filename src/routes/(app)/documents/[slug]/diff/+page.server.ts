import { error } from '@sveltejs/kit'
import { getDocumentBySlug, getDocumentVersion } from '$lib/server/services/documents'
import { isValidVersionLabel } from '$lib/domain/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, url }) => {
  const fromParam = url.searchParams.get('from')
  const toParam = url.searchParams.get('to')

  const document = await getDocumentBySlug(params.slug)
  if (!document) error(404, 'Document not found')

  const breadcrumbs = [
    { label: 'Documents', href: '/documents' },
    { label: document.title, href: `/documents/${params.slug}` },
    { label: 'Diff' }
  ]

  if (!fromParam || !toParam) {
    return { document, fromVersion: null, toVersion: null, breadcrumbs }
  }

  if (!isValidVersionLabel(fromParam) || !isValidVersionLabel(toParam)) {
    error(400, 'Invalid version labels')
  }

  const [fromVersion, toVersion] = await Promise.all([
    getDocumentVersion(params.slug, fromParam),
    getDocumentVersion(params.slug, toParam)
  ])

  if (!fromVersion) error(404, `Version ${fromParam} not found`)
  if (!toVersion) error(404, `Version ${toParam} not found`)

  return { document, fromVersion, toVersion, breadcrumbs }
}
