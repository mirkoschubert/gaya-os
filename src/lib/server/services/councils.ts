import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import type {
  CouncilDetail,
  CouncilMember,
  CouncilNavEntry,
  CouncilRepresentativeEntry,
  CouncilSessionDetail,
  CouncilSessionSummary,
  SessionAgendaItem
} from '$lib/domain/council'

export interface PublicCouncilProfile {
  id: string
  name: string
  type: string
  scopeDescription: string | null
  unitName: string
  memberCount: number
  members: {
    userId: string
    name: string
    username: string | null
    avatarUrl: string | null
    representativeAreas: string[]
  }[]
}

export async function listPublicCouncilProfiles(): Promise<PublicCouncilProfile[]> {
  const councils = await prisma.council.findMany({
    include: {
      unit: {
        include: {
          memberships: {
            where: { role: 'COUNCIL_MEMBER' },
            include: {
              user: { select: { id: true, name: true, username: true, avatarUrl: true } }
            }
          }
        }
      },
      representatives: {
        where: { until: null },
        select: { userId: true, area: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return councils.map((c) => {
    const repsByUser = new Map<string, string[]>()
    for (const r of c.representatives) {
      const areas = repsByUser.get(r.userId) ?? []
      areas.push(r.area)
      repsByUser.set(r.userId, areas)
    }

    return {
      id: c.id,
      name: c.name,
      type: c.type,
      scopeDescription: c.scopeDescription,
      unitName: c.unit.name,
      memberCount: c.unit.memberships.length,
      members: c.unit.memberships.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        username: m.user.username ?? null,
        avatarUrl: m.user.avatarUrl ?? null,
        representativeAreas: repsByUser.get(m.userId) ?? []
      }))
    }
  })
}

export interface CouncilOption {
  id: string
  name: string
  unitId: string
  unitName: string
}

export async function listAllCouncils(): Promise<CouncilOption[]> {
  const councils = await prisma.council.findMany({
    include: { unit: { select: { id: true, name: true } } },
    orderBy: { name: 'asc' }
  })
  return councils.map((c) => ({
    id: c.id,
    name: c.name,
    unitId: c.unitId,
    unitName: c.unit.name
  }))
}

export interface CouncilMembershipStatus {
  councilId: string
  councilName: string
  unitId: string
  unitName: string
  isMember: boolean
}

export async function listAllCouncilsWithMembershipStatus(
  userId: string
): Promise<CouncilMembershipStatus[]> {
  const councils = await prisma.council.findMany({
    include: { unit: true }
  })

  const memberships = await prisma.membership.findMany({
    where: { userId, role: 'COUNCIL_MEMBER' }
  })
  const memberUnitIds = new Set(memberships.map((m) => m.unitId))

  return councils.map((c) => ({
    councilId: c.id,
    councilName: c.name,
    unitId: c.unitId,
    unitName: c.unit.name,
    isMember: memberUnitIds.has(c.unitId)
  }))
}

export async function setCouncilMembership(params: {
  userId: string
  unitId: string
  isMember: boolean
  adminId: string
}): Promise<void> {
  const [council, unit] = await Promise.all([
    prisma.council.findUnique({ where: { unitId: params.unitId }, select: { name: true } }),
    prisma.unit.findUnique({ where: { id: params.unitId }, select: { name: true } })
  ])

  if (params.isMember) {
    // Enforce: a citizen may only be a council member in one council at a time.
    const existingCouncilMembership = await prisma.membership.findFirst({
      where: { userId: params.userId, role: 'COUNCIL_MEMBER', NOT: { unitId: params.unitId } },
      include: { unit: { include: { councils: { select: { name: true } } } } }
    })
    if (existingCouncilMembership) {
      const existingName = existingCouncilMembership.unit.councils[0]?.name ?? existingCouncilMembership.unit.name
      throw new Error(`This citizen is already a member of "${existingName}". Remove them there first.`)
    }

    // Upsert: ensure Unit membership exists, then set role to COUNCIL_MEMBER
    await prisma.membership.upsert({
      where: { userId_unitId: { userId: params.userId, unitId: params.unitId } },
      update: { role: 'COUNCIL_MEMBER' },
      create: { userId: params.userId, unitId: params.unitId, role: 'COUNCIL_MEMBER' }
    })

    await logAction({
      userId: params.adminId,
      action: 'COUNCIL_MEMBER_ADDED',
      entityType: 'USER',
      entityId: params.userId,
      metadata: {
        councilName: council?.name ?? params.unitId,
        unitName: unit?.name ?? params.unitId
      }
    })
  } else {
    // Remove COUNCIL_MEMBER role: either downgrade to MEMBER or delete the row
    const existing = await prisma.membership.findUnique({
      where: { userId_unitId: { userId: params.userId, unitId: params.unitId } }
    })

    if (existing) {
      await prisma.membership.delete({
        where: { userId_unitId: { userId: params.userId, unitId: params.unitId } }
      })
    }

    await logAction({
      userId: params.adminId,
      action: 'COUNCIL_MEMBER_REMOVED',
      entityType: 'USER',
      entityId: params.userId,
      metadata: {
        councilName: council?.name ?? params.unitId,
        unitName: unit?.name ?? params.unitId
      }
    })
  }
}

export async function getCouncilMembershipsForUser(userId: string): Promise<CouncilNavEntry[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId, role: 'COUNCIL_MEMBER' },
    include: {
      unit: {
        include: { councils: { select: { id: true, name: true } } }
      }
    }
  })

  return memberships
    .filter((m) => m.unit.councils.length > 0)
    .map((m) => ({
      councilId: m.unit.councils[0].id,
      unitName: m.unit.name,
      councilName: m.unit.councils[0].name
    }))
}

