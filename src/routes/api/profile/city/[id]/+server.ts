import { error, json } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import { hasCapability } from '$lib/server/services/roles'
import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')
  if (!(await hasCapability(locals.user, 'can_manage_cities'))) error(403, 'Forbidden')

  const city = await prisma.city.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!city) error(404, 'City not found')

  const body = await request.json()
  const description = typeof body.description === 'string'
    ? body.description.trim() || null
    : undefined

  if (description === undefined) error(400, 'No fields to update')

  await prisma.city.update({
    where: { id: params.id },
    data: { description }
  })

  return json({ ok: true })
}
