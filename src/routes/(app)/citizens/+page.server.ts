import { listCitizens } from '$lib/server/services/citizens'
import { listPublicCouncilProfiles } from '$lib/server/services/councils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const [citizens, councils] = await Promise.all([listCitizens(), listPublicCouncilProfiles()])
  return {
    citizens,
    councils,
    breadcrumbs: [{ label: 'Citizens' }]
  }
}
