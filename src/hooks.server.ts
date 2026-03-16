import { auth } from '$lib/server/auth'
import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import { ADMIN_EMAIL } from '$env/static/private'
import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers
  })

  event.locals.session = session?.session ?? null
  event.locals.user = session?.user ?? null

  // Auto-promote the designated admin user on first login
  if (
    ADMIN_EMAIL &&
    session?.user &&
    session.user.email === ADMIN_EMAIL &&
    (session.user.role !== 'ADMIN' || session.user.civicStatus !== 'CITIZEN')
  ) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'ADMIN',
        civicStatus: 'CITIZEN',
        citizenId: 'CX-ADMIN-0001',
        joinedAt: session.user.joinedAt ?? new Date()
      }
    })
    await logAction({
      userId: session.user.id,
      action: 'ROLE_CHANGED',
      entityType: 'USER',
      entityId: session.user.id,
      metadata: { previousRole: session.user.role, newRole: 'ADMIN', trigger: 'auto_promotion' }
    })
    // Refresh locals with updated data
    const updated = await auth.api.getSession({
      headers: event.request.headers
    })
    event.locals.user = updated?.user ?? null
  }

  return resolve(event)
}
