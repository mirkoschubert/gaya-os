import { error, json } from '@sveltejs/kit'
import { listPosts, createPost, canPostTo } from '$lib/server/services/posts'
import type { PostEntityType } from '$lib/domain/posts'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const entityType = url.searchParams.get('entityType') as PostEntityType | null
  const entityId = url.searchParams.get('entityId')
  const cursor = url.searchParams.get('cursor') ?? undefined

  if (!entityType || !entityId) error(400, 'entityType and entityId are required')
  if (!['CITY', 'COUNCIL', 'USER'].includes(entityType)) error(400, 'Invalid entityType')

  const result = await listPosts(entityType, entityId, cursor)
  return json(result)
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) error(401, 'Unauthorized')

  const body = await request.json()
  const { entityType, entityId, postBody, mediaUrls, entityName } = body as {
    entityType: PostEntityType
    entityId: string
    postBody: string
    mediaUrls?: string[]
    entityName?: string
  }

  if (!entityType || !entityId || !postBody?.trim()) {
    error(400, 'entityType, entityId, and postBody are required')
  }
  if (!['CITY', 'COUNCIL', 'USER'].includes(entityType)) error(400, 'Invalid entityType')

  const allowed = await canPostTo(locals.user.id, entityType, entityId)
  if (!allowed) error(403, 'You are not allowed to post here')

  const post = await createPost({
    authorId: locals.user.id,
    entityType,
    entityId,
    body: postBody.trim(),
    mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [],
    entityName
  })

  return json(post, { status: 201 })
}
