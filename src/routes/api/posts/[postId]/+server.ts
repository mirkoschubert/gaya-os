import { error, json } from '@sveltejs/kit'
import { deletePost } from '$lib/server/services/posts'
import type { RequestHandler } from './$types'

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  try {
    await deletePost(params.postId, locals.user.id)
  } catch (e) {
    if (e instanceof Error && e.message === 'Forbidden') {
      error(403, 'You are not allowed to delete this post')
    }
    throw e
  }

  return json({ ok: true })
}
