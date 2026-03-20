import { error } from '@sveltejs/kit'
import { prisma } from '$lib/server/prisma'
import { getAllSettings } from '$lib/server/services/settings'
import { DATABASE_URL } from '$env/static/private'
import pg from 'pg'
import type { MessageEntry, UserChannelEntry } from '$lib/domain/chat'

const CHANNEL_NOTIFY = 'new_message'

function resolveAuthorName(author: {
  name: string
  username: string | null
  firstName: string | null
  lastName: string | null
  showRealName: boolean
}): string {
  if (author.showRealName && (author.firstName || author.lastName)) {
    return `${author.firstName ?? ''} ${author.lastName ?? ''}`.trim()
  }
  return author.username ? `@${author.username}` : author.name
}

function toMessageEntry(raw: {
  id: string
  channelId: string
  authorId: string
  body: string
  editedAt: Date | null
  deletedAt: Date | null
  pinned: boolean
  createdAt: Date
  internalVoteId: string | null
  author: {
    name: string
    username: string | null
    firstName: string | null
    lastName: string | null
    showRealName: boolean
    avatarUrl: string | null
    civicStatus: string
  }
}): MessageEntry {
  return {
    id: raw.id,
    channelId: raw.channelId,
    authorId: raw.authorId,
    authorName: resolveAuthorName(raw.author),
    authorUsername: raw.author.username,
    authorAvatarUrl: raw.author.avatarUrl ?? null,
    authorIsVisitor: raw.author.civicStatus === 'VISITOR',
    body: raw.body,
    editedAt: raw.editedAt,
    deletedAt: raw.deletedAt,
    pinned: raw.pinned,
    createdAt: raw.createdAt,
    reactions: [],
    internalVoteId: raw.internalVoteId
  }
}

// ─── Channel access ───────────────────────────────────────────────────────────

export async function assertChannelAccess(channelId: string, userId: string): Promise<void> {
  const [channel, user, settings] = await Promise.all([
    prisma.channel.findUnique({ where: { id: channelId }, select: { type: true, councilId: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { civicStatus: true, role: true } }),
    getAllSettings()
  ])
  if (!channel) error(404, 'Channel not found')
  if (!user) error(401, 'Unauthorized')

  const isVisitor = user.civicStatus === 'VISITOR' && user.role === 'USER'

  // Visitors: access depends on chat.visitorChannels setting
  if (isVisitor) {
    const visitorChannels = settings.chat.visitorChannels
    if (visitorChannels === 'none') error(403, 'Chat is not available for visitors')
    // readonly/readwrite: visitors can only access CITIZEN_GENERAL, not DMs or council channels
    if (channel.type !== 'CITIZEN_GENERAL') error(403, 'Visitors can only access the general channel')
    return
  }

  if (channel.type === 'DIRECT_MESSAGE' || channel.type === 'COUNCIL_PUBLIC') {
    const membership = await prisma.channelMembership.findUnique({
      where: { channelId_userId: { channelId, userId } }
    })
    if (!membership) error(403, 'Access denied')
    return
  }

  if (channel.type === 'CITIZEN_GENERAL') {
    // Any authenticated user can access the citizen general channel
    return
  }

  if (channel.type === 'COUNCIL_INTERNAL' && channel.councilId) {
    const council = await prisma.council.findUnique({
      where: { id: channel.councilId },
      select: { unitId: true }
    })
    if (!council) error(404, 'Council not found')

    const membership = await prisma.membership.findUnique({
      where: { userId_unitId: { userId, unitId: council.unitId } }
    })
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })

    if (membership?.role !== 'COUNCIL_MEMBER' && user?.role !== 'ADMIN') {
      error(403, 'Access denied')
    }
    return
  }

  error(403, 'Access denied')
}

// ─── User channels ────────────────────────────────────────────────────────────

