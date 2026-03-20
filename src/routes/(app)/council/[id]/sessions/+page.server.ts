import { error } from '@sveltejs/kit'
import { listSessions } from '$lib/server/services/councils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  const { councilMemberships } = await parent()

  const isMember = councilMemberships.some((m) => m.councilId === params.id)
  if (!isMember && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  const sessions = await listSessions(params.id)
  const membership = councilMemberships.find((m) => m.councilId === params.id)

  return {
    sessions,
    councilId: params.id,
    councilName: membership?.councilName ?? 'Council',
    breadcrumbs: [
      { label: 'Council', href: '/council' },
      { label: membership?.councilName ?? 'Council', href: `/council/${params.id}` },
      { label: 'Sessions' }
    ]
  }
}
