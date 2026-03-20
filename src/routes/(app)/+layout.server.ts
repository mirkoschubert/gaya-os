import { redirect } from '@sveltejs/kit'
import { getPermissionMatrix } from '$lib/server/services/roles'
import { ALL_CAPABILITIES } from '$lib/domain/roles'
import { getCouncilMembershipsForUser } from '$lib/server/services/councils'
import { getUserChannels } from '$lib/server/services/messages'
import { getAllSettings } from '$lib/server/services/settings'
import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals }) => {
  if (!locals.user) redirect(302, '/auth/login')

  const [matrix, settings] = await Promise.all([
    getPermissionMatrix(),
    getAllSettings()
  ])

  // Build a flat capability map for this user: capability -> boolean
  // "highest right wins" — union of CivicStatus row and UserRole row
  const caps: Record<string, boolean> = {}
  for (const cap of ALL_CAPABILITIES) {
    caps[cap.key] =
      (matrix[locals.user.civicStatus]?.[cap.key] ?? false) ||
      (matrix[locals.user.role]?.[cap.key] ?? false)
  }

  // Visitors get chat access if the governance setting allows it
  const isVisitor = locals.user.civicStatus === 'VISITOR' && locals.user.role === 'USER'
  if (isVisitor && settings.chat.allowVisitors && settings.chat.visitorChannels !== 'none') {
    caps['can_send_messages'] = settings.chat.visitorChannels === 'readwrite'
    // Visitors always get read access when allowVisitors is on — widget must be shown
    // even for readonly, so we override can_send_messages only for write but show the widget
    // by setting a separate flag
    caps['can_view_messages'] = true
  }

  const [councilMemberships, chatChannels] = await Promise.all([
    getCouncilMembershipsForUser(locals.user.id),
    getUserChannels(locals.user.id)
  ])

  return {
    user: locals.user,
    caps,
    councilMemberships,
    isCouncilMember: councilMemberships.length > 0,
    chatChannels
  }
}
