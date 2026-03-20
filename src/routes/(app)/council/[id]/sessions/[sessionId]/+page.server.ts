import { error } from '@sveltejs/kit'
import { getSessionDetail } from '$lib/server/services/councils'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  const { councilMemberships } = await parent()

  const isMember = councilMemberships.some((m) => m.councilId === params.id)
  if (!isMember && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  const session = await getSessionDetail(params.sessionId)
  if (!session || session.councilId !== params.id) error(404, 'Session not found')

  const membership = councilMemberships.find((m) => m.councilId === params.id)

  return {
    session,
    councilId: params.id,
    breadcrumbs: [
      { label: 'Council', href: '/council' },
      { label: membership?.councilName ?? 'Council', href: `/council/${params.id}` },
      { label: 'Sessions', href: `/council/${params.id}/sessions` },
      { label: session.title }
    ]
  }
}
