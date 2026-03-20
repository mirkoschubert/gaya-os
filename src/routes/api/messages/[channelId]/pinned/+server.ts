import { error, json } from '@sveltejs/kit'
import { assertChannelAccess, getPinnedMessage } from '$lib/server/services/messages'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  await assertChannelAccess(params.channelId, locals.user.id)

  const pinned = await getPinnedMessage(params.channelId)
  return json(pinned)
}
