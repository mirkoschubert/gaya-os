import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'

/**
 * Generates a citizen ID in the format CX-YYYY-NNNN.
 * The NNNN part is a zero-padded sequential number.
 */
async function generateCitizenId(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.user.count({
    where: { citizenId: { not: null } }
  })
  const seq = String(count + 1).padStart(4, '0')
  return `CX-${year}-${seq}`
}

/**
 * Applies for citizenship for a given user.
 * MVP: automatic approval – status changes from VISITOR to CITIZEN immediately.
 * Later: optionally require council/committee review.
 */
export async function applyForCitizenship(userId: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })

  if (user.civicStatus !== 'VISITOR') {
    throw new Error('User is not a VISITOR or is already a CITIZEN.')
  }

  const citizenId = await generateCitizenId()
  const now = new Date()

  await prisma.user.update({
    where: { id: userId },
    data: {
      civicStatus: 'CITIZEN',
      citizenId,
      joinedAt: now
    }
  })

  await logAction({
    userId,
    action: 'CITIZENSHIP_GRANTED',
    entityType: 'USER',
    entityId: userId,
    metadata: { citizenId, grantedAt: now.toISOString() }
  })
}
