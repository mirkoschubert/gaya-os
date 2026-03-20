import { error, redirect } from '@sveltejs/kit'
import { createSession } from '$lib/server/services/councils'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, parent }) => {
  const { councilMemberships } = await parent()

  const isMember = councilMemberships.some((m) => m.councilId === params.id)
  if (!isMember && locals.user!.role !== 'ADMIN') {
    error(403, 'Access denied')
  }

  const membership = councilMemberships.find((m) => m.councilId === params.id)

  return {
    councilId: params.id,
    councilName: membership?.councilName ?? 'Council',
    breadcrumbs: [
      { label: 'Council', href: '/council' },
      { label: membership?.councilName ?? 'Council', href: `/council/${params.id}` },
      { label: 'Sessions', href: `/council/${params.id}/sessions` },
      { label: 'New Session' }
    ]
  }
}

export const actions: Actions = {
  default: async ({ request, params, locals }) => {
    const form = await request.formData()
    const title = form.get('title')?.toString().trim()
    const description = form.get('description')?.toString().trim() || null
    const scheduledAt = form.get('scheduledAt')?.toString()
    const endsAt = form.get('endsAt')?.toString() || null
    const location = form.get('location')?.toString().trim() || null

    if (!title || !scheduledAt) {
      return { error: 'Title and date are required.' }
    }

    await createSession({
      councilId: params.id,
      title,
      description,
      scheduledAt: new Date(scheduledAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      location,
      createdById: locals.user!.id
    })

    redirect(302, `/council/${params.id}/sessions`)
  }
}
