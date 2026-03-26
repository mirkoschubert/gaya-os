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

  const membership = councilMemberships.find((m) => m.councilId === params.id)

  return {
    council,
    breadcrumbs: [
      { label: 'Nation', href: '/nation/citizens' },
      { label: council.name }
    ],
    councilName: membership?.councilName ?? council.name
  }
}
