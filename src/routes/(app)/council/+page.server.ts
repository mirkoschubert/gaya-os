import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { councilMemberships } = await parent()

  if (councilMemberships.length === 1) {
    redirect(302, `/council/${councilMemberships[0].councilId}`)
  }

  return {}
}
