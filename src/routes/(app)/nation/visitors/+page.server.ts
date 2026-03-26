import { listVisitors } from '$lib/server/services/citizens'
import { prisma } from '$lib/server/prisma'
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async () => {
  const visitorListCap = await prisma.roleCapability.findUnique({
    where: { role_capability: { role: 'VISITOR', capability: 'can_list_in_nation' } },
    select: { allowed: true }
  })
  const visitorsListed = visitorListCap?.allowed ?? false

  if (!visitorsListed) redirect(302, '/nation')

  const visitors = await listVisitors()
  return {
    visitors,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: 'Visitors' }
    ]
  }
}
