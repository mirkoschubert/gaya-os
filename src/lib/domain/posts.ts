// Pure domain types for the Post/Announcement system.
// No Prisma, no HTTP - safe to import anywhere including client-side code.

export type PostEntityType = 'CITY' | 'COUNCIL' | 'USER'

export interface PostEntry {
  id: string
  authorId: string
  authorName: string
  authorUsername: string | null
  authorAvatarUrl: string | null
  entityType: PostEntityType
  entityId: string
  body: string
  mediaUrls: string[]
  createdAt: Date
  updatedAt: Date
}
