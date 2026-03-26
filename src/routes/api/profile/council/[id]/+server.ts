import { error, json } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  // Only council members of this council may update it
  const council = await prisma.council.findUnique({
    where: { id: params.id },
    select: { id: true, unitId: true }
  })
  if (!council) error(404, 'Council not found')

  const isMember = await prisma.membership.findFirst({
    where: { userId: locals.user.id, unitId: council.unitId, role: 'COUNCIL_MEMBER' }
  })
  if (!isMember) error(403, 'Forbidden')

  const body = await request.json()
  const scopeDescription = typeof body.scopeDescription === 'string'
    ? body.scopeDescription.trim() || null
    : undefined

  if (scopeDescription === undefined) error(400, 'No fields to update')

  await prisma.council.update({
    where: { id: params.id },
    data: { scopeDescription }
  })

  return json({ ok: true })
}
