import { error, json } from '@sveltejs/kit'
import { getOrCreateCityPublicChannel } from '$lib/server/services/messages'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')
  if (locals.user.civicStatus !== 'CITIZEN' && locals.user.role !== 'ADMIN') {
    error(403, 'Only citizens can access city channels')
  }

  const city = await prisma.city.findUnique({
    where: { id: params.cityId },
    select: { id: true }
  })
  if (!city) error(404, 'City not found')

  const channel = await getOrCreateCityPublicChannel(params.cityId)

  // Add the requesting user to the channel (or unhide if previously hidden)
  await prisma.channelMembership.upsert({
    where: { channelId_userId: { channelId: channel.id, userId: locals.user.id } },
    update: { hiddenAt: null },
    create: { channelId: channel.id, userId: locals.user.id }
  })

  return json({ channelId: channel.id })
}
