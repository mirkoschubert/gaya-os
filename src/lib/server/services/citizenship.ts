import { prisma } from '$lib/server/prisma'
import { logAction } from './audit'

const CITIZEN_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/**
 * Generates a random citizen ID in the format CX-ZZZZZZZZZZZZ
 * where Z is a random uppercase letter or digit (12 characters total).
 * Retries on collision.
 */
async function generateCitizenId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const rand = Array.from(
      { length: 12 },
      () => CITIZEN_ID_CHARS[Math.floor(Math.random() * CITIZEN_ID_CHARS.length)]
    ).join('')
    const id = `CX-${rand}`
    const existing = await prisma.user.findUnique({ where: { citizenId: id } })
    if (!existing) return id
  }
  throw new Error('Failed to generate unique citizen ID after 10 attempts.')
}

const OLD_ID_PATTERN = /^CX-(\d{4}-\d{4}|ADMIN-.+)$/

/**
 * Migrates all citizen IDs that match the old format (CX-YYYY-NNNN or CX-ADMIN-...)
 * to the new random format (CX-ZZZZZZZZZZZZ).
 * Safe to run multiple times — skips already-migrated IDs.
 * Returns the number of IDs migrated.
 */
export async function migrateOldCitizenIds(): Promise<number> {
  const users = await prisma.user.findMany({
    where: { citizenId: { not: null } },
    select: { id: true, citizenId: true }
  })

  const toMigrate = users.filter((u) => u.citizenId && OLD_ID_PATTERN.test(u.citizenId))
  if (toMigrate.length === 0) return 0

  for (const user of toMigrate) {
    const newId = await generateCitizenId()
    await prisma.user.update({ where: { id: user.id }, data: { citizenId: newId } })
    await logAction({
      userId: user.id,
      action: 'CITIZEN_ID_MIGRATED',
      entityType: 'USER',
      entityId: user.id,
      metadata: { oldId: user.citizenId, newId }
    })
  }

  return toMigrate.length
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
