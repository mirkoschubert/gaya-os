import { error, fail } from '@sveltejs/kit'
import { getPermissionMatrix, updateCapability } from '$lib/server/services/roles'
import type { PageServerLoad, Actions } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
  const matrix = await getPermissionMatrix()
  return { matrix }
}

export const actions: Actions = {
  toggleCapability: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')

    const data = await request.formData()
    const role = data.get('role') as string | null
    const capability = data.get('capability') as string | null
    const allowedRaw = data.get('allowed') as string | null

    if (!role || !capability || allowedRaw === null) {
      return fail(400, { message: 'Missing required fields' })
    }

    const allowed = allowedRaw === 'true'

    await updateCapability(role, capability, allowed, {
      id: locals.user.id,
      role: locals.user.role,
      civicStatus: locals.user.civicStatus
    })

    return { success: true }
  }
}
