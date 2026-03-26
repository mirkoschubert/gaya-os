import { error } from '@sveltejs/kit'
import { getCouncilDetail } from '$lib/server/services/councils'
import { listPosts, canPostTo } from '$lib/server/services/posts'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, parent, locals }) => {
  await parent()

  const council = await getCouncilDetail(params.id)
  if (!council) error(404, 'Council not found')

  const userId = locals.user?.id ?? null

  const [postsResult, canPost] = await Promise.all([
    listPosts('COUNCIL', council.id),
    userId ? canPostTo(userId, 'COUNCIL', council.id) : Promise.resolve(false)
  ])

  return {
    council,
    posts: postsResult.posts,
    canPost,
    breadcrumbs: [
      { label: 'Nation', href: '/nation' },
      { label: 'Councils', href: '/nation/councils' },
      { label: council.name }
    ]
  }
}
