import { error } from '@sveltejs/kit'
import { getCouncilMembershipsForUser } from '$lib/server/services/councils'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const memberships = await getCouncilMembershipsForUser(locals.user!.id)

  if (memberships.length === 0 && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  return { councilMemberships: memberships }
}
