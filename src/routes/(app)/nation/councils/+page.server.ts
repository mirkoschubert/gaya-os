import { listPublicCouncilProfiles } from '$lib/server/services/councils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const councils = await listPublicCouncilProfiles()
  return {
    councils,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: 'Councils' }
    ]
  }
}
