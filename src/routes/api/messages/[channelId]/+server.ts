import { error, json } from '@sveltejs/kit'
import { assertChannelAccess, listMessages, sendMessage, markChannelRead, hideChannel } from '$lib/server/services/messages'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  await assertChannelAccess(params.channelId, locals.user.id)

  const messages = await listMessages(params.channelId)
  return json(messages)
}

export const POST: RequestHandler = async ({ params, locals, request }) => {
  if (!locals.user) error(401, 'Unauthorized')

  await assertChannelAccess(params.channelId, locals.user.id)

  const { body } = await request.json()
  if (!body?.trim()) error(400, 'Message body is required')

  const message = await sendMessage(params.channelId, locals.user.id, body.trim())
  return json(message)
}

export const PATCH: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  await assertChannelAccess(params.channelId, locals.user.id)
  await markChannelRead(params.channelId, locals.user.id)

  return json({ ok: true })
}

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  // Verify channel is closeable (only DM and COUNCIL_PUBLIC)
  const { prisma } = await import('$lib/server/prisma')
  const channel = await prisma.channel.findUnique({
    where: { id: params.channelId },
    select: { type: true }
  })
  if (!channel) error(404, 'Channel not found')
  if (channel.type === 'COUNCIL_INTERNAL' || channel.type === 'CITIZEN_GENERAL') {
    error(403, 'This channel cannot be closed')
  }

  await hideChannel(params.channelId, locals.user.id)
  return json({ ok: true })
}
