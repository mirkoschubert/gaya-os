import { Prisma } from '@prisma/client'
import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'

export type TechnicalProfileView = {
  registrationIp: string | null
  lastIp: string | null
  lastUserAgent: string | null
  ipHistory: Array<{ ip: string; seenAt: string }> | null
}

export type AdminUserView = {
  id: string
  email: string
  name: string
  firstName: string
  lastName: string
  username: string | null
  role: string
  civicStatus: string
  citizenId: string | null
  emailVerified: boolean
  joinedAt: Date | null
  lastLogin: Date | null
  createdAt: Date
  technicalProfile: TechnicalProfileView | null
  applicationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | null
  councilMemberships: { unitId: string; councilId: string; councilName: string }[]
}

export async function listUsers(): Promise<AdminUserView[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      firstName: true,
      lastName: true,
      username: true,
      role: true,
      civicStatus: true,
      citizenId: true,
      emailVerified: true,
      joinedAt: true,
      lastLogin: true,
      createdAt: true,
      technicalProfile: {
        select: {
          registrationIp: true,
          lastIp: true,
          lastUserAgent: true,
          ipHistory: true
        }
      },
      citizenshipApplication: {
        select: { status: true }
      },
      memberships: {
        where: { role: 'COUNCIL_MEMBER' },
        select: {
          unitId: true,
          unit: {
            select: {
              councils: { select: { id: true, name: true } }
            }
          }
        }
      }
    }
  })

  return users.map((u) => ({
    ...u,
    technicalProfile: u.technicalProfile
      ? {
          ...u.technicalProfile,
          ipHistory: (u.technicalProfile.ipHistory as Array<{ ip: string; seenAt: string }> | null) ?? null
        }
      : null,
    applicationStatus: (u.citizenshipApplication?.status as AdminUserView['applicationStatus']) ?? null,
    councilMemberships: u.memberships.flatMap((m) =>
      m.unit.councils.map((c) => ({ unitId: m.unitId, councilId: c.id, councilName: c.name }))
    )
  }))
}

export async function setUserRole(
  userId: string,
  role: 'USER' | 'MODERATOR' | 'ADMIN',
  actorId?: string
): Promise<void> {
  const previous = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { role: true }
  })
  await prisma.user.update({ where: { id: userId }, data: { role } })
  await logAction({
    userId: actorId ?? userId,
    action: 'ROLE_CHANGED',
    entityType: 'USER',
    entityId: userId,
    metadata: { previousRole: previous.role, newRole: role }
  })
}

export async function setEmailVerified(userId: string, actorId?: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } })
  await logAction({
    userId: actorId ?? userId,
    action: 'EMAIL_VERIFIED',
    entityType: 'USER',
    entityId: userId
  })
}

/**
 * Anonymises a user account while preserving all public content
 * (proposals, votes, comments, audit log entries) for transparency.
 *
 * Auth credentials, sessions, passkeys, memberships and delegations
 * are hard-deleted. The user record itself is scrubbed: email becomes
 * a deterministic placeholder, name is replaced with "Former Member",
 * and all personal fields are cleared.
 */
export async function deleteUser(userId: string): Promise<void> {
  const placeholder = `deleted-${userId}@deleted.invalid`

  await prisma.$transaction([
    // Remove auth artefacts — these must not survive
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.passkey.deleteMany({ where: { userId } }),
    prisma.membership.deleteMany({ where: { userId } }),
    prisma.delegation.deleteMany({ where: { delegatorId: userId } }),
    prisma.delegation.deleteMany({ where: { delegateId: userId } }),
    // Anonymise the user record; proposals / votes / comments keep their FK
    prisma.user.update({
      where: { id: userId },
      data: {
        email: placeholder,
        name: 'Former Member',
        firstName: 'Former',
        lastName: 'Member',
        emailVerified: false,
        bio: null,
        location: null,
        links: Prisma.JsonNull,
        avatarUrl: null,
        heroUrl: null,
        role: 'USER',
        civicStatus: 'VISITOR',
        citizenId: null,
        joinedAt: null,
        lastLogin: null
      }
    })
  ])

  await logAction({
    userId,
    action: 'USER_DELETED',
    entityType: 'USER',
    entityId: userId
  })
}
