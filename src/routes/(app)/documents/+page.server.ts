import { listDocuments } from '$lib/server/services/documents'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const documents = await listDocuments()
  return { documents }
}
