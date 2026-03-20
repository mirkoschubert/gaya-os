import { error, json } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase()
  if (!q) return json([])

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: 'insensitive' },
      id: { not: locals.user.id }
    },
    select: {
      id: true,
      username: true,
      name: true,
      firstName: true,
      lastName: true,
      showRealName: true,
      avatarUrl: true,
      civicStatus: true
    },
    take: 6,
    orderBy: { username: 'asc' }
  })

  return json(
    users
      .filter((u) => u.username)
      .map((u) => ({
        id: u.id,
        username: u.username!,
        displayName:
          u.showRealName && (u.firstName || u.lastName)
            ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()
            : u.username!,
        avatarUrl: u.avatarUrl ?? null,
        isVisitor: u.civicStatus === 'VISITOR'
      }))
  )
}