export async function getCouncilDetail(councilId: string): Promise<CouncilDetail | null> {
  const council = await prisma.council.findUnique({
    where: { id: councilId },
    include: {
      unit: {
        include: {
          memberships: {
            where: { role: 'COUNCIL_MEMBER' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                  joinedAt: true
                }
              }
            }
          }
        }
      },
      representatives: {
        where: { until: null },
        include: {
          user: { select: { id: true, name: true, username: true } }
        }
      },
      sessions: {
        where: {
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
        },
        orderBy: { scheduledAt: 'asc' },
        take: 1,
        include: {
          _count: { select: { agendaItems: true } }
        }
      },
      _count: {
        select: { nominations: true }
      }
    }
  })

  if (!council) return null

  const openProposalCount = await prisma.proposal.count({
    where: { unitId: council.unitId, status: 'DISCUSSION' }
  })

  const members: CouncilMember[] = council.unit.memberships.map((m) => {
    const reps = council.representatives
      .filter((r) => r.userId === m.userId)
      .map((r) => r.area)
    return {
      userId: m.user.id,
      name: m.user.name,
      username: m.user.username ?? null,
      avatarUrl: m.user.avatarUrl ?? null,
      joinedAt: m.joinedAt,
      representativeAreas: reps
    }
  })

  const representatives: CouncilRepresentativeEntry[] = council.representatives.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.user.name,
    username: r.user.username ?? null,
    area: r.area,
    since: r.since,
    until: r.until
  }))

  const nextSession: CouncilSessionSummary | null = council.sessions[0]
    ? {
        id: council.sessions[0].id,
        councilId: council.id,
        title: council.sessions[0].title,
        description: council.sessions[0].description,
        scheduledAt: council.sessions[0].scheduledAt,
        endsAt: council.sessions[0].endsAt,
        status: council.sessions[0].status as CouncilSessionSummary['status'],
        agendaItemCount: council.sessions[0]._count.agendaItems
      }
    : null

  return {
    id: council.id,
    unitId: council.unitId,
    unitName: council.unit.name,
    name: council.name,
    type: council.type as CouncilDetail['type'],
    scopeDescription: council.scopeDescription,
    createdAt: council.createdAt,
    members,
    representatives,
    nextSession,
    openProposalCount
  }
}

