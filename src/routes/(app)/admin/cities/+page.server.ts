import { error, fail } from '@sveltejs/kit'
import { listAllCities, createCity } from '$lib/server/services/cities'
import { listAllCouncils } from '$lib/server/services/councils'
import { hasCapability } from '$lib/server/services/roles'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

  const [cities, councils] = await Promise.all([listAllCities(), listAllCouncils()])
  return { cities, councils }
}

export const actions: Actions = {
  createCity: async ({ locals, request }) => {
    if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

    const form = await request.formData()
    const name = (form.get('name') as string)?.trim()
    const slug = (form.get('slug') as string)?.trim()
    const description = (form.get('description') as string)?.trim() || null
    const active = form.get('active') === 'on'

    if (!name) return fail(400, { error: 'Name is required.' })
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return fail(400, { error: 'Slug must be lowercase letters, numbers, and hyphens only.' })
    }

    try {
      await createCity({
        name,
        slug,
        description,
        banner: null,
        foundedAt: new Date(),
        active,
        adminId: locals.user!.id
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { error: message })
    }

    return { success: true }
  }
}
