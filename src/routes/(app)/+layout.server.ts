import { redirect } from '@sveltejs/kit'
import { getPermissionMatrix } from '$lib/server/services/roles'
import { ALL_CAPABILITIES } from '$lib/domain/roles'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/auth/login')

  const matrix = await getPermissionMatrix()

  // Build a flat capability map for this user: capability -> boolean
  // "highest right wins" — union of CivicStatus row and UserRole row
  const caps: Record<string, boolean> = {}
  for (const cap of ALL_CAPABILITIES) {
    caps[cap.key] =
      (matrix[locals.user.civicStatus]?.[cap.key] ?? false) ||
      (matrix[locals.user.role]?.[cap.key] ?? false)
  }

  return { user: locals.user, caps }
}