export async function getUserChannels(userId: string): Promise<UserChannelEntry[]> {
  // Get all non-hidden channel memberships for this user
  const myMemberships = await prisma.channelMembership.findMany({
    where: { userId, hiddenAt: null },
    include: {
      channel: {
        select: { id: true, type: true, councilId: true, name: true }
      }
    }
  })

  const entries: UserChannelEntry[] = []

  // Step 1: CITIZEN_GENERAL channel - always included for all users
  const citizenChannel = await getOrCreateCitizenChannel()
  const citizenMembership = myMemberships.find((m) => m.channelId === citizenChannel.id)
  const citizenLastReadAt = citizenMembership?.lastReadAt ?? citizenMembership?.joinedAt ?? null
  const citizenUnread = citizenLastReadAt
    ? await prisma.message.count({
        where: { channelId: citizenChannel.id, createdAt: { gt: citizenLastReadAt }, deletedAt: null }
      })
    : 0
  entries.push({
    channelId: citizenChannel.id,
    channelName: 'Citizens',
    type: 'CITIZEN_GENERAL',
    councilId: null,
    otherUserId: null,
    otherUserAvatarUrl: null,
    unreadCount: citizenUnread,
    closeable: false
  })

  // Step 2: COUNCIL_INTERNAL channels — for council members, always included
  const councilMemberships = await prisma.membership.findMany({
    where: { userId, role: 'COUNCIL_MEMBER' },
    include: {
      unit: {
        include: {
          councils: {
            include: {
              channels: {
                where: { type: 'COUNCIL_INTERNAL' }
              }
            }
          }
        }
      }
    }
  })

  for (const m of councilMemberships) {
    for (const council of m.unit.councils) {
      for (const channel of council.channels) {
        const lastReadMembership = myMemberships.find((mm) => mm.channelId === channel.id)
        const lastReadAt = lastReadMembership?.lastReadAt ?? lastReadMembership?.joinedAt ?? null
        const unreadCount = lastReadAt
          ? await prisma.message.count({
              where: { channelId: channel.id, createdAt: { gt: lastReadAt }, deletedAt: null }
            })
          : 0
        entries.push({
          channelId: channel.id,
          channelName: council.name,
          type: 'COUNCIL_INTERNAL',
          councilId: council.id,
          otherUserId: null,
          otherUserAvatarUrl: null,
          unreadCount,
          closeable: false
        })
      }
    }
  }

  // Step 3: DIRECT_MESSAGE channels — closeable, hidden when hiddenAt is set
  const dmChannels = myMemberships.filter((m) => m.channel.type === 'DIRECT_MESSAGE')
  if (dmChannels.length > 0) {
    const dmChannelIds = dmChannels.map((m) => m.channelId)
    const peerMemberships = await prisma.channelMembership.findMany({
      where: { channelId: { in: dmChannelIds }, NOT: { userId } },
      include: {
        user: { select: { id: true, name: true, username: true, avatarUrl: true } }
      }
    })
    const peerByChannel = new Map(peerMemberships.map((p) => [p.channelId, p.user]))

    for (const m of dmChannels) {
      const peer = peerByChannel.get(m.channelId)
      if (!peer) continue
      const lastReadAt = m.lastReadAt ?? m.joinedAt
      const unreadCount = await prisma.message.count({
        where: { channelId: m.channelId, createdAt: { gt: lastReadAt }, deletedAt: null }
      })
      entries.push({
        channelId: m.channelId,
        channelName: peer.name,
        type: 'DIRECT_MESSAGE',
        councilId: null,
        otherUserId: peer.id,
        otherUserAvatarUrl: peer.avatarUrl ?? null,
        unreadCount,
        closeable: true
      })
    }
  }

  // Step 4: COUNCIL_PUBLIC channels the user has joined (not hidden)
  const publicChannels = myMemberships.filter((m) => m.channel.type === 'COUNCIL_PUBLIC')
  for (const m of publicChannels) {
    const lastReadAt = m.lastReadAt ?? m.joinedAt
    const unreadCount = await prisma.message.count({
      where: { channelId: m.channelId, createdAt: { gt: lastReadAt }, deletedAt: null }
    })
    entries.push({
      channelId: m.channelId,
      channelName: m.channel.name ?? 'Council',
      type: 'COUNCIL_PUBLIC',
      councilId: m.channel.councilId,
      otherUserId: null,
      otherUserAvatarUrl: null,
      unreadCount,
      closeable: true
    })
  }

  return entries
}

// ─── Channel creation ─────────────────────────────────────────────────────────

