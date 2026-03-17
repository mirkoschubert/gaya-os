import { redirect, fail, error } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { applyForCitizenship } from '$lib/server/services/citizenship'
import { hasCapability } from '$lib/server/services/roles'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/auth/login')
  return { user: locals.user }
}

export const actions: Actions = {
  apply: async ({ locals }) => {
    if (!locals.user) redirect(302, '/auth/login')
    if (!(await hasCapability(locals.user, 'can_apply_citizenship'))) error(403, 'Forbidden')

    try {
      await applyForCitizenship(locals.user.id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { error: message })
    }

    redirect(302, '/id-card')
  }
}
