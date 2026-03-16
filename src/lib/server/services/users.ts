import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'

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
}

export async function listUsers(): Promise<AdminUserView[]> {
  return prisma.user.findMany({
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
      createdAt: true
    }
  })
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

export async function deleteUser(userId: string): Promise<void> {
  await prisma.$transaction([
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
    prisma.passkey.deleteMany({ where: { userId } }),
    prisma.membership.deleteMany({ where: { userId } }),
    prisma.proposalSupport.deleteMany({ where: { userId } }),
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.vote.deleteMany({ where: { voterId: userId } }),
    prisma.delegation.deleteMany({ where: { delegatorId: userId } }),
    prisma.delegation.deleteMany({ where: { delegateId: userId } }),
    prisma.auditLog.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } })
  ])
}
