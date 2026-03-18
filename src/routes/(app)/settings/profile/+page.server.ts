import { fail, redirect } from '@sveltejs/kit'
import { changeUsername, isUsernameOnCooldown } from '$lib/server/services/username'
import { deleteUser } from '$lib/server/services/users'
import { cancelCitizenship } from '$lib/server/services/citizenship'
import { getAllSettings } from '$lib/server/services/settings'
import { prisma } from '$lib/server/prisma'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  const [cooldown, memberships, settings] = await Promise.all([
    isUsernameOnCooldown(locals.user!.id),
    prisma.membership.findMany({
      where: { userId: locals.user!.id, role: 'COUNCIL_MEMBER' },
      select: { id: true, unit: { select: { name: true } } }
    }),
    getAllSettings()
  ])

  // Determine if the user is a council member and whether the grace period has elapsed
  const councilGracePeriodDays = settings.citizenship.councilGracePeriodDays
  let councilGraceAvailableAt: string | null = null

  if (memberships.length > 0) {
    // Find the most recent council membership start date as the reference point
    const oldestMembership = await prisma.membership.findFirst({
      where: { userId: locals.user!.id, role: 'COUNCIL_MEMBER' },
      orderBy: { joinedAt: 'asc' },
      select: { joinedAt: true }
    })
    if (oldestMembership) {
      const availableAt = new Date(oldestMembership.joinedAt)
      availableAt.setDate(availableAt.getDate() + councilGracePeriodDays)
      // Only show a future date — if it's in the past the grace period is already over
      if (availableAt > new Date()) {
        councilGraceAvailableAt = availableAt.toISOString()
      }
    }
  }

  return {
    usernameCooldown: {
      onCooldown: cooldown.onCooldown,
      availableAt: cooldown.availableAt?.toISOString() ?? null
    },
    councilMemberships: memberships.map((m) => m.unit.name),
    councilGracePeriodDays,
    councilGraceAvailableAt
  }
}

export const actions: Actions = {
  changeUsername: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Unauthorized' })

    const data = await request.formData()
    const newUsername = (data.get('username') as string | null)?.trim() ?? ''
    const currentUsername = (data.get('currentUsername') as string | null)?.trim() ?? ''

    if (!newUsername) return fail(400, { error: 'Username is required.' })

    if (newUsername === currentUsername) return { success: true }

    try {
      await changeUsername(locals.user.id, newUsername, currentUsername)
      return { success: true }
    } catch (e) {
      return fail(400, { error: (e as Error).message })
    }
  },

  cancelCitizenship: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Unauthorized' })

    const data = await request.formData()
    const confirmation = (data.get('confirmation') as string | null)?.trim() ?? ''

    const expected = locals.user.username ?? locals.user.email
    if (confirmation !== expected) {
      return fail(400, { cancelError: 'Confirmation does not match.' })
    }

    // Council members must wait out the grace period
    const [memberships, settings] = await Promise.all([
      prisma.membership.findMany({
        where: { userId: locals.user.id, role: 'COUNCIL_MEMBER' },
        orderBy: { joinedAt: 'asc' },
        select: { joinedAt: true, unit: { select: { name: true } } }
      }),
      getAllSettings()
    ])

    if (memberships.length > 0) {
      const oldest = memberships[0]
      const availableAt = new Date(oldest.joinedAt)
      availableAt.setDate(availableAt.getDate() + settings.citizenship.councilGracePeriodDays)
      if (availableAt > new Date()) {
        return fail(400, {
          cancelError: `You are a council member. You can cancel your citizenship from ${availableAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} onward.`
        })
      }
    }

    try {
      await cancelCitizenship(locals.user.id)
      return { cancelSuccess: true }
    } catch (e) {
      return fail(400, { cancelError: (e as Error).message })
    }
  },

  deleteAccount: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { error: 'Unauthorized' })

    const data = await request.formData()
    const confirmation = (data.get('confirmation') as string | null)?.trim() ?? ''

    const expected = locals.user.username ?? locals.user.email
    if (confirmation !== expected) {
      return fail(400, { deleteError: 'Confirmation does not match.' })
    }

    // Citizens must cancel citizenship first
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: locals.user.id },
      select: { civicStatus: true }
    })
    if (user.civicStatus === 'CITIZEN') {
      return fail(400, {
        deleteError: 'You must cancel your citizenship before deleting your account.'
      })
    }

    // Council members are blocked regardless (they need to resign and wait the grace period)
    const councilMemberships = await prisma.membership.findMany({
      where: { userId: locals.user.id, role: 'COUNCIL_MEMBER' },
      select: { unit: { select: { name: true } } }
    })
    if (councilMemberships.length > 0) {
      const names = councilMemberships.map((m) => m.unit.name).join(', ')
      return fail(400, {
        deleteError: `You are a council member in: ${names}. Please resign before deleting your account.`
      })
    }

    await deleteUser(locals.user.id)

    redirect(302, '/auth/register')
  }
}
