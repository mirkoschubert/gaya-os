export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN'
export type CivicStatus = 'VISITOR' | 'CITIZEN'

export interface ProfileLink {
  label: string
  url: string
}

export interface AppUser {
  id: string
  email: string
  name: string // computed: `${firstName} ${lastName}`
  firstName: string
  lastName: string
  username: string | null
  displayUsername: string | null
  role: UserRole
  civicStatus: CivicStatus
  citizenId: string | null
  joinedAt: Date | null
  createdAt: Date
  // Profile fields
  bio: string | null
  location: string | null
  links: ProfileLink[] | null
  avatarUrl: string | null
  heroUrl: string | null
  showRealName: boolean
}
