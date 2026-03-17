// Pure domain types and constants for Governance Settings (SystemSetting).
// No Prisma, no HTTP — safe to import anywhere including client-side code.

export type VoteThresholdType = 'unanimous' | 'supermajority' | 'majority'

export interface VoteThreshold {
  type: VoteThresholdType
  percent?: number // only relevant for supermajority, e.g. 0.66 = 66%
}

export interface GovernanceSettings {
  council: {
    minSize: number
    maxSize: number
    termLimitMonths: number // 0 = unlimited
    requiresElection: boolean
  }
  voting: {
    thresholds: {
      constitution: VoteThreshold
      policy: VoteThreshold
      budget: VoteThreshold
      election: VoteThreshold
    }
    minParticipationPercent: number
    defaultDurationDays: number
  }
  proposal: {
    minSupportCount: number
    discussion: {
      minDays: number
    }
  }
  engagement: {
    points: {
      PROPOSAL_CREATED: number
      COMMENT_CREATED: number
      VOTE_CAST: number
      DELEGATION_RECEIVED: number
      DOCUMENT_VERSION_AUTHORED: number
    }
  }
}

export const DEFAULT_GOVERNANCE_SETTINGS: GovernanceSettings = {
  council: {
    minSize: 3,
    maxSize: 11,
    termLimitMonths: 24,
    requiresElection: false
  },
  voting: {
    thresholds: {
      constitution: { type: 'unanimous' },
      policy: { type: 'supermajority', percent: 0.66 },
      budget: { type: 'majority' },
      election: { type: 'majority' }
    },
    minParticipationPercent: 10,
    defaultDurationDays: 7
  },
  proposal: {
    minSupportCount: 5,
    discussion: {
      minDays: 3
    }
  },
  engagement: {
    points: {
      PROPOSAL_CREATED: 5,
      COMMENT_CREATED: 1,
      VOTE_CAST: 2,
      DELEGATION_RECEIVED: 1,
      DOCUMENT_VERSION_AUTHORED: 10
    }
  }
}

export type SettingKey =
  | 'council.minSize'
  | 'council.maxSize'
  | 'council.termLimitMonths'
  | 'council.requiresElection'
  | 'voting.thresholds.constitution'
  | 'voting.thresholds.policy'
  | 'voting.thresholds.budget'
  | 'voting.thresholds.election'
  | 'voting.minParticipationPercent'
  | 'voting.defaultDurationDays'
  | 'proposal.minSupportCount'
  | 'proposal.discussion.minDays'
  | 'engagement.points'

export interface SystemSettingUpdatedMeta {
  key: string
  oldValue: unknown
  newValue: unknown
  changedByRole: string
  changedByCivicStatus: string
}
