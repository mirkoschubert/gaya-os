import { prisma } from '$lib/server/prisma'

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
      createdAt: true
    }
  })
}

export async function setUserRole(
  userId: string,
  role: 'USER' | 'MODERATOR' | 'ADMIN'
): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { role } })
  await prisma.auditLog.create({
    data: { userId, action: 'ADMIN_SET_ROLE', metadata: JSON.stringify({ role }) }
  })
}

export async function setEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { emailVerified: true } })
  await prisma.auditLog.create({
    data: { userId, action: 'ADMIN_VERIFY_EMAIL' }
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
