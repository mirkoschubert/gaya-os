import { error, fail } from '@sveltejs/kit'
import { listUsers, setUserRole, setEmailVerified, deleteUser } from '$lib/server/services/users'
import { migrateOldCitizenIds } from '$lib/server/services/citizenship'
import { sendVerificationEmail } from '$lib/server/email'
import { createEmailVerificationToken } from 'better-auth/api'
import { auth } from '$lib/server/auth'
import { getBaseUrl } from '$lib/url'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
  return { users: await listUsers() }
}

export const actions: Actions = {
  setRole: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const userId = data.get('userId') as string
    const role = data.get('role') as 'USER' | 'MODERATOR' | 'ADMIN'
    if (!userId || !['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return fail(400, { message: 'Invalid input.' })
    }
    if (userId === locals.user.id) {
      return fail(400, { message: 'Cannot change your own role.' })
    }
    await setUserRole(userId, role, locals.user.id)
    return { success: true }
  },

  verifyEmail: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const userId = data.get('userId') as string
    if (!userId) return fail(400, { message: 'Missing userId.' })
    await setEmailVerified(userId, locals.user.id)
    return { success: true }
  },

  resendVerification: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const email = data.get('email') as string
    if (!email) return fail(400, { message: 'Missing email.' })

    try {
      const ctx = await auth.$context
      const token = await createEmailVerificationToken(ctx.secret, email)
      const url = `${getBaseUrl()}/api/auth/verify-email?token=${token}&callbackURL=%2Fdashboard`
      await sendVerificationEmail({ to: email, url })
      return { success: true }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unknown error'
      return fail(500, { message: `Resend error: ${message}` })
    }
  },

  migrateCitizenIds: async ({ locals }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const count = await migrateOldCitizenIds()
    return { success: true, migratedCount: count }
  },

  deleteUser: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const userId = data.get('userId') as string
    if (!userId) return fail(400, { message: 'Missing userId.' })
    if (userId === locals.user.id) {
      return fail(400, { message: 'Cannot delete your own account.' })
    }
    await deleteUser(userId)
    return { success: true }
  }
}
