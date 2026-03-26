import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import type { CitySummary, CityDetail } from '$lib/domain/cities'

// ──────────────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────────────

const CITY_INCLUDE = {
  _count: { select: { members: true } },
  council: { select: { id: true, name: true } }
} as const

function mapCitySummary(c: {
  id: string
  slug: string
  name: string
  description: string | null
  banner: string | null
  foundedAt: Date
  active: boolean
  unitId: string
  _count: { members: number }
  council: { id: string; name: string } | null
}): CitySummary {
  return {
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    banner: c.banner,
    foundedAt: c.foundedAt,
    active: c.active,
    memberCount: c._count.members,
    unitId: c.unitId,
    council: c.council
  }
}

// ──────────────────────────────────────────────
// Public service functions
// ──────────────────────────────────────────────

/** Admin: list all cities including inactive ones. */
export async function listAllCities(): Promise<CitySummary[]> {
  const cities = await prisma.city.findMany({
    include: CITY_INCLUDE,
    orderBy: { name: 'asc' }
  })
  return cities.map(mapCitySummary)
}

/** Public: list only active cities. */
export async function listActiveCities(): Promise<CitySummary[]> {
  const cities = await prisma.city.findMany({
    where: { active: true },
    include: CITY_INCLUDE,
    orderBy: { name: 'asc' }
  })
  return cities.map(mapCitySummary)
}

/** Get full city detail by slug. Returns null if not found. */
export async function getCityBySlug(slug: string): Promise<CityDetail | null> {
  const city = await prisma.city.findUnique({
    where: { slug },
    include: {
      ...CITY_INCLUDE,
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } }
        },
        orderBy: { joinedAt: 'asc' }
      }
    }
  })
  if (!city) return null

  return {
    ...mapCitySummary(city),
    members: city.members.map((m) => ({
      userId: m.user.id,
      displayName: m.user.name,
      username: m.user.username ?? null,
      avatarUrl: m.user.avatarUrl ?? null,
      joinedAt: m.joinedAt
    }))
  }
}

/** Get full city detail by id. Returns null if not found. */
export async function getCityById(id: string): Promise<CityDetail | null> {
  const city = await prisma.city.findUnique({
    where: { id },
    include: {
      ...CITY_INCLUDE,
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, avatarUrl: true } }
        },
        orderBy: { joinedAt: 'asc' }
      }
    }
  })
  if (!city) return null

  return {
    ...mapCitySummary(city),
    members: city.members.map((m) => ({
      userId: m.user.id,
      displayName: m.user.name,
      username: m.user.username ?? null,
      avatarUrl: m.user.avatarUrl ?? null,
      joinedAt: m.joinedAt
    }))
  }
}

/**
 * Admin: create a new city.
 * Creates the City and a linked Unit in a single transaction.
 */
export async function createCity(params: {
  name: string
  slug: string
  description: string | null
  banner: string | null
  foundedAt: Date
  active: boolean
  adminId: string
}): Promise<{ id: string; slug: string }> {
  const { name, slug, description, banner, foundedAt, active, adminId } = params

  const city = await prisma.$transaction(async (tx) => {
    const unit = await tx.unit.create({
      data: { name, slug }
    })
    const newCity = await tx.city.create({
      data: { name, slug, description, banner, foundedAt, active, unitId: unit.id }
    })
    if (active) {
      const council = await tx.council.create({
        data: {
          unitId: unit.id,
          cityId: newCity.id,
          name: `${name} Council`,
          type: 'REGIONAL',
          scopeDescription: `The governing council of the city of ${name}.`
        }
      })
      await tx.channel.create({
        data: {
          councilId: council.id,
          type: 'COUNCIL_INTERNAL',
          name: `${name} Council`
        }
      })
      await tx.channel.create({
        data: {
          cityId: newCity.id,
          type: 'CITY_PUBLIC',
          name
        }
      })
    }
    return newCity
  })

  await logAction({
    userId: adminId,
    action: 'CITY_CREATED',
    entityType: 'CITY',
    entityId: city.id,
    metadata: { cityName: city.name, citySlug: city.slug, active }
  })

  return { id: city.id, slug: city.slug }
}

