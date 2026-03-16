import { error } from '@sveltejs/kit'
import { getDocumentVersion } from '$lib/server/services/documents'
import { isValidVersionLabel } from '$lib/domain/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  if (!isValidVersionLabel(params.version)) error(400, 'Invalid version label')

  const version = await getDocumentVersion(params.slug, params.version)
  if (!version) error(404, 'Version not found')

  return { version }
}
