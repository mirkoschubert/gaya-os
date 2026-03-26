import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import type { PostEntry, PostEntityType } from '$lib/domain/posts'

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

function mapPostEntry(p: {
  id: string
  authorId: string
  entityType: string
  entityId: string
  body: string
  mediaUrls: unknown
  createdAt: Date
  updatedAt: Date
  author: {
    name: string
    username: string | null
    avatarUrl: string | null
  }
}): PostEntry {
  return {
    id: p.id,
    authorId: p.authorId,
    authorName: p.author.name,
    authorUsername: p.author.username ?? null,
    authorAvatarUrl: p.author.avatarUrl ?? null,
    entityType: p.entityType as PostEntityType,
    entityId: p.entityId,
    body: p.body,
    mediaUrls: Array.isArray(p.mediaUrls) ? (p.mediaUrls as string[]) : [],
    createdAt: p.createdAt,
    updatedAt: p.updatedAt
  }
}

const POST_INCLUDE = {
  author: { select: { name: true, username: true, avatarUrl: true } }
} as const

// ──────────────────────────────────────────────
// Public service functions
// ──────────────────────────────────────────────

/** Returns paginated posts for an entity, newest first. */
export async function listPosts(
  entityType: PostEntityType,
  entityId: string,
  cursor?: string
): Promise<{ posts: PostEntry[]; nextCursor: string | null }> {
  const PAGE_SIZE = 20
  const posts = await prisma.post.findMany({
    where: { entityType, entityId },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {})
  })

  const hasMore = posts.length > PAGE_SIZE
  const items = hasMore ? posts.slice(0, PAGE_SIZE) : posts
  return {
    posts: items.map(mapPostEntry),
    nextCursor: hasMore ? items[items.length - 1].id : null
  }
}

/** Creates a post and writes an audit log entry. */
export async function createPost(params: {
  authorId: string
  entityType: PostEntityType
  entityId: string
  body: string
  mediaUrls?: string[]
  entityName?: string
}): Promise<PostEntry> {
  const post = await prisma.post.create({
    data: {
      authorId: params.authorId,
      entityType: params.entityType,
      entityId: params.entityId,
      body: params.body,
      mediaUrls: params.mediaUrls ?? []
    },
    include: POST_INCLUDE
  })

  await logAction({
    userId: params.authorId,
    action: 'POST_CREATED',
    entityType: params.entityType,
    entityId: params.entityId,
    metadata: {
      entityType: params.entityType,
      entityName: params.entityName ?? params.entityId
    }
  })

  return mapPostEntry(post)
}

/** Deletes a post. Only the author, MODERATOR, or ADMIN may delete. */
export async function deletePost(postId: string, actorId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, entityType: true, entityId: true }
  })
  if (!post) return

  const actor = await prisma.user.findUnique({
    where: { id: actorId },
    select: { role: true }
  })

  const isAuthor = post.authorId === actorId
  const isPrivileged = actor?.role === 'ADMIN' || actor?.role === 'MODERATOR'
  if (!isAuthor && !isPrivileged) {
    throw new Error('Forbidden')
  }

  await prisma.post.delete({ where: { id: postId } })

  await logAction({
    userId: actorId,
    action: 'POST_DELETED',
    entityType: post.entityType,
    entityId: post.entityId
  })
}

/**
 * Checks whether a user is allowed to post to a given entity.
 * - CITY: user must be a CityMembership member AND COUNCIL_MEMBER in the city's unit
 * - COUNCIL: user must be COUNCIL_MEMBER in the council's unit
 * - USER: user must be the profile owner
 */
export async function canPostTo(
  userId: string,
  entityType: PostEntityType,
  entityId: string
): Promise<boolean> {
  if (!userId) return false

  if (entityType === 'USER') {
    return userId === entityId
  }

  if (entityType === 'CITY') {
    const city = await prisma.city.findUnique({
      where: { id: entityId },
      select: { unitId: true }
    })
    if (!city) return false

    const [membership, councilMembership] = await Promise.all([
      prisma.cityMembership.findUnique({ where: { cityId_userId: { cityId: entityId, userId } } }),
      prisma.membership.findUnique({
        where: { userId_unitId: { userId, unitId: city.unitId } }
      })
    ])
    return !!membership && councilMembership?.role === 'COUNCIL_MEMBER'
  }

  if (entityType === 'COUNCIL') {
    const council = await prisma.council.findUnique({
      where: { id: entityId },
      select: { unitId: true }
    })
    if (!council) return false

    const membership = await prisma.membership.findUnique({
      where: { userId_unitId: { userId, unitId: council.unitId } }
    })
    return membership?.role === 'COUNCIL_MEMBER'
  }

  return false
}
