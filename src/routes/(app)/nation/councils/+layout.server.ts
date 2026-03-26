import { getCouncilMembershipsForUser } from '$lib/server/services/councils'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  const memberships = await getCouncilMembershipsForUser(locals.user!.id)
  return { councilMemberships: memberships }
}
