// Pure domain types for the Channel/Messages system.
// No Prisma, no HTTP - safe to import anywhere including client-side code.

export type ChannelType = 'COUNCIL_INTERNAL' | 'CITIZEN_GENERAL' | 'COUNCIL_PUBLIC' | 'DIRECT_MESSAGE'
export type MessageReactionType = 'THUMBS_UP' | 'THUMBS_DOWN' | 'QUESTION'

export interface ReactionSummary {
  type: MessageReactionType
  count: number
  userReacted: boolean
}

export interface MessageEntry {
  id: string
  channelId: string
  authorId: string
  authorName: string
  authorUsername: string | null
  authorAvatarUrl: string | null
  authorIsVisitor: boolean
  body: string
  editedAt: Date | null
  deletedAt: Date | null
  pinned: boolean
  createdAt: Date
  reactions: ReactionSummary[]
  internalVoteId: string | null
}

export interface UserChannelEntry {
  channelId: string
  channelName: string // council name for COUNCIL_INTERNAL; peer displayName for DM; council name for COUNCIL_PUBLIC
  type: ChannelType
  councilId: string | null
  otherUserId: string | null // DM: the other participant's id
  otherUserAvatarUrl: string | null
  unreadCount: number
  closeable: boolean // false for COUNCIL_INTERNAL and CITIZEN_GENERAL
}

export interface ChannelSummary {
  id: string
  councilId: string | null
  type: ChannelType
  name: string | null
  lastMessage: Pick<MessageEntry, 'body' | 'authorName' | 'createdAt'> | null
}
