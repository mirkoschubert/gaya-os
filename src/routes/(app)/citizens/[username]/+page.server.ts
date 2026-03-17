import { error } from '@sveltejs/kit'
import { getCitizenByUsername } from '$lib/server/services/citizens'
import { listActivity } from '$lib/server/services/audit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params }) => {
  const citizen = await getCitizenByUsername(params.username)
  if (!citizen) error(404, 'Citizen not found')

  const activityPage = await listActivity({ userId: citizen.id, pageSize: 20 })

  return {
    citizen,
    activity: activityPage.entries,
    breadcrumbs: [
      { label: 'Citizens', href: '/citizens' },
      { label: `@${citizen.username}` }
    ]
  }
}
