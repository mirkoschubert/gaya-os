import type { Prisma } from '@prisma/client'
import { prisma } from '$lib/server/prisma'
import { logAction } from '$lib/server/services/audit'
import {
  DEFAULT_GOVERNANCE_SETTINGS,
  type GovernanceSettings,
  type VoteThreshold
} from '$lib/domain/settings'

export async function getAllSettings(): Promise<GovernanceSettings> {
  const rows = await prisma.systemSetting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))

  function get<T>(key: string, fallback: T): T {
    return map.has(key) ? (map.get(key) as T) : fallback
  }

  const d = DEFAULT_GOVERNANCE_SETTINGS

  return {
    council: {
      minSize: get('council.minSize', d.council.minSize),
      maxSize: get('council.maxSize', d.council.maxSize),
      termLimitMonths: get('council.termLimitMonths', d.council.termLimitMonths),
      requiresElection: get('council.requiresElection', d.council.requiresElection)
    },
    voting: {
      thresholds: {
        constitution: get<VoteThreshold>(
          'voting.thresholds.constitution',
          d.voting.thresholds.constitution
        ),
        policy: get<VoteThreshold>('voting.thresholds.policy', d.voting.thresholds.policy),
        budget: get<VoteThreshold>('voting.thresholds.budget', d.voting.thresholds.budget),
        election: get<VoteThreshold>('voting.thresholds.election', d.voting.thresholds.election)
      },
      minParticipationPercent: get(
        'voting.minParticipationPercent',
        d.voting.minParticipationPercent
      ),
      defaultDurationDays: get('voting.defaultDurationDays', d.voting.defaultDurationDays)
    },
    proposal: {
      minSupportCount: get('proposal.minSupportCount', d.proposal.minSupportCount),
      discussion: {
        minDays: get('proposal.discussion.minDays', d.proposal.discussion.minDays)
      }
    },
    engagement: {
      points: {
        PROPOSAL_CREATED: get(
          'engagement.points.PROPOSAL_CREATED',
          d.engagement.points.PROPOSAL_CREATED
        ),
        COMMENT_CREATED: get(
          'engagement.points.COMMENT_CREATED',
          d.engagement.points.COMMENT_CREATED
        ),
        VOTE_CAST: get('engagement.points.VOTE_CAST', d.engagement.points.VOTE_CAST),
        DELEGATION_RECEIVED: get(
          'engagement.points.DELEGATION_RECEIVED',
          d.engagement.points.DELEGATION_RECEIVED
        ),
        DOCUMENT_VERSION_AUTHORED: get(
          'engagement.points.DOCUMENT_VERSION_AUTHORED',
          d.engagement.points.DOCUMENT_VERSION_AUTHORED
        )
      }
    }
  }
}

export async function updateSetting(
  key: string,
  value: unknown,
  actor: { id: string; role: string; civicStatus: string }
): Promise<void> {
  const existing = await prisma.systemSetting.findUnique({ where: { key } })
  const oldValue = existing?.value ?? null

  const jsonValue = value as Prisma.InputJsonValue

  await prisma.systemSetting.upsert({
    where: { key },
    update: { value: jsonValue, updatedById: actor.id },
    create: { key, value: jsonValue, updatedById: actor.id }
  })

  await logAction({
    userId: actor.id,
    action: 'SYSTEM_SETTING_UPDATED',
    entityType: 'SYSTEM_SETTING',
    entityId: key,
    metadata: {
      key,
      oldValue: (oldValue ?? null) as Prisma.InputJsonValue,
      newValue: jsonValue,
      changedByRole: actor.role,
      changedByCivicStatus: actor.civicStatus
    }
  })
}
