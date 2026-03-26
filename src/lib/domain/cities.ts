// Pure domain types for Cities.
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export interface CitySummary {
  id: string
  slug: string
  name: string
  description: string | null
  banner: string | null
  foundedAt: Date
  active: boolean
  memberCount: number
  unitId: string
  council: { id: string; name: string } | null
}

export interface CityMember {
  userId: string
  displayName: string
  username: string | null
  avatarUrl: string | null
  joinedAt: Date
}

export interface CityDetail extends CitySummary {
  members: CityMember[]
}
