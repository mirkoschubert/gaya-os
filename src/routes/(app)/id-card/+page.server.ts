import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { applyForCitizenship } from '$lib/server/services/citizenship'

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/auth/login')
  return { user: locals.user }
}

export const actions: Actions = {
  apply: async ({ locals }) => {
    if (!locals.user) redirect(302, '/auth/login')

    try {
      await applyForCitizenship(locals.user.id)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { error: message })
    }

    redirect(302, '/id-card')
  }
}