export async function getOrCreateCitizenChannel() {
  const existing = await prisma.channel.findFirst({
    where: { type: 'CITIZEN_GENERAL' }
  })
  if (existing) return existing

  return prisma.channel.create({
    data: { type: 'CITIZEN_GENERAL', name: 'Citizens' }
  })
}

export async function getOrCreateCouncilChannel(councilId: string) {
  const existing = await prisma.channel.findFirst({
    where: { councilId, type: 'COUNCIL_INTERNAL' }
  })
  if (existing) return existing

  const council = await prisma.council.findUnique({
    where: { id: councilId },
    select: { name: true }
  })

  return prisma.channel.create({
    data: {
      councilId,
      type: 'COUNCIL_INTERNAL',
      name: council?.name ?? 'Council Chat'
    }
  })
}

export async function getOrCreatePublicCouncilChannel(councilId: string) {
  const existing = await prisma.channel.findFirst({
    where: { councilId, type: 'COUNCIL_PUBLIC' }
  })
  if (existing) return existing

  const council = await prisma.council.findUnique({
    where: { id: councilId },
    select: {
      name: true,
      unit: {
        include: {
          memberships: {
            where: { role: 'COUNCIL_MEMBER' },
            select: { userId: true }
          }
        }
      }
    }
  })

  return prisma.$transaction(async (tx) => {
    const channel = await tx.channel.create({
      data: {
        councilId,
        type: 'COUNCIL_PUBLIC',
        name: council ? `${council.name} - Contact` : 'Council Contact'
      }
    })

    // Auto-add all current council members as channel members
    if (council?.unit.memberships.length) {
      await tx.channelMembership.createMany({
        data: council.unit.memberships.map((m) => ({
          channelId: channel.id,
          userId: m.userId
        })),
        skipDuplicates: true
      })
    }

    return channel
  })
}

export async function getOrCreateDMChannel(
  userId1: string,
  userId2: string
): Promise<{ channelId: string }> {
  // Find existing DM channel where both users are members
  const existing = await prisma.channel.findFirst({
    where: {
      type: 'DIRECT_MESSAGE',
      members: { some: { userId: userId1 } },
      AND: [{ members: { some: { userId: userId2 } } }]
    }
  })
  if (existing) return { channelId: existing.id }

  // Create channel + both memberships in a transaction
  const channel = await prisma.$transaction(async (tx) => {
    const ch = await tx.channel.create({
      data: { type: 'DIRECT_MESSAGE', name: null }
    })
    await tx.channelMembership.createMany({
      data: [
        { channelId: ch.id, userId: userId1 },
        { channelId: ch.id, userId: userId2 }
      ]
    })
    return ch
  })

  return { channelId: channel.id }
}

// ─── Mark as read / hide ───────────────────────────────────────────────────────

export async function markChannelRead(channelId: string, userId: string): Promise<void> {
  await prisma.channelMembership.updateMany({
    where: { channelId, userId },
    data: { lastReadAt: new Date() }
  })
}

export async function hideChannel(channelId: string, userId: string): Promise<void> {
  await prisma.channelMembership.updateMany({
    where: { channelId, userId },
    data: { hiddenAt: new Date() }
  })
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function listMessages(channelId: string, cursor?: string): Promise<MessageEntry[]> {
  const messages = await prisma.message.findMany({
    where: {
      channelId,
      deletedAt: null,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {})
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
    include: {
      author: { select: { name: true, username: true, firstName: true, lastName: true, showRealName: true, avatarUrl: true, civicStatus: true } }
    }
  })

  return messages.map(toMessageEntry)
}

export async function sendMessage(
  channelId: string,
  authorId: string,
  body: string,
  internalVoteId?: string
): Promise<MessageEntry> {
  // Visitors can only send if visitorChannels = 'readwrite'
  const [user, settings] = await Promise.all([
    prisma.user.findUnique({ where: { id: authorId }, select: { civicStatus: true, role: true } }),
    getAllSettings()
  ])
  if (user?.civicStatus === 'VISITOR' && user.role === 'USER') {
    if (settings.chat.visitorChannels !== 'readwrite') {
      error(403, 'Visitors cannot send messages')
    }
  }

  // Check if user is muted in this channel
  const mute = await prisma.channelMute.findUnique({
    where: { channelId_userId: { channelId, userId: authorId } }
  })
  if (mute && (!mute.expiresAt || mute.expiresAt > new Date())) {
    error(403, 'You are muted in this channel')
  }

  const message = await prisma.message.create({
    data: { channelId, authorId, body, internalVoteId: internalVoteId ?? null },
    include: {
      author: { select: { name: true, username: true, firstName: true, lastName: true, showRealName: true, avatarUrl: true, civicStatus: true } }
    }
  })

  // Notify all SSE listeners via Postgres NOTIFY
  await prisma.$executeRaw`SELECT pg_notify(${CHANNEL_NOTIFY}, ${JSON.stringify({
    channelId,
    messageId: message.id
  })})`

  return toMessageEntry(message)
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export async function deleteMessage(messageId: string, _moderatorId: string): Promise<void> {
  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() }
  })
}

