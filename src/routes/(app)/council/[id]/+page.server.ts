import { error } from '@sveltejs/kit'
import { getCouncilDetail } from '$lib/server/services/councils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  const { councilMemberships } = await parent()

  const isMember = councilMemberships.some((m) => m.councilId === params.id)
  if (!isMember && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  const council = await getCouncilDetail(params.id)
  if (!council) error(404, 'Council not found')

  return {
    council,
    breadcrumbs: [{ label: 'Council', href: '/council' }, { label: council.name }]
  }
}
