import { error, json } from '@sveltejs/kit'
import { getOrCreatePublicCouncilChannel } from '$lib/server/services/messages'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const council = await prisma.council.findUnique({
    where: { id: params.councilId },
    select: { id: true }
  })
  if (!council) error(404, 'Council not found')

  const channel = await getOrCreatePublicCouncilChannel(params.councilId)

  // Add the requesting user to the channel (or unhide if previously closed)
  await prisma.channelMembership.upsert({
    where: { channelId_userId: { channelId: channel.id, userId: locals.user.id } },
    update: { hiddenAt: null },
    create: { channelId: channel.id, userId: locals.user.id }
  })

  return json({ channelId: channel.id })
}
