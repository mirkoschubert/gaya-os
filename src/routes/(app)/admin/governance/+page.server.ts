import { error, fail } from '@sveltejs/kit'
import { getAllSettings, updateSetting } from '$lib/server/services/settings'
import { prisma } from '$lib/server/prisma'
import type { PageServerLoad, Actions } from './$types'
import type { VoteThreshold } from '$lib/domain/settings'

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
  const [settings, blacklist] = await Promise.all([
    getAllSettings(),
    prisma.usernameBlacklist.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, name: true, username: true } } }
    })
  ])
  return {
    settings,
    blacklist,
    nationStage: settings.nation.stage,
    membershipOpen: settings.citizenship.open
  }
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
  },

  updateUsername: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const cooldownDays = parseInt(data.get('changeCooldownDays') as string)
    if (isNaN(cooldownDays) || cooldownDays < 0) {
      return fail(400, { message: 'Invalid cooldown value.' })
    }

    await updateSetting('username.changeCooldownDays', cooldownDays, actor)
    return { success: true, tab: 'username' }
  },

  updateNation: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const stage = (data.get('stage') as string | null)?.trim() ?? ''
    const membershipOpen = data.get('membershipOpen') === 'true'

    if (!stage) return fail(400, { message: 'Stage label is required.', tab: 'nation' })

    await updateSetting('nation.stage', stage, actor)
    await updateSetting('citizenship.open', membershipOpen, actor)

    return { success: true, tab: 'nation' }
  },

  addBlacklistPattern: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()

    const pattern = (data.get('pattern') as string | null)?.trim() ?? ''
    const reason = (data.get('reason') as string | null)?.trim() || null

    if (!pattern) return fail(400, { message: 'Pattern is required.', tab: 'username' })

    // Validate regex if it looks like one
    if (/[[\]()+*?{}|\\^$]/.test(pattern)) {
      try { new RegExp(pattern, 'i') } catch {
        return fail(400, { message: 'Invalid regex pattern.', tab: 'username' })
      }
    }

    const existing = await prisma.usernameBlacklist.findUnique({ where: { pattern } })
    if (existing) return fail(400, { message: 'This pattern already exists.', tab: 'username' })

    await prisma.usernameBlacklist.create({
      data: { pattern, reason, createdById: locals.user!.id }
    })
    return { success: true, tab: 'username' }
  },

  deleteBlacklistPattern: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const id = (data.get('id') as string | null)?.trim() ?? ''
    if (!id) return fail(400, { message: 'Missing ID.', tab: 'username' })

    await prisma.usernameBlacklist.delete({ where: { id } })
    return { success: true, tab: 'username' }
  },

  updateChat: async ({ locals, request }) => {
    if (locals.user?.role !== 'ADMIN') error(403, 'Forbidden')
    const data = await request.formData()
    const actor = getActor(locals)

    const allowVisitors = data.get('allowVisitors') === 'true'
    const visitorChannels = data.get('visitorChannels') as string | null

    if (!['none', 'readonly', 'readwrite'].includes(visitorChannels ?? '')) {
      return fail(400, { message: 'Invalid visitor channel setting.' })
    }

    await updateSetting('chat.allowVisitors', allowVisitors, actor)
    await updateSetting('chat.visitorChannels', visitorChannels, actor)

    return { success: true, tab: 'chat' }
  }
}