/**
 * Admin: update city fields.
 * Detects active toggle and logs CITY_ACTIVATED or CITY_DEACTIVATED accordingly.
 */
export async function updateCity(params: {
  cityId: string
  name: string
  slug: string
  description: string | null
  banner: string | null
  foundedAt: Date
  active: boolean
  adminId: string
}): Promise<void> {
  const { cityId, name, slug, description, banner, foundedAt, active, adminId } = params

  const before = await prisma.city.findUniqueOrThrow({
    where: { id: cityId },
    select: {
      active: true,
      name: true,
      slug: true,
      unitId: true,
      council: { select: { id: true } }
    }
  })

  const existingCityPublicChannel = before.active
    ? null
    : await prisma.channel.findFirst({ where: { cityId, type: 'CITY_PUBLIC' }, select: { id: true } })

  await prisma.$transaction(async (tx) => {
    await tx.city.update({
      where: { id: cityId },
      data: { name, slug, description, banner, foundedAt, active }
    })
    await tx.unit.updateMany({
      where: { city: { id: cityId } },
      data: { name, slug }
    })

    // On first activation: create council + channels if they don't exist yet
    if (!before.active && active && !before.council) {
      const council = await tx.council.create({
        data: {
          unitId: before.unitId,
          cityId,
          name: `${name} Council`,
          type: 'REGIONAL',
          scopeDescription: `The governing council of the city of ${name}.`
        }
      })
      await tx.channel.create({
        data: { councilId: council.id, type: 'COUNCIL_INTERNAL', name: `${name} Council` }
      })
    }

    if (!before.active && active && !existingCityPublicChannel) {
      await tx.channel.create({
        data: { cityId, type: 'CITY_PUBLIC', name }
      })
    }
  })

  await logAction({
    userId: adminId,
    action: 'CITY_UPDATED',
    entityType: 'CITY',
    entityId: cityId,
    metadata: { cityName: name, citySlug: slug }
  })

  if (!before.active && active) {
    await logAction({
      userId: adminId,
      action: 'CITY_ACTIVATED',
      entityType: 'CITY',
      entityId: cityId,
      metadata: { cityName: name, citySlug: slug }
    })
  } else if (before.active && !active) {
    await logAction({
      userId: adminId,
      action: 'CITY_DEACTIVATED',
      entityType: 'CITY',
      entityId: cityId,
      metadata: { cityName: name, citySlug: slug }
    })
  }
}

/**
 * Admin: assign or clear the Council linked to a City.
 * Sets Council.cityId and Council.type = REGIONAL.
 * Clears the previous council's cityId if it had one.
 */
export async function setCityCouncil(params: {
  cityId: string
  councilId: string | null
  adminId: string
}): Promise<void> {
  const { cityId, councilId, adminId } = params

  await prisma.$transaction(async (tx) => {
    // Clear any existing council linked to this city
    await tx.council.updateMany({
      where: { cityId },
      data: { cityId: null }
    })

    if (councilId) {
      // Validate no other city already claims this council
      const conflict = await tx.council.findUnique({
        where: { id: councilId },
        select: { cityId: true }
      })
      if (conflict?.cityId && conflict.cityId !== cityId) {
        throw new Error('This council is already linked to a different city.')
      }

      await tx.council.update({
        where: { id: councilId },
        data: { cityId, type: 'REGIONAL' }
      })
    }
  })
}

/**
 * Admin: permanently delete a city.
 * Removes the council (resetting member roles to MEMBER), all channels, all
 * posts, all city memberships, the city itself, and its linked unit.
 */
