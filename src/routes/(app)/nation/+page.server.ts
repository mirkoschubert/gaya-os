import { listCitizens, listVisitors } from '$lib/server/services/citizens'
import { listPublicCouncilProfiles } from '$lib/server/services/councils'
import { listAllCities } from '$lib/server/services/cities'
import { prisma } from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const visitorListCap = await prisma.roleCapability.findUnique({
    where: { role_capability: { role: 'VISITOR', capability: 'can_list_in_nation' } },
    select: { allowed: true }
  })
  const visitorsListed = visitorListCap?.allowed ?? false

  const [citizens, visitors, councils, cities] = await Promise.all([
    listCitizens(),
    visitorsListed ? listVisitors() : Promise.resolve([]),
    listPublicCouncilProfiles(),
    listAllCities()
  ])
  return {
    citizens,
    visitors,
    visitorsListed,
    councils,
    cities,
    breadcrumbs: [{ label: 'Nation' }]
  }
}
