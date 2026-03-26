import { error } from '@sveltejs/kit'
import { getCityBySlug } from '$lib/server/services/cities'
import { listActivity } from '$lib/server/services/audit'
import { listPosts, canPostTo } from '$lib/server/services/posts'
import { hasCapability } from '$lib/server/services/roles'
import { prisma } from '$lib/server/prisma'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const city = await getCityBySlug(params.slug)
  if (!city || !city.active) error(404, 'City not found')

  const userId = locals.user?.id ?? null

  const [activityPage, postsResult, isMember, cityChannel, canPost, canManage] = await Promise.all([
    listActivity({ entityType: 'CITY', entityId: city.id, pageSize: 20 }),
    listPosts('CITY', city.id),
    userId
      ? prisma.cityMembership
          .findUnique({ where: { cityId_userId: { cityId: city.id, userId } } })
          .then((m) => !!m)
      : Promise.resolve(false),
    prisma.channel.findFirst({ where: { cityId: city.id, type: 'CITY_PUBLIC' }, select: { id: true } }),
    userId ? canPostTo(userId, 'CITY', city.id) : Promise.resolve(false),
    locals.user ? hasCapability(locals.user, 'can_manage_cities') : Promise.resolve(false)
  ])

  return {
    city,
    activity: activityPage.entries,
    posts: postsResult.posts,
    isMember,
    cityChannelId: cityChannel?.id ?? null,
    canPost,
    canManage,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: 'Cities', href: '/nation/cities' },
      { label: city.name }
    ]
  }
}
