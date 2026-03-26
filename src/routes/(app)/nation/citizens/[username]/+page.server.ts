import { error } from '@sveltejs/kit'
import { getCitizenByUsername } from '$lib/server/services/citizens'
import { listActivity } from '$lib/server/services/audit'
import { listPosts } from '$lib/server/services/posts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals }) => {
  const citizen = await getCitizenByUsername(params.username)
  if (!citizen) error(404, 'Citizen not found')

  const isOwnProfile = locals.user?.id === citizen.id
  const canPost = isOwnProfile && locals.user?.civicStatus === 'CITIZEN'

  const [activityPage, postsResult] = await Promise.all([
    listActivity({ userId: citizen.id, pageSize: 20 }),
    listPosts('USER', citizen.id)
  ])

  return {
    citizen,
    activity: activityPage.entries,
    posts: postsResult.posts,
    canPost,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: citizen.civicStatus === 'VISITOR' ? 'Visitors' : 'Citizens', href: citizen.civicStatus === 'VISITOR' ? '/nation/visitors' : '/nation/citizens' },
      { label: `@${citizen.username}` }
    ]
  }
}