export async function listSessions(councilId: string): Promise<CouncilSessionSummary[]> {
  const sessions = await prisma.councilSession.findMany({
    where: { councilId },
    orderBy: { scheduledAt: 'desc' },
    include: {
      _count: { select: { agendaItems: true } }
    }
  })

  return sessions.map((s) => ({
    id: s.id,
    councilId: s.councilId,
    title: s.title,
    description: s.description,
    scheduledAt: s.scheduledAt,
    endsAt: s.endsAt,
    status: s.status as CouncilSessionSummary['status'],
    agendaItemCount: s._count.agendaItems
  }))
}

export async function getSessionDetail(sessionId: string): Promise<CouncilSessionDetail | null> {
  const session = await prisma.councilSession.findUnique({
    where: { id: sessionId },
    include: {
      agendaItems: {
        orderBy: { order: 'asc' },
        include: {
          proposal: { select: { id: true, title: true } }
        }
      }
    }
  })

  if (!session) return null

  const agendaItems: SessionAgendaItem[] = session.agendaItems.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    status: item.status as SessionAgendaItem['status'],
    order: item.order,
    proposalId: item.proposalId,
    proposalTitle: item.proposal?.title ?? null,
    outcome: item.outcome
  }))

  return {
    id: session.id,
    councilId: session.councilId,
    title: session.title,
    description: session.description,
    scheduledAt: session.scheduledAt,
    endsAt: session.endsAt,
    status: session.status as CouncilSessionDetail['status'],
    location: session.location,
    notes: session.notes,
    agendaItems
  }
}

export async function createSession(params: {
  councilId: string
  title: string
  description: string | null
  scheduledAt: Date
  endsAt: Date | null
  location: string | null
  createdById: string
}): Promise<void> {
  const council = await prisma.council.findUnique({
    where: { id: params.councilId },
    select: { name: true }
  })

  await prisma.councilSession.create({
    data: {
      councilId: params.councilId,
      title: params.title,
      description: params.description,
      scheduledAt: params.scheduledAt,
      endsAt: params.endsAt,
      location: params.location
    }
  })

  await logAction({
    userId: params.createdById,
    action: 'COUNCIL_SESSION_CREATED',
    entityType: 'COUNCIL',
    entityId: params.councilId,
    metadata: {
      sessionTitle: params.title,
      councilName: council?.name ?? params.councilId
    }
  })
}

export async function listProposalsForReview(councilId: string) {
  const council = await prisma.council.findUnique({
    where: { id: councilId },
    select: { unitId: true }
  })

  if (!council) return []

  return prisma.proposal.findMany({
    where: { unitId: council.unitId, status: 'DISCUSSION' },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      createdAt: true,
      body: true
    }
  })
}

export async function getProposalForReview(proposalId: string) {
  return prisma.proposal.findUnique({
    where: { id: proposalId },
    select: { id: true, title: true, body: true, category: true, status: true }
  })
}

export async function reviewProposal(params: {
  councilId: string
  proposalId: string
  decision: 'READY_FOR_VOTE' | 'DISCUSSION'
  note: string | null
  reviewerId: string
}): Promise<void> {
  const [council, proposal] = await Promise.all([
    prisma.council.findUnique({ where: { id: params.councilId }, select: { name: true } }),
    prisma.proposal.findUnique({ where: { id: params.proposalId }, select: { title: true } })
  ])

  await prisma.proposal.update({
    where: { id: params.proposalId },
    data: {
      status: params.decision,
      reviewedByCouncilId: params.councilId,
      reviewNote: params.note,
      reviewedAt: new Date()
    }
  })

  await logAction({
    userId: params.reviewerId,
    action: 'PROPOSAL_REVIEWED_BY_COUNCIL',
    entityType: 'PROPOSAL',
    entityId: params.proposalId,
    metadata: {
      proposalTitle: proposal?.title ?? params.proposalId,
      councilName: council?.name ?? params.councilId,
      decision: params.decision === 'READY_FOR_VOTE' ? 'advanced' : 'returned'
    }
  })
}