export async function deleteCity(params: {
  cityId: string
  adminId: string
}): Promise<void> {
  const { cityId, adminId } = params

  const city = await prisma.city.findUniqueOrThrow({
    where: { id: cityId },
    select: {
      name: true,
      slug: true,
      unitId: true,
      council: { select: { id: true } },
      channels: { select: { id: true } }
    }
  })

  await prisma.$transaction(async (tx) => {
    // Reset council members back to MEMBER role, delete council and its channels
    if (city.council) {
      await tx.membership.updateMany({
        where: { unitId: city.unitId, role: 'COUNCIL_MEMBER' },
        data: { role: 'MEMBER' }
      })
      await tx.councilRepresentative.deleteMany({ where: { councilId: city.council.id } })
      // Delete internal votes and their ballots
      const internalVotes = await tx.internalVote.findMany({
        where: { councilId: city.council.id },
        select: { id: true }
      })
      for (const iv of internalVotes) {
        await tx.internalBallot.deleteMany({ where: { internalVoteId: iv.id } })
      }
      await tx.internalVote.deleteMany({ where: { councilId: city.council.id } })
      // Delete council channels
      const councilChannels = await tx.channel.findMany({
        where: { councilId: city.council.id },
        select: { id: true }
      })
      for (const ch of councilChannels) {
        await tx.messageReaction.deleteMany({ where: { message: { channelId: ch.id } } })
        await tx.message.deleteMany({ where: { channelId: ch.id } })
        await tx.channelMute.deleteMany({ where: { channelId: ch.id } })
        await tx.channelMembership.deleteMany({ where: { channelId: ch.id } })
      }
      await tx.channel.deleteMany({ where: { councilId: city.council.id } })
      await tx.council.delete({ where: { id: city.council.id } })
    }

    // Delete city-public channels
    for (const channel of city.channels) {
      await tx.messageReaction.deleteMany({ where: { message: { channelId: channel.id } } })
      await tx.message.deleteMany({ where: { channelId: channel.id } })
      await tx.channelMute.deleteMany({ where: { channelId: channel.id } })
      await tx.channelMembership.deleteMany({ where: { channelId: channel.id } })
    }
    await tx.channel.deleteMany({ where: { cityId } })

    // Delete posts for this city
    await tx.post.deleteMany({ where: { entityType: 'CITY', entityId: cityId } })

    // Delete city memberships
    await tx.cityMembership.deleteMany({ where: { cityId } })

    // Delete the city and its unit
    await tx.city.delete({ where: { id: cityId } })
    await tx.unit.delete({ where: { id: city.unitId } })
  })

  await logAction({
    userId: adminId,
    action: 'CITY_DELETED',
    entityType: 'CITY',
    entityId: cityId,
    metadata: { cityName: city.name, citySlug: city.slug }
  })
}

/**
 * Add a member to a city. Idempotent — no error if already a member.
 */
export async function addCityMember(params: {
  cityId: string
  userId: string
  actorId: string
}): Promise<void> {
  const { cityId, userId, actorId } = params

  const city = await prisma.city.findUniqueOrThrow({
    where: { id: cityId },
    select: { name: true, slug: true }
  })

  const actor = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, username: true }
  })

  await prisma.cityMembership.upsert({
    where: { cityId_userId: { cityId, userId } },
    create: { cityId, userId },
    update: {}
  })

  await logAction({
    userId: actorId,
    action: 'CITY_MEMBER_ADDED',
    entityType: 'CITY',
    entityId: cityId,
    metadata: {
      cityName: city.name,
      citySlug: city.slug,
      memberName: actor.username ? `@${actor.username}` : actor.name,
      memberId: userId
    }
  })
}

/**
 * Remove a member from a city. No-op if not a member.
 */
export async function removeCityMember(params: {
  cityId: string
  userId: string
  actorId: string
}): Promise<void> {
  const { cityId, userId, actorId } = params

  const city = await prisma.city.findUniqueOrThrow({
    where: { id: cityId },
    select: { name: true, slug: true }
  })

  const member = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, username: true }
  })

  await prisma.cityMembership.deleteMany({
    where: { cityId, userId }
  })

  await logAction({
    userId: actorId,
    action: 'CITY_MEMBER_REMOVED',
    entityType: 'CITY',
    entityId: cityId,
    metadata: {
      cityName: city.name,
      citySlug: city.slug,
      memberName: member.username ? `@${member.username}` : member.name,
      memberId: userId
    }
  })
}
