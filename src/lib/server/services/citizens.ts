import { prisma } from '$lib/server/prisma'
import type { ProfileLink } from '$lib/domain/auth'

export interface CitizenSummary {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  citizenId: string | null
  joinedAt: Date | null
  cityName: string | null
}

export interface CitizenProfile extends CitizenSummary {
  civicStatus: string
  bio: string | null
  location: string | null
  locationCity: string | null
  locationCountry: string | null
  links: ProfileLink[]
  heroUrl: string | null
  showRealName: boolean
  firstName: string
  lastName: string
}

function parseLinks(raw: unknown): ProfileLink[] {
  if (!raw) return []
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  if (Array.isArray(raw)) return raw as ProfileLink[]
  return []
}

function resolveDisplayName(user: {
  firstName: string
  lastName: string
  username: string | null
  showRealName: boolean
}): string {
  if (user.showRealName && (user.firstName || user.lastName)) {
    return `${user.firstName} ${user.lastName}`.trim()
  }
  return user.username ? `@${user.username}` : 'Citizen'
}

export interface VisitorSummary {
  id: string
  displayName: string
  username: string | null
  avatarUrl: string | null
  hasProfile: boolean
  createdAt: Date
}

/**
 * Returns all visitors (civicStatus=VISITOR) for the nation directory.
 * hasProfile is true if the VISITOR role has has_profile=true in RoleCapability
 * (i.e. an admin toggled it on globally for all visitors).
 */
export async function listVisitors(): Promise<VisitorSummary[]> {
  const [users, visitorHasProfile] = await Promise.all([
    prisma.user.findMany({
      where: { civicStatus: 'VISITOR' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        avatarUrl: true,
        showRealName: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.roleCapability.findUnique({
      where: { role_capability: { role: 'VISITOR', capability: 'has_profile' } },
      select: { allowed: true }
    })
  ])

  const hasProfile = visitorHasProfile?.allowed ?? false

  return users.map((u) => ({
    id: u.id,
    displayName: resolveDisplayName(u),
    username: u.username,
    avatarUrl: u.avatarUrl,
    hasProfile,
    createdAt: u.createdAt
  }))
}

/**
 * Returns all citizens for the directory listing.
 */
export async function listCitizens(): Promise<CitizenSummary[]> {
  const users = await prisma.user.findMany({
    where: { civicStatus: 'CITIZEN', citizenId: { not: null } },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
      citizenId: true,
      joinedAt: true,
      showRealName: true,
      cityMemberships: { select: { city: { select: { name: true } } }, take: 1 }
    },
    orderBy: { joinedAt: 'asc' }
  })

  return users
    .filter((u) => u.citizenId && u.joinedAt)
    .map((u) => ({
      id: u.id,
      username: u.username ?? u.id,
      displayName: resolveDisplayName(u),
      avatarUrl: u.avatarUrl,
      citizenId: u.citizenId!,
      joinedAt: u.joinedAt!,
      cityName: u.cityMemberships[0]?.city.name ?? null
    }))
}

/**
 * Returns the full profile for a citizen by username.
 * Returns null if not found or not a citizen.
 */
export async function getCitizenByUsername(username: string): Promise<CitizenProfile | null> {
  const user = await prisma.user.findFirst({
    where: { username },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      username: true,
      avatarUrl: true,
      heroUrl: true,
      citizenId: true,
      civicStatus: true,
      joinedAt: true,
      showRealName: true,
      bio: true,
      location: true,
      locationCity: true,
      locationCountry: true,
      links: true,
      cityMemberships: { select: { city: { select: { name: true, slug: true } } }, take: 1 }
    }
  })

  if (!user) return null

  return {
    id: user.id,
    username: user.username ?? user.id,
    displayName: resolveDisplayName(user),
    avatarUrl: user.avatarUrl,
    heroUrl: user.heroUrl,
    citizenId: user.citizenId,
    civicStatus: user.civicStatus,
    joinedAt: user.joinedAt,
    cityName: user.cityMemberships[0]?.city.name ?? null,
    bio: user.bio,
    location: user.location,
    locationCity: user.locationCity,
    locationCountry: user.locationCountry,
    links: parseLinks(user.links),
    showRealName: user.showRealName,
    firstName: user.firstName,
    lastName: user.lastName
  }
}
