import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import {
  DEFAULT_MATRIX,
  ROLES,
  ALL_CAPABILITIES,
  type PermissionMatrix
} from '$lib/domain/roles'

// Cache the matrix in memory to avoid repeated DB reads on every request.
// Invalidated whenever updateCapability is called.
let cachedMatrix: PermissionMatrix | null = null

/**
 * Returns true if ANY of the user's roles grants the capability.
 * UserRole and CivicStatus are orthogonal — "highest right wins".
 *
 * A user with civicStatus=CITIZEN and role=MODERATOR has the union
 * of CITIZEN capabilities + MODERATOR capabilities.
 */
export async function hasCapability(
  user: { role: string; civicStatus: string },
  capability: string
): Promise<boolean> {
  const matrix = await getPermissionMatrix()
  // Check both the CivicStatus row (VISITOR / CITIZEN) and UserRole row (USER / MODERATOR / ADMIN)
  const fromCivicStatus = matrix[user.civicStatus]?.[capability] ?? false
  const fromRole = matrix[user.role]?.[capability] ?? false
  return fromCivicStatus || fromRole
}

export async function getPermissionMatrix(): Promise<PermissionMatrix> {
  if (cachedMatrix) return cachedMatrix

  const rows = await prisma.roleCapability.findMany()

  // Build a lookup: role -> capability -> allowed
  const dbMap: PermissionMatrix = {}
  for (const row of rows) {
    if (!dbMap[row.role]) dbMap[row.role] = {}
    dbMap[row.role][row.capability] = row.allowed
  }

  // Merge against defaults so missing rows never cause undefined access
  const matrix: PermissionMatrix = {}
  for (const role of ROLES) {
    matrix[role] = {}
    for (const cap of ALL_CAPABILITIES) {
      matrix[role][cap.key] =
        dbMap[role]?.[cap.key] ?? DEFAULT_MATRIX[role]?.[cap.key] ?? false
    }
  }

  cachedMatrix = matrix
  return matrix
}

export async function updateCapability(
  role: string,
  capability: string,
  allowed: boolean,
  actor: { id: string; role: string; civicStatus: string }
): Promise<void> {
  const existing = await prisma.roleCapability.findUnique({
    where: { role_capability: { role, capability } }
  })
  const oldValue = existing?.allowed ?? false

  await prisma.roleCapability.upsert({
    where: { role_capability: { role, capability } },
    update: { allowed },
    create: { role, capability, allowed }
  })

  // Invalidate cache so next hasCapability() call reads fresh data
  cachedMatrix = null

  await logAction({
    userId: actor.id,
    action: 'ROLE_CAPABILITY_UPDATED',
    entityType: 'ROLE_CAPABILITY',
    entityId: `${role}:${capability}`,
    metadata: {
      role,
      capability,
      oldValue,
      newValue: allowed
    } as Prisma.InputJsonValue
  })
}
