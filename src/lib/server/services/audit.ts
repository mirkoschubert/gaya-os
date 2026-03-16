import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server/prisma'
import type { AuditAction, ActivityEntry, ActivityPage } from '$lib/domain/audit'

export type { AuditAction, ActivityEntry, ActivityPage }

export interface LogActionParams {
  userId?: string | null
  action: AuditAction
  entityType?: string
  entityId?: string
  metadata?: Prisma.InputJsonValue
}

export async function logAction(params: LogActionParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      metadata: params.metadata ?? undefined
    }
  })
}

const USER_SELECT = {
  id: true,
  name: true,
  civicStatus: true,
  role: true,
  username: true
} as const

export async function listActivity(options?: {
  cursor?: string        // id of last seen entry (for next page)
  prevCursor?: string    // id to seek backwards from
  pageSize?: number
  action?: string
  userId?: string
}): Promise<ActivityPage> {
  const pageSize = options?.pageSize ?? 25

  const where = {
    ...(options?.action ? { action: options.action } : {}),
    ...(options?.userId ? { userId: options.userId } : {})
  }

  // Fetch one extra to know if there's a next page
  const entries = await prisma.auditLog.findMany({
    where: {
      ...where,
      ...(options?.cursor ? { id: { lt: options.cursor } } : {}),
      ...(options?.prevCursor ? { id: { gte: options.prevCursor } } : {})
    },
    take: options?.prevCursor ? -(pageSize + 1) : pageSize + 1,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: USER_SELECT } }
  })

  // Going forward
  if (!options?.prevCursor) {
    const hasMore = entries.length > pageSize
    const page = hasMore ? entries.slice(0, pageSize) : entries
    return {
      entries: page as ActivityEntry[],
      nextCursor: hasMore ? page[page.length - 1].id : null,
      prevCursor: options?.cursor ?? null
    }
  }

  // Going backward (take was negative, results come back in ascending order — reverse)
  const reversed = entries.reverse()
  const hasPrev = reversed.length > pageSize
  const page = hasPrev ? reversed.slice(1) : reversed
  return {
    entries: page as ActivityEntry[],
    nextCursor: page[page.length - 1]?.id ?? null,
    prevCursor: hasPrev ? page[0].id : null
  }
}
