import { error, fail, redirect } from '@sveltejs/kit'
import { getCityById, updateCity, setCityCouncil, deleteCity } from '$lib/server/services/cities'
import { listAllCouncils } from '$lib/server/services/councils'
import { hasCapability } from '$lib/server/services/roles'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

  const [city, councils] = await Promise.all([getCityById(params.id), listAllCouncils()])
  if (!city) error(404, 'City not found')

  return {
    city,
    councils,
    breadcrumbs: [
      { label: 'Admin', href: '/admin' },
      { label: 'Cities', href: '/admin/cities' },
      { label: city.name }
    ]
  }
}

export const actions: Actions = {
  updateCity: async ({ params, locals, request }) => {
    if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

    const form = await request.formData()
    const name = (form.get('name') as string)?.trim()
    const slug = (form.get('slug') as string)?.trim()
    const description = (form.get('description') as string)?.trim() || null
    const banner = (form.get('banner') as string)?.trim() || null
    const foundedAtRaw = form.get('foundedAt') as string
    const active = form.get('active') === 'on'

    if (!name) return fail(400, { updateError: 'Name is required.' })
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return fail(400, { updateError: 'Slug must be lowercase letters, numbers, and hyphens only.' })
    }

    const foundedAt = foundedAtRaw ? new Date(foundedAtRaw) : new Date()

    try {
      await updateCity({ cityId: params.id, name, slug, description, banner, foundedAt, active, adminId: locals.user!.id })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { updateError: message })
    }

    return { updateSuccess: true }
  },

  setCouncil: async ({ params, locals, request }) => {
    if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

    const form = await request.formData()
    const councilId = (form.get('councilId') as string)?.trim() || null

    try {
      await setCityCouncil({ cityId: params.id, councilId: councilId || null, adminId: locals.user!.id })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { councilError: message })
    }

    return { councilSuccess: true }
  },

  deleteCity: async ({ params, locals }) => {
    if (!hasCapability(locals.user!, 'can_manage_cities')) error(403, 'Forbidden')

    try {
      await deleteCity({ cityId: params.id, adminId: locals.user!.id })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.'
      return fail(400, { deleteError: message })
    }

    redirect(303, '/admin/cities')
  }
}
