import { listCitizens } from '$lib/server/services/citizens'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const citizens = await listCitizens()
  return {
    citizens,
    breadcrumbs: [{ label: 'Citizens' }]
  }
}
