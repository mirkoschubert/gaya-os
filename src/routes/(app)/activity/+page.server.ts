import { listActivity } from '$lib/server/services/audit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ url }) => {
  const cursor = url.searchParams.get('cursor') ?? undefined
  const prevCursor = url.searchParams.get('prev') ?? undefined
  const action = url.searchParams.get('action') ?? undefined
  const userId = url.searchParams.get('user') ?? undefined

  const page = await listActivity({ cursor, prevCursor, pageSize: 25, action, userId })

  return {
    ...page,
    filterAction: action ?? '',
    filterUser: userId ?? ''
  }
}
