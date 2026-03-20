import { error, json } from '@sveltejs/kit'
import { getPermissionMatrix } from '$lib/server/services/roles'
import { getOrCreateDMChannel } from '$lib/server/services/messages'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const matrix = await getPermissionMatrix()
  const canStartDM =
    (matrix[locals.user.civicStatus]?.can_start_dm ?? false) ||
    (matrix[locals.user.role]?.can_start_dm ?? false)
  if (!canStartDM) error(403, 'Forbidden')

  const { targetUserId } = await request.json()
  if (!targetUserId) error(400, 'targetUserId required')
  if (targetUserId === locals.user.id) error(400, 'Cannot DM yourself')

  // Verify target user exists
  const target = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } })
  if (!target) error(404, 'User not found')

  const result = await getOrCreateDMChannel(locals.user.id, targetUserId)
  return json(result)
}