export async function pinMessage(messageId: string, _moderatorId: string): Promise<void> {
  const msg = await prisma.message.findUnique({
    where: { id: messageId },
    select: { pinned: true, channelId: true }
  })
  if (!msg) error(404, 'Message not found')

  if (msg.pinned) {
    // Unpin
    await prisma.message.update({ where: { id: messageId }, data: { pinned: false } })
  } else {
    // Unpin any currently pinned message in the same channel, then pin this one
    await prisma.$transaction([
      prisma.message.updateMany({
        where: { channelId: msg.channelId, pinned: true },
        data: { pinned: false }
      }),
      prisma.message.update({ where: { id: messageId }, data: { pinned: true } })
    ])
  }
}

export async function getPinnedMessage(channelId: string): Promise<MessageEntry | null> {
  const msg = await prisma.message.findFirst({
    where: { channelId, pinned: true, deletedAt: null },
    include: { author: { select: { name: true, username: true, firstName: true, lastName: true, showRealName: true, avatarUrl: true, civicStatus: true } } }
  })
  return msg ? toMessageEntry(msg) : null
}

export async function muteUser(
  channelId: string,
  userId: string,
  moderatorId: string,
  minutes?: number
): Promise<void> {
  const expiresAt = minutes ? new Date(Date.now() + minutes * 60 * 1000) : null
  await prisma.channelMute.upsert({
    where: { channelId_userId: { channelId, userId } },
    update: { mutedById: moderatorId, expiresAt },
    create: { channelId, userId, mutedById: moderatorId, expiresAt }
  })
}

export async function clearMessages(
  channelId: string,
  count: number,
  _moderatorId: string
): Promise<void> {
  const messages = await prisma.message.findMany({
    where: { channelId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: count,
    select: { id: true }
  })
  await prisma.message.updateMany({
    where: { id: { in: messages.map((m) => m.id) } },
    data: { deletedAt: new Date() }
  })
}

// ─── SSE streaming ────────────────────────────────────────────────────────────

/**
 * AsyncGenerator that yields new MessageEntry objects via Postgres LISTEN/NOTIFY.
 * Used by the SSE endpoint. Each call creates its own pg client connection.
 */
export async function* streamMessages(channelId: string): AsyncGenerator<MessageEntry> {
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()
  await client.query(`LISTEN "${CHANNEL_NOTIFY}"`)

  const queue: MessageEntry[] = []
  let resolve: (() => void) | null = null

  client.on('notification', async (notification) => {
    try {
      const payload = JSON.parse(notification.payload ?? '{}')
      if (payload.channelId !== channelId) return

      const message = await prisma.message.findUnique({
        where: { id: payload.messageId },
        include: {
          author: { select: { name: true, username: true, firstName: true, lastName: true, showRealName: true, avatarUrl: true, civicStatus: true } }
        }
      })
      if (!message) return

      queue.push(toMessageEntry(message))
      resolve?.()
    } catch {
      // ignore parse errors
    }
  })

  try {
    while (true) {
      if (queue.length > 0) {
        yield queue.shift()!
      } else {
        await new Promise<void>((r) => {
          resolve = r
        })
        resolve = null
      }
    }
  } finally {
    await client.end()
  }
}
