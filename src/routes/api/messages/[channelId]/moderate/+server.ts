import { error, json } from '@sveltejs/kit'
import { getPermissionMatrix } from '$lib/server/services/roles'
import { assertChannelAccess, deleteMessage, pinMessage, muteUser, clearMessages } from '$lib/server/services/messages'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const matrix = await getPermissionMatrix()
  const canModerate =
    (matrix[locals.user.civicStatus]?.can_moderate_messages ?? false) ||
    (matrix[locals.user.role]?.can_moderate_messages ?? false)
  if (!canModerate) error(403, 'Forbidden')

  await assertChannelAccess(params.channelId, locals.user.id)

  const { command, messageId, username, minutes, count } = await request.json()

  switch (command) {
    case 'delete':
      if (!messageId) error(400, 'messageId required')
      await deleteMessage(messageId, locals.user.id)
      break

    case 'pin':
      if (!messageId) error(400, 'messageId required')
      await pinMessage(messageId, locals.user.id)
      break

    case 'mute': {
      if (!username) error(400, 'username required')
      const target = await prisma.user.findFirst({ where: { username } })
      if (!target) error(404, 'User not found')
      await muteUser(params.channelId, target.id, locals.user.id, minutes)
      break
    }

    case 'clear':
      if (!count || count < 1) error(400, 'count must be >= 1')
      await clearMessages(params.channelId, count, locals.user.id)
      break

    default:
      error(400, 'Unknown command')
  }

  return json({ ok: true })
}
