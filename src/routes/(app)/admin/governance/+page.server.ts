import { error, fail } from '@sveltejs/kit'
import { getAllSettings, updateSetting } from '$lib/server/services/settings'
import type { PageServerLoad, Actions } from './$types'
import type { VoteThreshold } from '$lib/domain/settings'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
  const settings = await getAllSettings()
  return { settings }
}

function getActor(locals: App.Locals) {
  return {
    id: locals.user!.id,
    role: locals.user!.role,
    civicStatus: locals.user!.civicStatus
  }
}

export const actions: Actions = {
  updateCouncil: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const minSize = parseInt(data.get('minSize') as string)
    const maxSize = parseInt(data.get('maxSize') as string)
    const termLimitMonths = parseInt(data.get('termLimitMonths') as string)
    const requiresElection = data.get('requiresElection') === 'true'

    if (isNaN(minSize) || isNaN(maxSize) || isNaN(termLimitMonths)) {
      return fail(400, { message: 'Invalid numeric values' })
    }
    if (minSize < 1 || maxSize < minSize) {
      return fail(400, { message: 'maxSize must be >= minSize and minSize >= 1' })
    }

    await updateSetting('council.minSize', minSize, actor)
    await updateSetting('council.maxSize', maxSize, actor)
    await updateSetting('council.termLimitMonths', termLimitMonths, actor)
    await updateSetting('council.requiresElection', requiresElection, actor)

    return { success: true, tab: 'councils' }
  },

  updateVoting: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    function parseThreshold(prefix: string): VoteThreshold {
      const type = data.get(`${prefix}Type`) as string
      const percentRaw = data.get(`${prefix}Percent`) as string | null
      const threshold: VoteThreshold = { type: type as VoteThreshold['type'] }
      if (type === 'supermajority' && percentRaw) {
        threshold.percent = parseFloat(percentRaw)
      }
      return threshold
    }

    const minParticipation = parseInt(data.get('minParticipationPercent') as string)
    const defaultDuration = parseInt(data.get('defaultDurationDays') as string)

    if (isNaN(minParticipation) || isNaN(defaultDuration)) {
      return fail(400, { message: 'Invalid numeric values' })
    }

    await updateSetting('voting.thresholds.constitution', parseThreshold('constitution'), actor)
    await updateSetting('voting.thresholds.policy', parseThreshold('policy'), actor)
    await updateSetting('voting.thresholds.budget', parseThreshold('budget'), actor)
    await updateSetting('voting.thresholds.election', parseThreshold('election'), actor)
    await updateSetting('voting.minParticipationPercent', minParticipation, actor)
    await updateSetting('voting.defaultDurationDays', defaultDuration, actor)

    return { success: true, tab: 'voting' }
  },

  updateProposals: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const minSupportCount = parseInt(data.get('minSupportCount') as string)
    const minDays = parseInt(data.get('minDays') as string)

    if (isNaN(minSupportCount) || isNaN(minDays)) {
      return fail(400, { message: 'Invalid numeric values' })
    }

    await updateSetting('proposal.minSupportCount', minSupportCount, actor)
    await updateSetting('proposal.discussion.minDays', minDays, actor)

    return { success: true, tab: 'proposals' }
  },

  updateEngagement: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const fields = [
      'PROPOSAL_CREATED',
      'COMMENT_CREATED',
      'VOTE_CAST',
      'DELEGATION_RECEIVED',
      'DOCUMENT_VERSION_AUTHORED'
    ] as const

    for (const field of fields) {
      const val = parseInt(data.get(field) as string)
      if (isNaN(val) || val < 0) {
        return fail(400, { message: `Invalid value for ${field}` })
      }
      await updateSetting(`engagement.points.${field}`, val, actor)
    }

    return { success: true, tab: 'engagement' }
  }
}
