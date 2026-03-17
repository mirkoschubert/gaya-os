import { prisma } from '$lib/server/prisma'
import type { ProfileLink } from '$lib/domain/auth'

export interface CitizenSummary {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
  citizenId: string | null
  joinedAt: Date | null
}

export interface CitizenProfile extends CitizenSummary {
  bio: string | null
  location: string | null
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
      showRealName: true
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
      joinedAt: u.joinedAt!
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
      joinedAt: true,
      showRealName: true,
      bio: true,
      location: true,
      links: true
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
    joinedAt: user.joinedAt,
    bio: user.bio,
    location: user.location,
    links: parseLinks(user.links),
    showRealName: user.showRealName,
    firstName: user.firstName,
    lastName: user.lastName
  }
}
